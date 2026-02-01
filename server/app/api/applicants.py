from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from typing import List, Optional
from app.database import get_db
from app.models import schemas
from app.services.cv_parser import extract_text_from_pdf
from app.services.ai_agent import score_resume, generate_interview_email, suggest_interview_questions
from supabase import Client
import uuid

router = APIRouter(prefix="/api/applicants", tags=["applicants"])


@router.post("/apply")
async def submit_application(
    job_id: int = Form(...),
    candidate_id: Optional[str] = Form(None),
    name: str = Form(...),
    email: str = Form(...),
    years_of_experience: int = Form(...),
    tech_stack: str = Form(...),
    cv_file: UploadFile = File(...),
    db: Client = Depends(get_db)
):
    """Submit a job application with CV upload. Candidates can apply without signing in."""
    # Validate and convert types to ensure they match database schema
    # Ensure job_id is an integer (Form data might come as string)
    try:
        job_id_int = int(job_id) if not isinstance(job_id, int) else job_id
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid job_id: must be an integer")
    
    # Verify job exists
    job_response = db.table("jobs").select("*").eq("id", job_id_int).execute()
    if not job_response.data:
        raise HTTPException(status_code=404, detail="Job not found")
    job = job_response.data[0]
    
    # Validate candidate_id - must be a valid UUID string or None
    # If candidate_id is provided but is empty/placeholder/invalid, treat as None
    if candidate_id:
        candidate_id = candidate_id.strip() if isinstance(candidate_id, str) else str(candidate_id).strip()
        # Check if it's a valid UUID format
        if not candidate_id or candidate_id.lower() in ['none', 'null', '']:
            candidate_id = None
        else:
            # Validate UUID format
            try:
                uuid.UUID(candidate_id)  # This will raise ValueError if invalid
            except (ValueError, AttributeError, TypeError):
                # Invalid UUID format, treat as None
                print(f"Warning: Invalid candidate_id format: {candidate_id}, treating as None")
                candidate_id = None
    
    # For anonymous applicants (no valid candidate_id), find or create a user record
    if not candidate_id:
        user_response = db.table("users").select("*").eq("email", email).execute()
        if user_response.data:
            candidate_id = user_response.data[0]["id"]
        else:
            candidate_id = str(uuid.uuid4())
            try:
                db.table("users").insert({
                    "id": candidate_id,
                    "email": email,
                    "role": "candidate",
                    "name": name
                }).execute()
            except Exception as e:
                print(f"Warning: Could not create user record: {e}")
                # Use UUID anyway - some DB setups may allow applications without user FK
    
    # Read CV file
    cv_bytes = await cv_file.read()
    
    # Upload to Supabase Storage
    file_ext = cv_file.filename.split('.')[-1] if '.' in cv_file.filename else 'pdf'
    file_name = f"{uuid.uuid4()}.{file_ext}"
    
    try:
        # Upload to Supabase Storage bucket 'cvs'
        file_path = f"cvs/{file_name}"
        db.storage.from_("cvs").upload(file_path, cv_bytes, file_options={"content-type": cv_file.content_type})
        
        # Get public URL
        cv_url = db.storage.from_("cvs").get_public_url(file_path)
    except Exception as e:
        print(f"Error uploading to Supabase: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload CV: {str(e)}")
    
    # Extract text from CV
    cv_text = extract_text_from_pdf(cv_bytes)
    
    # Score with AI
    ai_score = await score_resume(cv_text or "", job.get("description") or "", "")
    
    # Validate and convert types to ensure they match database schema
    # Ensure years_of_experience is an integer (Form data might come as string)
    try:
        years_int = int(years_of_experience) if not isinstance(years_of_experience, int) else years_of_experience
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid years_of_experience: must be an integer")
    
    # Ensure ai_score is a float
    try:
        ai_score_float = float(ai_score) if not isinstance(ai_score, float) else ai_score
    except (ValueError, TypeError):
        print(f"Warning: Invalid ai_score: {ai_score}, using default 50.0")
        ai_score_float = 50.0
    
    # Create application with properly typed values
    application_data = {
        "job_id": job_id_int,  # INT - already validated above
        "candidate_id": candidate_id,  # Valid UUID string - already validated above
        "name": name,
        "email": email,
        "years_of_experience": years_int,  # INT - validated above
        "tech_stack": tech_stack,
        "cv_url": cv_url,
        "ai_score": ai_score_float,  # FLOAT - validated above
        "status": "applied"  # Valid enum value (matches ApplicationStatus.APPLIED)
    }
    
    response = db.table("applications").insert(application_data).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create application")
    
    # Update user profile with CV URL (if user exists)
    try:
        db.table("users").update({"cv_url": cv_url}).eq("id", candidate_id).execute()
    except Exception as e:
        print(f"Warning: Could not update user profile with CV: {e}")
        # Don't fail the request if profile update fails
    
    return schemas.ApplicationResponse(**response.data[0])


@router.get("/screening/{job_id}", response_model=List[schemas.ApplicationResponse])
async def get_applicants_for_screening(
    job_id: int,
    min_experience: Optional[int] = None,
    tech_filter: Optional[str] = None,
    db: Client = Depends(get_db)
):
    """Get applicants for screening with optional filters."""
    query = db.table("applications").select("*").eq("job_id", job_id)
    
    if min_experience:
        query = query.gte("years_of_experience", min_experience)
    
    response = query.order("ai_score", desc=True).execute()
    applications = response.data if response.data else []
    
    # Filter by tech_stack if provided (client-side filter since Supabase doesn't have ilike)
    if tech_filter:
        applications = [app for app in applications if tech_filter.lower() in app.get("tech_stack", "").lower()]
    
    return [schemas.ApplicationResponse(**app) for app in applications]


@router.post("/ai-score")
async def rescore_applicants(
    request: schemas.AIScoringRequest,
    job_id: Optional[int] = Query(None),
    db: Client = Depends(get_db)
):
    """Re-score applicants based on ideal candidate description."""
    # If no application_ids provided, get all for a job_id
    if not request.application_ids and not job_id:
        raise HTTPException(status_code=400, detail="application_ids or job_id required")
    
    if request.application_ids:
        response = db.table("applications").select("*").in_("id", request.application_ids).execute()
        applications = response.data if response.data else []
    else:
        response = db.table("applications").select("*").eq("job_id", job_id).execute()
        applications = response.data if response.data else []
    
    if not applications:
        raise HTTPException(status_code=404, detail="No applications found")
    
    # Get job description
    job_response = db.table("jobs").select("*").eq("id", applications[0]["job_id"]).execute()
    job = job_response.data[0] if job_response.data else {}
    job_description = job.get("description") or ""
    
    # Re-score each application
    for app in applications:
        # Get CV text (would need to fetch from storage, simplified here)
        # For now, use existing score and adjust based on ideal candidate
        new_score = await score_resume("", job_description, request.ideal_candidate_description)
        # Ensure ai_score is a float
        try:
            ai_score_float = float(new_score) if not isinstance(new_score, float) else new_score
        except (ValueError, TypeError):
            print(f"Warning: Invalid ai_score: {new_score}, using existing score")
            ai_score_float = app.get("ai_score", 50.0)
        # Update score in database
        db.table("applications").update({"ai_score": ai_score_float}).eq("id", app["id"]).execute()
        app["ai_score"] = ai_score_float
    
    # Return sorted applications
    applications.sort(key=lambda x: x["ai_score"], reverse=True)
    return [schemas.ApplicationResponse(**app) for app in applications]


@router.post("/{application_id}/comments")
async def add_comment(
    application_id: int,
    comment: schemas.CommentCreate,
    db: Client = Depends(get_db)
):
    """Add a comment to an application."""
    application_response = db.table("applications").select("*").eq("id", application_id).execute()
    if not application_response.data:
        raise HTTPException(status_code=404, detail="Application not found")
    
    comment_data = {
        "application_id": application_id,
        "content": comment.content
    }
    response = db.table("comments").insert(comment_data).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create comment")
    
    return schemas.CommentResponse(**response.data[0])


@router.patch("/{application_id}/status")
async def update_status(
    application_id: int,
    status: str = Query(..., description="Status: applied, interview, or offer"),
    db: Client = Depends(get_db)
):
    """Update application status."""
    
    # Validate status
    valid_statuses = ["applied", "interview", "offer"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status. Must be one of: applied, interview, offer")
    
    application_response = db.table("applications").select("*").eq("id", application_id).execute()
    if not application_response.data:
        raise HTTPException(status_code=404, detail="Application not found")
    
    response = db.table("applications").update({"status": status}).eq("id", application_id).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update status")
    
    return schemas.ApplicationResponse(**response.data[0])


@router.post("/{application_id}/generate-email")
async def generate_email(application_id: int, db: Client = Depends(get_db)):
    """Generate interview email for candidate."""
    application_response = db.table("applications").select("*").eq("id", application_id).execute()
    if not application_response.data:
        raise HTTPException(status_code=404, detail="Application not found")
    application = application_response.data[0]
    
    job_response = db.table("jobs").select("*").eq("id", application["job_id"]).execute()
    job = job_response.data[0] if job_response.data else {}
    email_content = await generate_interview_email(application["name"], job.get("title", ""))
    
    return {"email_content": email_content}


@router.post("/{application_id}/suggest-questions")
async def get_suggested_questions(application_id: int, db: Client = Depends(get_db)):
    """Get suggested interview questions."""
    application_response = db.table("applications").select("*").eq("id", application_id).execute()
    if not application_response.data:
        raise HTTPException(status_code=404, detail="Application not found")
    application = application_response.data[0]
    
    job_response = db.table("jobs").select("*").eq("id", application["job_id"]).execute()
    job = job_response.data[0] if job_response.data else {}
    questions = await suggest_interview_questions(job.get("title", ""), application.get("tech_stack", ""))
    
    return {"questions": questions}
