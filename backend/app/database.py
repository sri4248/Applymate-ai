from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings
import os

# Build the SQLite URL correctly:
# If the config value is already an absolute path keep it, otherwise treat it as relative.
_db_path = settings.DATABASE_URL
if not _db_path.startswith("sqlite"):
    # Resolve relative path to absolute so SQLite always finds the file
    _db_path = os.path.abspath(_db_path)
    DATABASE_URL = f"sqlite:///{_db_path}"
else:
    DATABASE_URL = _db_path  # already a full sqlite:/// URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create uploads directory and all database tables"""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # NOTE: Models must be imported before this is called (done in main.py)
    Base.metadata.create_all(bind=engine)
