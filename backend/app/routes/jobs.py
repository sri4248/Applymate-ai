from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import os
import httpx
import tempfile

from app.database import get_db
from app.models.job import JobApplication
from app.models.resume import Resume
from app.schemas.job import JobApplicationCreate, JobApplicationUpdate, JobApplicationResponse
from app.services.resume_parser import (
    extract_resume_text,
    extract_drive_file_id,
    is_google_docs_url,
)
from app.config import settings

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


# ─────────────────────────────────────────────────────────────────────────────
# STATIC ROUTES — must come BEFORE /{job_id} to avoid route-matching conflicts
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_job_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    total = db.query(JobApplication).count()
    applied = db.query(JobApplication).filter(JobApplication.status == "applied").count()
    shortlisted = db.query(JobApplication).filter(JobApplication.status == "shortlisted").count()
    interview = db.query(JobApplication).filter(JobApplication.status == "interview").count()
    rejected = db.query(JobApplication).filter(JobApplication.status == "rejected").count()
    offered = db.query(JobApplication).filter(JobApplication.status == "offered").count()
    return {
        "total": total,
        "applied": applied,
        "shortlisted": shortlisted,
        "interview": interview,
        "rejected": rejected,
        "offered": offered,
    }


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a resume file (PDF, DOCX, or DOC) and extract its text.
    Max file size: 10 MB.
    """
    ALLOWED_TYPES = {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc": "application/msword",
    }
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, and DOC files are supported.",
        )

    contents = await file.read()
    max_bytes = 10 * 1024 * 1024  # 10 MB
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail="File too large. Max 10 MB allowed.")

    # Save file to uploads directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Extract text
    extracted_text = extract_resume_text(file_path)
    if not extracted_text:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from the file. Make sure the file is not password-protected or image-only.",
        )

    # Save or update resume record in database
    resume = Resume(
        filename=file.filename,
        file_path=file_path,
        extracted_text=extracted_text,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "message": "Resume uploaded successfully",
        "filename": file.filename,
        "file_type": ext.lstrip(".").upper(),
        "extracted_text": extracted_text,
        "resume_id": resume.id,
    }


class DriveUploadRequest(BaseModel):
    drive_url: str


@router.post("/upload-drive")
async def upload_resume_from_drive(request: DriveUploadRequest, db: Session = Depends(get_db)):
    """
    Import a resume from a Google Drive shareable link.
    The file must be publicly accessible (Anyone with link can view).
    Supports Drive files (PDF, DOCX) and Google Docs.
    """
    drive_url = request.drive_url.strip()

    # --- Extract file ID from URL ---
    file_id = extract_drive_file_id(drive_url)
    if not file_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid Google Drive URL. Please use a shareable link (e.g. drive.google.com/file/d/...)",
        )

    # --- Determine download URL and filename based on Drive URL type ---
    if is_google_docs_url(drive_url):
        # Google Docs → export as plain text
        download_url = f"https://docs.google.com/document/d/{file_id}/export?format=txt"
        filename = f"gdoc_{file_id}.txt"
        expected_ext = ".txt"
    else:
        # Regular Drive file → direct download
        download_url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm=t"
        filename = None  # will be inferred from Content-Disposition header
        expected_ext = None

    # --- Download the file ---
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(download_url)

            if response.status_code == 403:
                raise HTTPException(
                    status_code=403,
                    detail="Access denied. Make sure the file is shared as 'Anyone with the link can view'.",
                )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail=f"Could not download the file from Google Drive (HTTP {response.status_code}).",
                )

            # Detect filename and extension from Content-Disposition header
            content_disposition = response.headers.get("content-disposition", "")
            if not filename:
                if 'filename="' in content_disposition:
                    filename = content_disposition.split('filename="')[1].rstrip('"').rstrip('"')
                elif "filename*=" in content_disposition:
                    filename = content_disposition.split("filename*=UTF-8''")[-1]
                else:
                    # Guess from Content-Type
                    content_type = response.headers.get("content-type", "")
                    if "pdf" in content_type:
                        filename = f"drive_{file_id}.pdf"
                    elif "wordprocessingml" in content_type or "msword" in content_type:
                        filename = f"drive_{file_id}.docx"
                    else:
                        filename = f"drive_{file_id}.pdf"  # default to pdf

            file_bytes = response.content

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Download timed out. Try again later.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to download from Drive: {str(e)}")

    # Validate file size
    max_bytes = 10 * 1024 * 1024  # 10 MB
    if len(file_bytes) > max_bytes:
        raise HTTPException(status_code=400, detail="Drive file too large. Max 10 MB allowed.")

    # --- Save to uploads directory ---
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # --- Extract text ---
    extracted_text = extract_resume_text(file_path)
    if not extracted_text:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from the Drive file. Make sure it's a readable PDF or DOCX, not an image scan.",
        )

    # --- Save to database ---
    resume = Resume(
        filename=filename,
        file_path=file_path,
        extracted_text=extracted_text,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    ext = os.path.splitext(filename)[1].lower()
    return {
        "message": "Resume imported from Google Drive successfully",
        "filename": filename,
        "file_type": ext.lstrip(".").upper(),
        "extracted_text": extracted_text,
        "resume_id": resume.id,
    }


@router.get("/resume/latest")
def get_latest_resume(db: Session = Depends(get_db)):
    """Get the most recently uploaded resume"""
    resume = db.query(Resume).order_by(Resume.uploaded_at.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    return {
        "resume_id": resume.id,
        "filename": resume.filename,
        "extracted_text": resume.extracted_text,
        "uploaded_at": resume.uploaded_at,
    }


# ─────────────────────────────────────────────────────────────────────────────
# DYNAMIC ROUTES — come AFTER all static routes
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[JobApplicationResponse])
def get_all_jobs(db: Session = Depends(get_db)):
    """Get all job applications"""
    return db.query(JobApplication).order_by(JobApplication.created_at.desc()).all()


@router.post("/", response_model=JobApplicationResponse)
def create_job(job: JobApplicationCreate, db: Session = Depends(get_db)):
    """Add a new job application"""
    db_job = JobApplication(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


@router.put("/{job_id}", response_model=JobApplicationResponse)
def update_job(job_id: int, job: JobApplicationUpdate, db: Session = Depends(get_db)):
    """Update a job application"""
    db_job = db.query(JobApplication).filter(JobApplication.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    for field, value in job.model_dump(exclude_unset=True).items():
        setattr(db_job, field, value)
    db.commit()
    db.refresh(db_job)
    return db_job


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    """Delete a job application"""
    db_job = db.query(JobApplication).filter(JobApplication.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(db_job)
    db.commit()
    return {"message": "Job deleted successfully"}
