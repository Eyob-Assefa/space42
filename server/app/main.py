from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Import Routers
from app.api import auth, jobs, applicants, chat, dashboard

app = FastAPI(
    title="Space42 Recruitment Platform",
    description="AI-powered recruitment backend",
    version="1.0.0"
)

# CORS Middleware
# We allow both localhost ports commonly used by React/Next.js
origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:3001", 
    "http://127.0.0.1:3001",
    "http://localhost:5173", 
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applicants.router)
app.include_router(chat.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {"message": "Space42 API is running correctly."}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/debug/env")
async def debug_env():
    """Debug endpoint to verify environment variables are read correctly."""
    from app.database import env_paths
    
    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    return {
        "supabase_url_detected": bool(supabase_url),
        "supabase_key_detected": bool(supabase_key),
        "env_files_checked": [str(p) for p in env_paths],
        "env_files_found": [p.exists() for p in env_paths],
        "current_directory": os.getcwd()
    }