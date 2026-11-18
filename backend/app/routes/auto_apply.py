from fastapi import APIRouter, HTTPException
from app.schemas.ai import AutoApplyRequest, AutoApplyAnalysis
from app.services.gemini_service import analyze_job_url

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


@router.post("/auto-apply/analyze", response_model=AutoApplyAnalysis)
async def analyze_for_auto_apply(request: AutoApplyRequest):
    """Analyze a job URL and check eligibility before applying"""
    try:
        result = await analyze_job_url(request.job_url, request.resume_text)
        return result
    except Exception as e:
        raise _ai_error("Auto-apply analysis failed", e)


@router.post("/auto-apply/submit")
async def submit_application(request: AutoApplyRequest):
    """Submit job application ONLY after user explicit approval"""
    # This endpoint simulates submission - real integration would connect to job boards
    return {
        "status": "submitted",
        "message": "Application submitted successfully (simulation mode). Real submission requires job board API integration.",
        "job_url": request.job_url
    }
