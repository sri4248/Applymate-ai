from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from app.database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False)
    job_title = Column(String(200), nullable=False)
    job_url = Column(Text, nullable=True)
    job_description = Column(Text, nullable=True)
    status = Column(String(50), default="applied")  # applied, shortlisted, interview, rejected, offered
    match_score = Column(Float, nullable=True)
    applied_date = Column(DateTime, default=func.now())
    notes = Column(Text, nullable=True)
    salary_range = Column(String(100), nullable=True)
    location = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
