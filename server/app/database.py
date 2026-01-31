import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

# __file__ is database.py -> .parent is app/ -> .parent.parent is server/
SERVER_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = SERVER_DIR.parent  # Go up one more level to project root

# Try to load .env from server directory first, then root directory
env_paths = [
    SERVER_DIR / ".env",
    ROOT_DIR / ".env"
]

# Load environment variables (load_dotenv will use the first file it finds)
env_loaded = False
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)
        env_loaded = True
        break

# If no .env file found, try default load_dotenv() which checks current directory
if not env_loaded:
    load_dotenv()

# Global variable to store the client (lazy initialization)
_supabase_client: Optional[Client] = None


def _get_supabase_credentials():
    """Get Supabase credentials from environment variables."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        checked_paths = ", ".join([str(p) for p in env_paths])
        raise ValueError(
            f"SUPABASE_URL and SUPABASE_KEY must be set in environment variables.\n"
            f"Checked .env files at: {checked_paths}\n"
            f"SUPABASE_URL: {'Set' if supabase_url else 'Missing'}\n"
            f"SUPABASE_KEY: {'Set' if supabase_key else 'Missing'}\n"
            f"Current working directory: {os.getcwd()}"
        )
    
    return supabase_url, supabase_key


def get_db() -> Client:
    """
    Returns the Supabase client (lazy initialization).
    In FastAPI, you can use this with: db: Client = Depends(get_db)
    """
    global _supabase_client
    
    if _supabase_client is None:
        supabase_url, supabase_key = _get_supabase_credentials()
        _supabase_client = create_client(supabase_url, supabase_key)
    
    return _supabase_client