from pydantic import BaseModel
from typing import Optional, List

class MatchAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str

class MatchAnalysisResponse(BaseModel):
    match_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    recommendation: str
    summary: str

class PrepToolkitRequest(BaseModel):
    job_description: str
    resume_text: Optional[str] = None

class PrepToolkitResponse(BaseModel):
    technical_questions: List[str]
    aptitude_topics: List[str]
    preparation_tips: List[str]
    estimated_difficulty: str

class EmailAnalyzeRequest(BaseModel):
    email_content: str

class EmailAnalyzeResponse(BaseModel):
    email_type: str  # interview_call, assessment, rejection, offer, other
    company_name: Optional[str]
    action_required: str
    deadline: Optional[str]
    summary: str
    sentiment: str

class ResumeUpdateRequest(BaseModel):
    resume_text: str
    job_description: str

class ResumeUpdateResponse(BaseModel):
    suggestions: List[str]
    keywords_to_add: List[str]
    sections_to_improve: List[str]
    overall_feedback: str

class AutoApplyRequest(BaseModel):
    job_url: str
    resume_text: str

class AutoApplyAnalysis(BaseModel):
    job_title: str
    company_name: str
    is_eligible: bool
    match_score: float
    eligibility_reason: str
    application_details: dict
    requires_approval: bool = True
