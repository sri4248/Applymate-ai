# ApplyMate AI 🚀

> An AI-powered full-stack job application assistant for freshers and job seekers.

## ✨ Features

| Feature | Description |
|---|---|
| 📋 Job Tracker | Track applied, shortlisted, interview, rejected and offered jobs |
| 🎯 AI Job Match | Compare resume vs JD, get instant match score via Gemini AI |
| 📚 Prep Toolkit | Generate technical questions and interview tips from JD |
| 📧 Email Analyzer | Classify recruitment emails — interview call, rejection, offer |
| ✏️ Resume Updater | Get smart resume improvement suggestions per job description |
| 🤖 Auto Apply | Analyze job eligibility and apply with explicit user approval |
| 📂 Resume Upload | Drag & drop or import from Google Drive (PDF, DOCX, DOC) |

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: SQLite (via SQLAlchemy)
- **AI**: Google Gemini 1.5 Flash
- **State**: Zustand
- **Charts**: Recharts
- **Animations**: Framer Motion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Gemini API key from https://aistudio.google.com

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/applymate-ai.git
cd applymate-ai
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Create your .env file
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the backend
uvicorn app.main:app --reload
```
Backend runs at: http://localhost:8000  
API Docs: http://localhost:8000/docs

### 3. Setup Frontend
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

## 📁 Project Structure

```
applymate-ai/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── pages/     # 7 feature pages
│       ├── components/# Reusable UI components
│       ├── services/  # API calls (axios)
│       └── store/     # Zustand global state
└── backend/           # Python FastAPI
    └── app/
        ├── routes/    # API endpoints
        ├── services/  # Gemini AI + resume parser
        ├── models/    # SQLAlchemy DB models
        └── schemas/   # Pydantic request/response schemas
```

## 🔐 Security Notes

- Your `GEMINI_API_KEY` is stored in `.env` — never committed to Git
- The `.gitignore` excludes `.env`, database files, and uploads
- File uploads are validated (PDF, DOCX, or DOC — max 10 MB)

## 🌐 Deployment

- **Frontend**: Deploy `frontend/` to [Vercel](https://vercel.com)
- **Backend**: Deploy `backend/` to [Render](https://render.com)
- Set `GEMINI_API_KEY` as an environment variable on Render
- Set `VITE_API_URL` to your Render backend URL on Vercel

## 📝 License

MIT License — Feel free to use and modify!
