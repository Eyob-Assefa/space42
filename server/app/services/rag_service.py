import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# --- IMPORTS ---
try:
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_openai import OpenAIEmbeddings, ChatOpenAI
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_core.messages import HumanMessage, SystemMessage
    LANGCHAIN_AVAILABLE = True
    print("[RAG Init] LangChain libraries loaded successfully.")
except ImportError as e:
    LANGCHAIN_AVAILABLE = False
    print(f"[RAG Init] ERROR: LangChain dependencies missing: {e}")

HANDBOOK_PATH = Path(__file__).parent.parent.parent / "data" / "space42-document.pdf"

def _get_supabase_client():
    from app.database import get_db
    return get_db()

async def _extract_keywords_with_llm(query: str) -> str:
    """
    Uses LLM to extract robust search keywords from the user query.
    Handles misspellings and removes filler words.
    """
    if not query:
        return ""
        
    # 1. Trim to 50 words to control token usage
    trimmed_query = " ".join(query.split()[:50])
    
    try:
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
        
        # Prompt designed to extract core search terms
        messages = [
            SystemMessage(content="You are a search query optimizer. Extract the most important subject nouns or specific business terms from the user's question. Fix any misspellings, and it should be a meaningful word. Return ONLY the keywords separated by spaces. Do not add labels."),
            HumanMessage(content=f"Question: {trimmed_query}")
        ]
        
        response = await llm.ainvoke(messages)
        keywords = response.content.strip()
        print(f"[Keyword Extractor] Input: '{trimmed_query}' -> Keywords: '{keywords}'")
        return keywords
    except Exception as e:
        print(f"[Keyword Extractor] Failed: {e}")
        # Fallback to naive splitting if LLM fails
        return trimmed_query

def ingest_handbook() -> Dict[str, Any]:
    """Process handbook.pdf and store chunks in Supabase."""
    if not LANGCHAIN_AVAILABLE:
        return {"success": False, "error": "LangChain dependencies not available"}
    
    if not HANDBOOK_PATH.exists():
        return {"success": False, "error": f"PDF not found at {HANDBOOK_PATH}"}
    
    try:
        print(f"[Ingest] Loading PDF from {HANDBOOK_PATH}")
        loader = PyPDFLoader(str(HANDBOOK_PATH))
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_documents(documents)
        
        embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")
        print("[Ingest] Generating embeddings...")
        texts = [chunk.page_content for chunk in chunks]
        embeddings = embeddings_model.embed_documents(texts)
        
        supabase = _get_supabase_client()
        batch_data = []
        
        for i, (chunk, vector) in enumerate(zip(chunks, embeddings)):
            page = chunk.metadata.get("page", 0)
            if isinstance(page, int): page += 1
            
            batch_data.append({
                "content": chunk.page_content,
                "metadata": {"page_number": page, "source": "handbook"},
                "embedding": vector
            })

            if len(batch_data) >= 50 or i == len(chunks) - 1:
                supabase.table("handbook_documents").insert(batch_data).execute()
                print(f"[Ingest] Inserted batch ending at index {i}")
                batch_data = []

        return {"success": True, "chunks_inserted": len(chunks)}
    
    except Exception as e:
        print(f"[Ingest] Critical Error: {e}")
        return {"success": False, "error": str(e)}

async def query_handbook(query: str, k: int = 4) -> List[Dict[str, Any]]:
    """
    Hybrid Search with AI Keyword Extraction.
    """
    if not LANGCHAIN_AVAILABLE:
        return []
        
    client = _get_supabase_client()
    results = []
    
    # --- STRATEGY 1: AI KEYWORD SEARCH ---
    # We await the LLM to get clean, robust keywords
    try:
        keywords_str = await _extract_keywords_with_llm(query)
        # Split into individual terms (e.g., "remote work policy" -> ["remote", "work", "policy"])
        # We search for the most significant term to keep it broad enough
        search_terms = keywords_str.split()
        
        if search_terms:
            # We construct an 'OR' query for the top keywords
            # For simplicity, we search for the first 1-2 strongest terms combined or individually
            primary_term = search_terms[0] 
            
            print(f"[Query] Database keyword search for: '{primary_term}'")
            
            kw_response = client.table("handbook_documents")\
                .select("content, metadata")\
                .ilike("content", f"%{primary_term}%")\
                .limit(k)\
                .execute()
                
            if kw_response.data:
                print(f"[Query] Keyword search found {len(kw_response.data)} matches.")
                for item in kw_response.data:
                    results.append({
                        "content": item.get('content', ''),
                        "page_number": item.get('metadata', {}).get('page_number', 'N/A'),
                        "score": 0.90, # High confidence for direct keyword hits
                        "method": f"keyword: {primary_term}"
                    })
    except Exception as e:
        print(f"[Query] Keyword search step failed: {e}")

    # --- STRATEGY 2: VECTOR SEARCH ---
    try:
        embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")
        query_vector = embeddings_model.embed_query(query)
        
        params = {
            'query_embedding': query_vector,
            'match_threshold': 0.25, 
            'match_count': k
        }
        
        vec_response = client.rpc('match_handbook', params).execute()
        
        if vec_response.data:
            print(f"[Query] Vector search found {len(vec_response.data)} matches.")
            for item in vec_response.data:
                # Deduplicate based on content content
                if not any(r['content'][:50] == item.get('content', '')[:50] for r in results):
                    results.append({
                        "content": item.get('content', ''),
                        "page_number": item.get('metadata', {}).get('page_number', 'N/A'),
                        "score": item.get('similarity', 0.0),
                        "method": "vector"
                    })
        
    except Exception as e:
        print(f"[Query] Vector search failed: {e}")

    return results[:k]

async def chat_with_rag(user_message: str) -> str:
    """Answer user questions using RAG."""
    
    # 1. Greeting Check
    greetings = ["hello", "hi", "hey", "greetings"]
    if user_message.lower().strip() in greetings:
        return "Hello! I am the Space42 Handbook Assistant. How can I help you with our company policies?"

    if not LANGCHAIN_AVAILABLE:
        from app.services.ai_agent import chat_with_ai
        return await chat_with_ai(user_message)

    try:
        # 2. Retrieve Context (Now strictly async because of the keyword extractor)
        print(f"[RAG] Processing: {user_message}")
        relevant_chunks = await query_handbook(user_message, k=4)
        
        # 3. Fallback
        if not relevant_chunks:
            print("[RAG] No context found. Switching to general chat.")
            from app.services.ai_agent import chat_with_ai
            return await chat_with_ai(user_message)

        # 4. Build Context
        context_parts = []
        pages = set()
        for chunk in relevant_chunks:
            content = chunk['content']
            page = str(chunk['page_number'])
            method = chunk.get('method', 'vector')
            context_parts.append(f"[Page {page} | via {method}] {content}")
            pages.add(page)
        
        context_block = "\n\n---\n\n".join(context_parts)
        
        # 5. Generate Answer
        system_prompt = """You are the Space42 Handbook Assistant. 
        Answer using ONLY the provided context. 
        Cite page numbers if available.
        """
        
        user_prompt_content = f"""
        CONTEXT:
        {context_block}
        
        QUESTION: 
        {user_message}
        """
        
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3)
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt_content)
        ]
        
        response = await llm.ainvoke(messages)
        answer = response.content
        
        if pages and "page" not in answer.lower():
            page_list = ", ".join(sorted(list(pages)))
            answer += f"\n\n(Source: Handbook Pages {page_list})"
            
        return answer
    
    except Exception as e:
        print(f"[RAG] Chat Error: {e}")
        import traceback
        traceback.print_exc()
        from app.services.ai_agent import chat_with_ai
        return await chat_with_ai(user_message)