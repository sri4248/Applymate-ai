from fastapi import APIRouter, HTTPException
from app.schemas.ai import EmailAnalyzeRequest, EmailAnalyzeResponse
from app.services.gemini_service import analyze_email

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


@router.post("/email", response_model=EmailAnalyzeResponse)
async def analyze_recruitment_email(request: EmailAnalyzeRequest):
    """Analyze a recruitment email and classify it"""
    try:
        result = await analyze_email(request.email_content)
        return result
    except Exception as e:
        raise _ai_error("Email analysis failed", e)
