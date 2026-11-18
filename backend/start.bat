@echo off
echo Starting ApplyMate AI Backend...
echo.
call venv\Scripts\activate.bat 2>nul || (echo Creating virtual environment... && python -m venv venv && call venv\Scripts\activate.bat)
echo Installing dependencies...
pip install -r requirements.txt -q
echo.
echo Backend starting at http://localhost:8000
echo API Docs at http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
