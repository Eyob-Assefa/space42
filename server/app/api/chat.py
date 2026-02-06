from fastapi import APIRouter, Depends
from app.models import schemas
from app.services.rag_service import chat_with_rag, ingest_handbook, query_handbook
from app.services.ai_agent import match_jobs_with_cv, handle_recruiter_instruction
from app.database import get_db
from supabase import Client

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/")
async def chat(message: schemas.ChatMessage):
    try:
        response = await chat_with_rag(message.message)
        return {"response": response}
    except Exception as e:
        print(f"Chat error: {e}")
        return {"response": "I'm having trouble processing your request."}

@router.post("/match-jobs")
async def match_jobs(request: schemas.ChatMatchJobsRequest, db: Client = Depends(get_db)):
    if request.cv_text:
        jobs_response = db.table("jobs").select("*").execute()
        jobs_list = jobs_response.data if jobs_response.data else []
        response = await match_jobs_with_cv(request.cv_text, jobs_list)
    else:
        response = await chat_with_rag(request.message)
    return {"response": response}

@router.post("/ingest-handbook")
async def ingest_handbook_endpoint():
    """Trigger ingestion of handbook.pdf into Supabase vector store."""
    result = ingest_handbook()
    return result

@router.get("/query-handbook")
async def query_handbook_endpoint(query: str, k: int = 3):
    results = query_handbook(query, k=k)
    return {"query": query, "results": results}

@router.post("/recruiter-instruction")
async def recruiter_instruction(request: schemas.RecruiterInstructionRequest, db: Client = Depends(get_db)):
    """Handle recruiter instructions: /filter, /rank, /email."""
    # Argument name must match the function definition in ai_agent.py
    result = await handle_recruiter_instruction(
        message=request.message,
        job_id=request.job_id,
        application_ids=request.application_ids,
        current_application_id=request.current_application_id,
        supabase_client=db 
    )
    return result