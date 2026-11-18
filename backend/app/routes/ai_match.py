from fastapi import APIRouter, HTTPException
from app.schemas.ai import MatchAnalysisRequest, MatchAnalysisResponse
from app.services.gemini_service import analyze_job_match

router = APIRouter(prefix="/api/ai", tags=["ai"])


def _ai_error(label: str, e: Exception) -> HTTPException:
    """Convert Gemini errors into clean, user-readable HTTP responses."""
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


@router.post("/match", response_model=MatchAnalysisResponse)
async def match_resume_to_job(request: MatchAnalysisRequest):
    """Analyze resume vs job description and return match score"""
    try:
        result = await analyze_job_match(request.resume_text, request.job_description)
        return result
    except Exception as e:
        raise _ai_error("AI analysis failed", e)
