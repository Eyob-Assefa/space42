from fastapi import APIRouter
from app.models import schemas
from app.services.ai_agent import chat_with_ai

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/")
async def chat(message: schemas.ChatMessage):
    """Handle chatbot conversations."""
    response = await chat_with_ai(message.message)
    return {"response": response}

