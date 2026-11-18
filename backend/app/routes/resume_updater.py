from fastapi import APIRouter, HTTPException
from app.schemas.ai import ResumeUpdateRequest, ResumeUpdateResponse
from app.services.gemini_service import suggest_resume_updates

router = APIRouter(prefix="/api/ai", tags=["ai"])


def _ai_error(label: str, e: Exception) -> HTTPException:
    msg = str(e)
    if msg.startswith("QUOTA_EXCEEDED"):
        return HTTPException(status_code=429, detail=(
            "⚠️ Gemini API daily quota exceeded on the free tier. "
            "Please wait a few hours before retrying, or upgrade your Google AI Studio plan."
        ))
    if msg.startswith("TIMEOUT"):
        return HTTPException(status_code=504, detail=(
            "⏱️ The AI took too long to respond. Please try again in a moment."
        ))
    return HTTPException(status_code=500, detail=f"{label}: {msg}")


@router.post("/resume-update", response_model=ResumeUpdateResponse)
async def get_resume_update_suggestions(request: ResumeUpdateRequest):
    """Suggest resume improvements based on job description"""
    try:
        result = await suggest_resume_updates(request.resume_text, request.job_description)
        return result
    except Exception as e:
        raise _ai_error("Resume update analysis failed", e)
