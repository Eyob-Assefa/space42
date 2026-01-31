from fastapi import APIRouter, Depends
from app.models import schemas
from app.services.rag_service import chat_with_rag
from app.services.ai_agent import match_jobs_with_cv
from app.database import get_db
from supabase import Client

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/")
async def chat(message: schemas.ChatMessage):
    """Handle chatbot conversations using RAG with company data."""
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

