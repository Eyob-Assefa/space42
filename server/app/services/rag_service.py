"""
RAG (Retrieval Augmented Generation) service for Space42 company chatbot.
Uses LangChain with Supabase pgvector to load and query handbook data from PDF.
"""
import os
from pathlib import Path
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Import LangChain components
try:
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_openai import OpenAIEmbeddings, ChatOpenAI
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import SupabaseVectorStore
    from langchain.chains import RetrievalQA
    from langchain.prompts import PromptTemplate
    from langchain.schema import Document
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    Document = None
    PyPDFLoader = None
    SupabaseVectorStore = None
    RetrievalQA = None
    PromptTemplate = None
    RecursiveCharacterTextSplitter = None

# Path to handbook PDF
HANDBOOK_PATH = Path(__file__).parent.parent.parent / "data" / "handbook.pdf"

# Initialize embeddings and LLM
embeddings = None
llm = None
if LANGCHAIN_AVAILABLE:
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
            llm = ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0.7,
                openai_api_key=openai_api_key
            )
    except Exception as e:
        print(f"Error initializing OpenAI: {e}")
        embeddings = None
        llm = None


def _get_supabase_client():
    """Get Supabase client from database module."""
    from app.database import get_db
    return get_db()


def ingest_handbook() -> Dict[str, Any]:
    """
    Process handbook.pdf and store chunks in Supabase 'handbook_documents' table.
    
    Returns:
        Dict with status and information about the ingestion process
    """
    if not LANGCHAIN_AVAILABLE:
        return {
            "success": False,
            "error": "LangChain dependencies not available"
        }
    
    if not HANDBOOK_PATH.exists():
        return {
            "success": False,
            "error": f"Handbook PDF not found at {HANDBOOK_PATH}"
        }
    
    if embeddings is None:
        return {
            "success": False,
            "error": "OpenAI embeddings not initialized. Check OPENAI_API_KEY in .env"
        }
    
    try:
        # Load PDF
        print(f"Loading PDF from {HANDBOOK_PATH}")
        loader = PyPDFLoader(str(HANDBOOK_PATH))
        documents = loader.load()
        
        # Preserve page numbers in metadata
        # PyPDFLoader stores page number as "page" (0-indexed) in metadata
        for i, doc in enumerate(documents):
            # Ensure page_number is always set (1-indexed for user-friendly display)
            if "page" in doc.metadata:
                page_num = doc.metadata["page"]
                # Handle both int and other types
                if isinstance(page_num, int):
                    doc.metadata["page_number"] = page_num + 1
                else:
                    doc.metadata["page_number"] = i + 1
            else:
                # Fallback: use index (documents are loaded in page order)
                doc.metadata["page_number"] = i + 1
            # Also keep the original page for reference
            if "page" not in doc.metadata:
                doc.metadata["page"] = i
        
        # Split documents into chunks
        # RecursiveCharacterTextSplitter preserves metadata by default
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_documents(documents)
        
        # Ensure all chunks have page_number in metadata
        for chunk in chunks:
            if "page_number" not in chunk.metadata:
                # Try to get from page field
                if "page" in chunk.metadata:
                    page_num = chunk.metadata["page"]
                    if isinstance(page_num, int):
                        chunk.metadata["page_number"] = page_num + 1
                    else:
                        chunk.metadata["page_number"] = 1
                else:
                    chunk.metadata["page_number"] = 1  # Default fallback
        
        print(f"Created {len(chunks)} chunks from {len(documents)} pages")
        
        # Get Supabase client
        supabase_client = _get_supabase_client()
        
        # Create vector store and add documents
        # SupabaseVectorStore will create the table if it doesn't exist
        vector_store = SupabaseVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings,
            client=supabase_client,
            table_name="handbook_documents",
            query_name="match_handbook_documents"  # Name for the similarity search function
        )
        
        return {
            "success": True,
            "chunks_created": len(chunks),
            "pages_processed": len(documents),
            "message": f"Successfully ingested {len(chunks)} chunks from {len(documents)} pages"
        }
    
    except Exception as e:
        print(f"Error ingesting handbook: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }


def query_handbook(query: str, k: int = 3) -> List[Dict[str, Any]]:
    """
    Search the handbook and return the top k most relevant chunks with page numbers.
    
    Args:
        query: Search query string
        k: Number of top results to return (default: 3)
    
    Returns:
        List of dictionaries with 'content', 'page_number', and 'metadata' keys
    """
    if not LANGCHAIN_AVAILABLE:
        return []
    
    if embeddings is None:
        return []
    
    try:
        # Get Supabase client
        supabase_client = _get_supabase_client()
        
        # Create vector store connection (doesn't re-ingest, just connects)
        vector_store = SupabaseVectorStore(
            client=supabase_client,
            embedding=embeddings,
            table_name="handbook_documents",
            query_name="match_handbook_documents"
        )
        
        # Perform similarity search
        results = vector_store.similarity_search_with_score(query, k=k)
        
        # Format results with page numbers
        formatted_results = []
        for doc, score in results:
            page_number = doc.metadata.get("page_number", doc.metadata.get("page", 0))
            # Ensure page_number is 1-indexed
            if isinstance(page_number, int) and page_number >= 0:
                if page_number == 0:
                    page_number = 1
            else:
                page_number = 1
            
            formatted_results.append({
                "content": doc.page_content,
                "page_number": page_number,
                "score": float(score),
                "metadata": doc.metadata
            })
        
        return formatted_results
    
    except Exception as e:
        print(f"Error querying handbook: {e}")
        import traceback
        traceback.print_exc()
        return []


async def chat_with_rag(user_message: str) -> str:
    """
    Answer user questions using RAG (Retrieval Augmented Generation).
    Uses handbook data from Supabase to provide accurate answers with page citations.
    """
    try:
        # Check if langchain is available
        if not LANGCHAIN_AVAILABLE or llm is None or embeddings is None:
            # Fallback to simple OpenAI chat
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a friendly AI assistant for Space42, a space-themed recruitment platform. Be helpful, concise, and space-themed in your responses."},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        
        # Query handbook for relevant chunks
        relevant_chunks = query_handbook(user_message, k=3)
        
        if not relevant_chunks:
            # If no chunks found, use simple LLM response
            response = llm.invoke(user_message)
            return response.content if hasattr(response, 'content') else str(response)
        
        # Build context with page numbers
        context_parts = []
        page_numbers = set()
        
        for chunk in relevant_chunks:
            context_parts.append(chunk["content"])
            page_numbers.add(chunk["page_number"])
        
        context = "\n\n".join(context_parts)
        pages_str = ", ".join(sorted([str(p) for p in page_numbers]))
        
        # Create prompt template with page citation instruction
        prompt_template = """Use the following pieces of context from the handbook to answer the question.
If you don't know the answer based on the context, say that you don't know, but try to be helpful.
Be friendly and professional in your responses.
Always mention the page numbers where you found the information at the end of your answer.

Context (from pages {pages}):
{context}

Question: {question}

Answer:"""
        
        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question", "pages"]
        )
        
        # Use LLM directly with the formatted prompt
        formatted_prompt = PROMPT.format(
            context=context,
            question=user_message,
            pages=pages_str
        )
        
        response = llm.invoke(formatted_prompt)
        answer = response.content if hasattr(response, 'content') else str(response)
        
        # Ensure page numbers are mentioned in the answer
        if pages_str and pages_str not in answer:
            answer += f" (Source: pages {pages_str})"
        
        return answer
    
    except Exception as e:
        print(f"Error in RAG chat: {e}")
        import traceback
        traceback.print_exc()
        # Fallback to simple response
        return "I'm having trouble connecting right now. Please try again later."
