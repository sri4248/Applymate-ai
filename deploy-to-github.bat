@echo off
title ApplyMate AI — Auto Deploy to GitHub
color 0A
echo.
echo ========================================
echo   ApplyMate AI — GitHub Push Script
echo ========================================
echo.

cd /d "%~dp0"

REM Check git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed!
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/5] Initializing git repository...
git init
if %errorlevel% neq 0 (
    echo [INFO] Git already initialized, continuing...
)

echo.
echo [2/5] Staging all files...
git add .
echo Done.

echo.
echo [3/5] Creating commit...
git commit -m "🚀 ApplyMate AI — full-stack AI job assistant (Render + Vercel ready)" 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Nothing new to commit, or already committed.
)

echo.
echo [4/5] Setting remote to sri4248/applymate-ai...
git remote remove origin 2>nul
git remote add origin https://github.com/sri4248/applymate-ai.git
echo Remote set.

echo.
echo [5/5] Pushing to GitHub (main branch)...
echo.
echo NOTE: If a login popup appears, sign in with your GitHub account (sri4248).
echo       If asked for password, use a Personal Access Token (not your password).
echo.
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Code is live on GitHub!
    echo   https://github.com/sri4248/applymate-ai
    echo ========================================
    echo.
    echo NEXT STEPS:
    echo.
    echo [BACKEND] Deploy on Render:
    echo   1. Go to: https://render.com
    echo   2. New + > Web Service > Connect sri4248/applymate-ai
    echo   3. Root Directory: backend
    echo   4. Build: pip install -r requirements.txt
    echo   5. Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    echo   6. Add env var: GEMINI_API_KEY = your_key
    echo   7. Add Disk: /data  (1 GB^)
    echo.
    echo [FRONTEND] Deploy on Vercel:
    echo   1. Go to: https://vercel.com
    echo   2. Add New Project > Import sri4248/applymate-ai
    echo   3. Root Directory: frontend
    echo   4. Add env var: VITE_API_URL = https://your-render-url.onrender.com
    echo.
) else (
    echo.
    echo ========================================
    echo   PUSH FAILED
    echo ========================================
    echo.
    echo Possible reasons:
    echo  - Repo doesn't exist yet on GitHub
    echo    Create it at: https://github.com/new
    echo    Name: applymate-ai  (no README, no .gitignore^)
    echo.
    echo  - Not authenticated
    echo    Run: git config --global user.email "your@email.com"
    echo    Run: git config --global user.name "sri4248"
    echo.
    echo Then run this script again.
)

echo.
pause
