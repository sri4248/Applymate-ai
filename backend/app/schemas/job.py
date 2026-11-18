from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    status: str = "applied"
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None

class JobApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None
    match_score: Optional[float] = None

class JobApplicationResponse(BaseModel):
    id: int
    company_name: str
    job_title: str
    job_url: Optional[str]
    status: str
    match_score: Optional[float]
    applied_date: Optional[datetime]
    notes: Optional[str]
    salary_range: Optional[str]
    location: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
