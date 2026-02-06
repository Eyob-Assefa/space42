import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional


SERVER_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = SERVER_DIR.parent 

# Try to load .env from server directory first, then root directory
env_paths = [
    SERVER_DIR / ".env",
    ROOT_DIR / ".env"
]

# Load environment variables
env_loaded = False
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)
        env_loaded = True
        break

if not env_loaded:
    load_dotenv()

# Global variable for lazy initialization
_supabase_client: Optional[Client] = None

def _get_supabase_credentials():
    """Get Supabase credentials with fallback logic."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    # Fallback for Next.js style naming
    if not supabase_url:
        supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    if not supabase_key:
        supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        checked_paths = ", ".join([str(p) for p in env_paths])
        raise ValueError(
            f"CRITICAL ERROR: SUPABASE_URL and SUPABASE_KEY are missing.\n"
            f"Checked paths: {checked_paths}\n"
            f"Current Directory: {os.getcwd()}"
        )
    
    return supabase_url.strip(), supabase_key.strip()

def get_db() -> Client:
    """
    Returns the Supabase client. 
    Lazy loads the connection so we don't crash on import if env vars are missing.
    """
    global _supabase_client
    
    if _supabase_client is None:
        supabase_url, supabase_key = _get_supabase_credentials()
        
        try:
            _supabase_client = create_client(supabase_url, supabase_key)
        except Exception as e:
            raise ValueError(f"Failed to initialize Supabase client: {str(e)}")
            
    return _supabase_client