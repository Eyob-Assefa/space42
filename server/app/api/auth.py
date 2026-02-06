from fastapi import APIRouter, Depends, HTTPException, Header
from app.database import get_db
from app.models import schemas
from supabase import Client
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(data: LoginRequest, db: Client = Depends(get_db)):
    # THE HACKATHON ADMIN BYPASS
    if data.username == "admin" and data.password == "admin":
        return {
            "access_token": "mock-admin-token-123",
            "token_type": "bearer",
            "user": {
                "id": "admin-id",
                "email": "admin@space42.com",
                "role": "admin"
            },
            "redirect_url": "/recruiter"
        }
    
    # STANDARD LOGIN
    try:
        # Fix: Use the db client injected by Depends(get_db)
        res = db.auth.sign_in_with_password({"email": data.username, "password": data.password})
        
        # Return the session data structured for your frontend
        return {
            "access_token": res.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": res.user.id,
                "email": res.user.email,
                "role": "recruiter" 
            },
            "redirect_url": "/recruiter"
        }
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/verify")
async def verify_token(authorization: str = Header(None), db: Client = Depends(get_db)):
    """Verify Supabase JWT token, return user info, and auto-register if needed."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        user_data = db.auth.get_user(token)
        if not user_data or not user_data.user:
            raise HTTPException(status_code=401, detail="Invalid token or user not found")
        
        user_id = user_data.user.id
        email = user_data.user.email
        
        # Auto-register logic (kept from your original code)
        try:
            user_response = db.table("users").select("*").eq("id", user_id).execute()
            if not user_response.data:
                new_user_data = {
                    "id": user_id,
                    "email": email,
                    "role": "candidate",
                    "name": email.split('@')[0] if email else 'User'
                }
                db.table("users").insert(new_user_data).execute()
        except Exception as db_error:
            print(f"Warning: Could not auto-register user: {db_error}")
        
        return {
            "user": {
                "id": user_id,
                "email": email,
            },
            "valid": True
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

@router.post("/create-profile")
async def create_profile(user_data: dict, db: Client = Depends(get_db)):
    """Create or update user profile after Supabase auth."""
    user_id = user_data.get('id')
    email = user_data.get('email')
    role = user_data.get('role', 'candidate')
    name = user_data.get('name')
    
    # Check if user exists
    db_user = None
    if user_id:
        response = db.table("users").select("*").eq("id", user_id).execute()
        if response.data:
            db_user = response.data[0]
    
    if not db_user and email:
        response = db.table("users").select("*").eq("email", email).execute()
        if response.data:
            db_user = response.data[0]
    
    if db_user:
        # Update existing
        update_data = {}
        if role: update_data["role"] = role
        if name: update_data["name"] = name
        
        if update_data:
            response = db.table("users").update(update_data).eq("id", db_user["id"]).execute()
            db_user = response.data[0] if response.data else db_user
    else:
        # Create new
        new_user_data = {
            "id": user_id or email,
            "email": email,
            "role": role,
            "name": name or (email.split('@')[0] if email else 'User')
        }
        response = db.table("users").insert(new_user_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create user profile")
        db_user = response.data[0]
    
    return db_user