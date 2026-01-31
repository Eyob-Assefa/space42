from fastapi import APIRouter, Depends
from app.models import schemas
from app.services.rag_service import chat_with_rag, ingest_handbook, query_handbook
from app.services.ai_agent import match_jobs_with_cv
from app.database import get_db
from supabase import Client

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/")
async def chat(message: schemas.ChatMessage):
    """Handle chatbot conversations using RAG with handbook data."""
    response = await chat_with_rag(message.message)
    return {"response": response}


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

