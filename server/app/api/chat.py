from fastapi import APIRouter
from app.models import schemas
from app.services.rag_service import chat_with_rag

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/")
async def chat(message: schemas.ChatMessage):
    """Handle chatbot conversations using RAG with company data."""
    response = await chat_with_rag(message.message)
    return {"response": response}

