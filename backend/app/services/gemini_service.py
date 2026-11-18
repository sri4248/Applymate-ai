import google.generativeai as genai
import json
import re
import asyncio
from app.config import settings
from typing import Dict, Any

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

# How long to wait for a single Gemini response (seconds)
GEMINI_TIMEOUT = 90


def clean_json_response(text: str) -> str:
    """Remove markdown code blocks from Gemini response"""
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    return text.strip()


def _call_gemini(prompt: str) -> str:
    """
    Synchronous Gemini call.
    Wrapped with asyncio.to_thread() to avoid blocking the event loop.
    Raises RuntimeError for quota/rate-limit errors so callers can show friendly messages.
    """
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=2048,
                temperature=0.3,
            ),
        )
        return response.text
    except Exception as e:
        err = str(e)
        # Quota / rate-limit → surface as a recognisable error type
        if '429' in err or 'quota' in err.lower() or 'rate' in err.lower():
            raise RuntimeError(
                "QUOTA_EXCEEDED: You have hit the Gemini API daily limit on the free tier. "
                "Please wait a few hours or upgrade your Google AI Studio plan."
            )
        raise


async def _call_gemini_async(prompt: str) -> str:
    """Run the synchronous Gemini call in a thread with a timeout guard."""
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(_call_gemini, prompt),
            timeout=GEMINI_TIMEOUT,
        )
    except asyncio.TimeoutError:
        raise RuntimeError(
            f"TIMEOUT: Gemini did not respond within {GEMINI_TIMEOUT} seconds. "
            "Please try again — the model may be under heavy load."
        )


async def analyze_job_match(resume_text: str, job_description: str) -> Dict[str, Any]:
    """Compare resume skills with job description and return match analysis"""
    prompt = f"""
You are an expert HR analyst and ATS system. Analyze the resume vs job description and return ONLY valid JSON.

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

Return this exact JSON structure:
{{
  "match_score": <number 0-100>,
  "matching_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "recommendation": "<apply/consider/not recommended>",
  "summary": "<2-3 sentence summary>"
}}
"""
    raw = await _call_gemini_async(prompt)
    cleaned = clean_json_response(raw)
    return json.loads(cleaned)


async def generate_prep_toolkit(job_description: str, resume_text: str = "") -> Dict[str, Any]:
    """Generate interview preparation material based on JD"""
    prompt = f"""
You are an expert interview coach. Based on this job description, generate preparation material and return ONLY valid JSON.

JOB DESCRIPTION:
{job_description[:2000]}

RESUME CONTEXT:
{resume_text[:1000] if resume_text else 'Not provided'}

Return this exact JSON structure:
{{
  "technical_questions": ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?", "Q6?", "Q7?", "Q8?", "Q9?", "Q10?"],
  "aptitude_topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "preparation_tips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "estimated_difficulty": "<Easy/Medium/Hard>"
}}
"""
    raw = await _call_gemini_async(prompt)
    cleaned = clean_json_response(raw)
    return json.loads(cleaned)


async def analyze_email(email_content: str) -> Dict[str, Any]:
    """Analyze a recruitment email and classify it"""
    prompt = f"""
You are an expert at analyzing recruitment emails. Analyze this email and return ONLY valid JSON.

EMAIL CONTENT:
{email_content[:3000]}

Return this exact JSON structure:
{{
  "email_type": "<interview_call|assessment|rejection|offer|follow_up|other>",
  "company_name": "<company name or null>",
  "action_required": "<what the job seeker should do>",
  "deadline": "<deadline date/time or null>",
  "summary": "<2-3 sentence plain English summary>",
  "sentiment": "<positive|negative|neutral>"
}}
"""
    raw = await _call_gemini_async(prompt)
    cleaned = clean_json_response(raw)
    return json.loads(cleaned)


async def suggest_resume_updates(resume_text: str, job_description: str) -> Dict[str, Any]:
    """Suggest resume improvements based on JD WITHOUT inventing skills"""
    prompt = f"""
You are an expert resume consultant. Suggest improvements to match the job description.
IMPORTANT: Do NOT invent skills or experiences. Only suggest improvements to EXISTING content.

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

Return this exact JSON structure:
{{
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "keywords_to_add": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "sections_to_improve": ["section1", "section2", "section3"],
  "overall_feedback": "<2-3 sentence overall assessment>"
}}
"""
    raw = await _call_gemini_async(prompt)
    cleaned = clean_json_response(raw)
    return json.loads(cleaned)


async def analyze_job_url(job_url: str, resume_text: str) -> Dict[str, Any]:
    """Analyze a job URL for auto-apply eligibility"""
    prompt = f"""
You are an AI job application assistant. Analyze this job application scenario.

Job URL: {job_url}
Resume Summary: {resume_text[:1500]}

Since I cannot browse URLs, provide a structured analysis assuming the job is from the URL domain.
Return this exact JSON structure:
{{
  "job_title": "<estimated job title from URL>",
  "company_name": "<company from URL domain>",
  "is_eligible": true,
  "match_score": 75.0,
  "eligibility_reason": "<reason for eligibility assessment>",
  "application_details": {{
    "cover_letter_needed": true,
    "portfolio_needed": false,
    "references_needed": false
  }},
  "requires_approval": true
}}
"""
    raw = await _call_gemini_async(prompt)
    cleaned = clean_json_response(raw)
    return json.loads(cleaned)
