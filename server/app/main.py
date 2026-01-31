from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, jobs, applicants, chat, dashboard

app = FastAPI(title="Space42 API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applicants.router)
app.include_router(chat.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {"message": "Space42 API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/debug/env")
async def debug_env():
    """Debug endpoint to check environment variables (without exposing sensitive data)."""
    import os
    from pathlib import Path
    
    SERVER_DIR = Path(__file__).resolve().parent.parent
    ROOT_DIR = SERVER_DIR.parent
    
    env_paths = [
        SERVER_DIR / ".env",
        ROOT_DIR / ".env"
    ]
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    return {
        "supabase_url_set": bool(supabase_url),
        "supabase_url_length": len(supabase_url) if supabase_url else 0,
        "supabase_key_set": bool(supabase_key),
        "supabase_key_length": len(supabase_key) if supabase_key else 0,
        "supabase_key_preview": supabase_key[:10] + "..." if supabase_key and len(supabase_key) > 10 else "Not set",
        "env_files_checked": [str(p) for p in env_paths],
        "env_files_exist": [p.exists() for p in env_paths],
        "current_dir": os.getcwd(),
    }

