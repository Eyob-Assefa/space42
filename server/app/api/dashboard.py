from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.database import get_db
from app.models import schemas
from supabase import Client

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/applicants")
async def get_all_applicants(
    recruiter_id: str = Query(..., description="Recruiter user ID"),
    job_id: Optional[int] = Query(None, description="Filter by job ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Client = Depends(get_db)
):
    """
    Get all applicants for a recruiter.
    """
    recruiter_response = db.table("users").select("id").eq("id", recruiter_id).eq("role", "recruiter").execute()
    if not recruiter_response.data:
        raise HTTPException(status_code=403, detail="Only recruiters can access this endpoint")
    

    jobs_response = db.table("jobs").select("id").eq("recruiter_id", recruiter_id).execute()
    job_ids = [job["id"] for job in (jobs_response.data or [])]
    
    if not job_ids:
        return {"recruiter_id": recruiter_id, "total_applicants": 0, "applications": []}
    

    query = db.table("applications").select("*, jobs(title)").in_("job_id", job_ids)
    
    if job_id:
        query = query.eq("job_id", job_id)
    if status:
        query = query.eq("status", status)
    
    applications_response = query.order("ai_score", desc=True).execute()
    applications = applications_response.data if applications_response.data else []
    
    # Map the nested job title to the top level for the frontend
    processed_apps = []
    for app in applications:
        # Extract title from the joined 'jobs' object
        job_info = app.get("jobs")
        if isinstance(job_info, dict):
            app["job_title"] = job_info.get("title")
        elif isinstance(job_info, list) and job_info: 
             app["job_title"] = job_info[0].get("title")
             
        # Remove the nested object to clean up the response
        if "jobs" in app:
            del app["jobs"]
            
        processed_apps.append(schemas.ApplicationResponse(**app))
    
    return {
        "recruiter_id": recruiter_id,
        "total_applicants": len(processed_apps),
        "applications": processed_apps
    }

@router.get("/stats")
async def get_dashboard_stats(
    recruiter_id: str = Query(..., description="Recruiter user ID"),
    db: Client = Depends(get_db)
):
    """Get dashboard statistics for a recruiter."""
    # Verify recruiter
    recruiter_response = db.table("users").select("id").eq("id", recruiter_id).eq("role", "recruiter").execute()
    if not recruiter_response.data:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get Job IDs
    jobs_response = db.table("jobs").select("id").eq("recruiter_id", recruiter_id).execute()
    job_ids = [job["id"] for job in (jobs_response.data or [])]
    
    if not job_ids:
        return {
            "total_jobs": 0, 
            "total_applicants": 0, 
            "applicants_by_status": {"applied": 0, "interview": 0, "offer": 0},
            "average_ai_score": 0.0
        }
    
    # Get simple stats - we only need status and ai_score
    applications_response = db.table("applications")\
        .select("status, ai_score")\
        .in_("job_id", job_ids)\
        .execute()
        
    applications = applications_response.data if applications_response.data else []
    
    status_counts = {"applied": 0, "interview": 0, "offer": 0}
    total_score = 0.0
    
    for app in applications:
        status = app.get("status", "applied")
        if status in status_counts:
            status_counts[status] += 1
        total_score += app.get("ai_score", 0.0)
    
    avg_score = total_score / len(applications) if applications else 0.0
    
    return {
        "total_jobs": len(job_ids),
        "total_applicants": len(applications),
        "applicants_by_status": status_counts,
        "average_ai_score": round(avg_score, 2)
    }