from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.database import get_db
from app.models import schemas
from supabase import Client

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/", response_model=List[schemas.JobResponse])
async def get_jobs(db: Client = Depends(get_db)):
    """Get all job listings."""
    response = db.table("jobs").select("*").execute()
    if not response.data:
        return []
    return [schemas.JobResponse(**job) for job in response.data]


@router.get("/{job_id}", response_model=schemas.JobResponse)
async def get_job(job_id: int, db: Client = Depends(get_db)):
    """Get a specific job by ID."""
    response = db.table("jobs").select("*").eq("id", job_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return schemas.JobResponse(**response.data[0])


@router.post("/", response_model=schemas.JobResponse)
async def create_job(job: schemas.JobCreate, recruiter_id: str, db: Client = Depends(get_db)):
    """Create a new job posting."""
    # Verify recruiter exists
    recruiter_response = db.table("users").select("*").eq("id", recruiter_id).eq("role", "recruiter").execute()
    if not recruiter_response.data:
        raise HTTPException(status_code=403, detail="Only recruiters can create jobs")
    
    job_data = job.model_dump()
    job_data["recruiter_id"] = recruiter_id
    response = db.table("jobs").insert(job_data).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create job")
    return schemas.JobResponse(**response.data[0])


@router.get("/{job_id}/applicants", response_model=List[schemas.ApplicationResponse])
async def get_job_applicants(job_id: int, db: Client = Depends(get_db)):
    """Get all applicants for a job."""
    # 1. Verify job exists
    job_response = db.table("jobs").select("id").eq("id", job_id).execute()
    if not job_response.data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # 2. Get applications
    applications_response = db.table("applications").select("*").eq("job_id", job_id).execute()
    applications = applications_response.data if applications_response.data else []
    
    # 3. Return the LIST directly (Fixes the frontend mismatch)
    return [schemas.ApplicationResponse(**app) for app in applications]

