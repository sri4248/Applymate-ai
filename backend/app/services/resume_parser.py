import pdfplumber
import os
import re
from typing import Optional

# python-docx for Word document parsing
try:
    from docx import Document as DocxDocument
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    print("⚠️  python-docx not installed. DOCX support disabled. Run: pip install python-docx")


def extract_text_from_pdf(file_path: str) -> Optional[str]:
    """Extract text content from a PDF resume using pdfplumber"""
    try:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip() if text.strip() else None
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return None


def extract_text_from_docx(file_path: str) -> Optional[str]:
    """Extract text content from a DOCX/DOC resume using python-docx"""
    if not DOCX_AVAILABLE:
        return "DOCX parsing not available. Please install python-docx."
    try:
        doc = DocxDocument(file_path)
        paragraphs = []
        for para in doc.paragraphs:
            text = para.text.strip()
            if text:
                paragraphs.append(text)
        # Also extract text from tables
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(
                    cell.text.strip() for cell in row.cells if cell.text.strip()
                )
                if row_text:
                    paragraphs.append(row_text)
        full_text = "\n".join(paragraphs)
        return full_text.strip() if full_text.strip() else None
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return None


def extract_text_from_txt(file_path: str) -> Optional[str]:
    """Extract text from a plain text file"""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read().strip()
    except Exception as e:
        print(f"Error reading text file: {e}")
        return None


def extract_resume_text(file_path: str) -> Optional[str]:
    """Auto-detect file type and extract text from resume"""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext in ['.docx', '.doc']:
        return extract_text_from_docx(file_path)
    elif ext in ['.txt', '.md']:
        return extract_text_from_txt(file_path)
    else:
        return None


def extract_drive_file_id(drive_url: str) -> Optional[str]:
    """
    Extract the Google Drive file ID from various Drive URL formats.

    Supported formats:
    - https://drive.google.com/file/d/FILE_ID/view
    - https://drive.google.com/open?id=FILE_ID
    - https://docs.google.com/document/d/FILE_ID/edit
    - https://drive.google.com/uc?id=FILE_ID
    """
    patterns = [
        r"/file/d/([a-zA-Z0-9_-]{20,})",         # /file/d/FILE_ID
        r"[?&]id=([a-zA-Z0-9_-]{20,})",           # ?id= or &id=
        r"/document/d/([a-zA-Z0-9_-]{20,})",      # Google Docs
        r"/spreadsheets/d/([a-zA-Z0-9_-]{20,})",  # Google Sheets
    ]
    for pattern in patterns:
        match = re.search(pattern, drive_url)
        if match:
            return match.group(1)
    return None


def is_google_docs_url(drive_url: str) -> bool:
    """Check if the URL is a Google Docs (not Drive) URL"""
    return "docs.google.com/document" in drive_url
