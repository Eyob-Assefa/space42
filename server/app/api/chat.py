from fastapi import APIRouter, Depends
from app.models import schemas
from app.services.rag_service import chat_with_rag, ingest_handbook, query_handbook
from app.services.ai_agent import match_jobs_with_cv, handle_recruiter_instruction
from app.database import get_db
from supabase import Client

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/")
async def chat(message: schemas.ChatMessage):
    """
    Handle chatbot conversations using RAG with handbook data.
    
    Flow:
    1. User sends a message
    2. Backend queries handbook_documents vector store
    3. Retrieves top 1-3 relevant chunks with page numbers
    4. Formats context and sends to LLM with updated system prompt
    5. Returns response with page citations
    """
    try:
        print(f"[CHAT ENDPOINT] Received message: {message.message}")
        response = await chat_with_rag(message.message)
        print(f"[CHAT ENDPOINT] Returning response: {response[:100] if response else 'None'}...")
        return {"response": response}
    except Exception as e:
        print(f"[CHAT ENDPOINT] Error: {e}")
        import traceback
        traceback.print_exc()
        return {"response": "I'm having trouble processing your request. Please try again."}


@router.post("/match-jobs")
async def match_jobs(request: schemas.ChatMatchJobsRequest, db: Client = Depends(get_db)):
    """Match candidate's CV to available jobs. Use cv_text when provided for job matching."""
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
    """Query the handbook and return relevant chunks with page numbers."""
    results = query_handbook(query, k=k)
    return {"query": query, "results": results}


@router.post("/recruiter-instruction")
async def recruiter_instruction(request: schemas.RecruiterInstructionRequest, db: Client = Depends(get_db)):
    """Handle recruiter instructions: /filter, /rank, /email. Returns AI response and optionally filtered/ranked application IDs."""
    result = await handle_recruiter_instruction(
        message=request.message,
        job_id=request.job_id,
        application_ids=request.application_ids,
        current_application_id=request.current_application_id,
        db=db
    )
    return result
