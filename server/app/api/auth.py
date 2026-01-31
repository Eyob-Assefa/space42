from fastapi import APIRouter, Depends, HTTPException, Header
from app.database import get_db
from app.models import schemas
from supabase import Client

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/verify")
async def verify_token(authorization: str = Header(None)):
    """Verify Supabase JWT token and return user info."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Get Supabase client
        db = get_db()
        # Verify token with Supabase
        user_data = db.auth.get_user(token)
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {
            "user": {
                "id": user_data.user.id,
                "email": user_data.user.email,
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

