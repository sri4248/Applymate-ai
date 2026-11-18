from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.config import settings
from app.database import init_db

# ✅ Import models BEFORE init_db so SQLAlchemy knows about the tables
from app.models import JobApplication, Resume, User  # noqa: F401
from app.routes import jobs, ai_match, prep_toolkit, email_analyzer, resume_updater, auto_apply
from app.routes import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle (replaces deprecated @on_event)"""
    init_db()
    print("✅ ApplyMate AI Backend started successfully!")
    print("📚 API Docs: http://localhost:8000/docs")
    yield
    # Shutdown logic (if needed) goes here


# Initialize FastAPI app
app = FastAPI(
    title="ApplyMate AI API",
    description="AI-powered job application assistant backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - Allow frontend to call backend
_raw_origins = settings.ALLOWED_ORIGINS.strip()
_allow_all = _raw_origins == "*"
_origins_list = ["*"] if _allow_all else [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins_list,
    allow_credentials=not _allow_all,  # credentials can't be used with wildcard
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(ai_match.router)
app.include_router(prep_toolkit.router)
app.include_router(email_analyzer.router)
app.include_router(resume_updater.router)
app.include_router(auto_apply.router)


@app.get("/")
def root():
    return {"message": "ApplyMate AI API is running!", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ApplyMate AI Backend"}
