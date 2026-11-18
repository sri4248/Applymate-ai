from fastapi import APIRouter, HTTPException
from app.schemas.ai import PrepToolkitRequest, PrepToolkitResponse
from app.services.gemini_service import generate_prep_toolkit

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


@router.post("/prep", response_model=PrepToolkitResponse)
async def get_prep_toolkit(request: PrepToolkitRequest):
    """Generate interview preparation material based on job description"""
    try:
        result = await generate_prep_toolkit(request.job_description, request.resume_text or "")
        return result
    except Exception as e:
        raise _ai_error("AI prep generation failed", e)
