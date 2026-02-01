from fastapi import APIRouter, Depends, HTTPException, Header
from app.database import get_db
from app.models import schemas
from supabase import Client
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(data: LoginRequest):
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
    
    # If not admin, proceed to standard Supabase Auth
    res = supabase.auth.sign_in_with_password({"email": data.username, "password": data.password})
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/verify")
async def verify_token(authorization: str = Header(None), db: Client = Depends(get_db)):
    """Verify Supabase JWT token, return user info, and auto-register if needed."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Verify token with Supabase
        # Note: get_user() with a token verifies the JWT token
        user_data = db.auth.get_user(token)
        if not user_data or not user_data.user:
            raise HTTPException(status_code=401, detail="Invalid token or user not found")
        
        user_id = user_data.user.id
        email = user_data.user.email
        
        # Auto-register user in database if not exists
        try:
            user_response = db.table("users").select("*").eq("id", user_id).execute()
            if not user_response.data:
                # User doesn't exist, create profile
                new_user_data = {
                    "id": user_id,
                    "email": email,
                    "role": "candidate",  # Default role
                    "name": email.split('@')[0] if email else 'User'
                }
                db.table("users").insert(new_user_data).execute()
        except Exception as db_error:
            # Log but don't fail the auth if database operation fails
            print(f"Warning: Could not auto-register user in database: {db_error}")
        
        return {
            "user": {
                "id": user_id,
                "email": email,
            },
            "valid": True
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        error_msg = str(e)
        # Provide more helpful error messages
        if "Invalid API key" in error_msg or "SupabaseException" in error_msg:
            raise HTTPException(
                status_code=500,
                detail="Server configuration error: Invalid Supabase credentials. Please contact administrator."
            )
        raise HTTPException(
            status_code=401,
            detail=f"Token verification failed: {error_msg}"
        )


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
        # Update existing user
        update_data = {}
        if role:
            update_data["role"] = role
        if name:
            update_data["name"] = name
        
        if update_data:
            response = db.table("users").update(update_data).eq("id", db_user["id"]).execute()
            db_user = response.data[0] if response.data else db_user
    else:
        # Create new user
        new_user_data = {
            "id": user_id or email,  # Use email as fallback ID
            "email": email,
            "role": role,
            "name": name or (email.split('@')[0] if email else 'User')
        }
        response = db.table("users").insert(new_user_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create user profile")
        db_user = response.data[0]
    
    return {
        "id": db_user["id"],
        "email": db_user["email"],
        "role": db_user["role"],
        "name": db_user.get("name"),
        "created_at": db_user.get("created_at", "")
    }

