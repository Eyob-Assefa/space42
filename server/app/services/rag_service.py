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
            # Use text-embedding-3-small to match the embedding model used during ingestion
            # This ensures vector search returns relevant results
            # IMPORTANT: Must use model="text-embedding-3-small" for 1536 dimensions
            embeddings = OpenAIEmbeddings(
                openai_api_key=openai_api_key,
                model="text-embedding-3-small"  # 1536 dimensions - matches handbook_documents table
            )
            print(f"[RAG Service] Initialized OpenAIEmbeddings with model: {embeddings.model}")
            llm = ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0.7,
                openai_api_key=openai_api_key
            )
        else:
            print("[RAG Service] WARNING: OPENAI_API_KEY not found in environment")
    except Exception as e:
        print(f"[RAG Service] Error initializing OpenAI: {e}")
        embeddings = None
        llm = None


def _get_supabase_client():
    """Get Supabase client from database module - ensures same client is used everywhere."""
    from app.database import get_db
    return get_db()


def _insert_handbook_document(supabase_client, content: str, metadata: dict, embedding: list):
    """
    Insert a single handbook document with proper VECTOR type handling.
    Tries multiple methods to ensure compatibility with Supabase pgvector.
    """
    # Convert embedding to list format
    if hasattr(embedding, 'tolist'):
        embedding_list = embedding.tolist()
    else:
        embedding_list = list(embedding)
    
    # Format as string for pgvector: '[0.1,0.2,...]'
    embedding_str = '[' + ','.join(map(str, embedding_list)) + ']'
    
    # Method 1: Try using RPC function if it exists
    try:
        response = supabase_client.rpc(
            'insert_handbook_document',
            {
                'p_content': content,
                'p_metadata': metadata,
                'p_embedding': embedding_str
            }
        ).execute()
        return True
    except Exception as rpc_error:
        # Method 2: Try direct insert with string format
        try:
            response = supabase_client.table("handbook_documents").insert({
                "content": content,
                "metadata": metadata,
                "embedding": embedding_str
            }).execute()
            return True
        except Exception as str_error:
            # Method 3: Try with Python list (some Supabase versions accept this)
            try:
                response = supabase_client.table("handbook_documents").insert({
                    "content": content,
                    "metadata": metadata,
                    "embedding": embedding_list
                }).execute()
                return True
            except Exception as list_error:
                # All methods failed
                error_msg = f"RPC: {rpc_error}, String: {str_error}, List: {list_error}"
                raise Exception(f"All insertion methods failed: {error_msg}")


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
        
        # Generate embeddings for all chunks
        print("Generating embeddings...")
        texts = [chunk.page_content for chunk in chunks]
        chunk_embeddings = embeddings.embed_documents(texts)
        
        # Insert documents directly into Supabase to match custom schema
        # Use raw SQL via RPC to properly handle VECTOR type
        print("Inserting documents into Supabase...")
        total_inserted = 0
        
        # Insert in batches to avoid overwhelming the database
        batch_size = 50
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i + batch_size]
            batch_embeddings = chunk_embeddings[i:i + batch_size]
            
            for chunk, embedding in zip(batch_chunks, batch_embeddings):
                try:
                    _insert_handbook_document(
                        supabase_client,
                        chunk.page_content,
                        chunk.metadata,
                        embedding
                    )
                    total_inserted += 1
                except Exception as e:
                    print(f"Error inserting document {total_inserted + 1}: {e}")
                    continue
            
            print(f"Inserted batch {i//batch_size + 1}: {min(batch_size, len(chunks) - i)} documents")
        
        return {
            "success": True,
            "chunks_created": len(chunks),
            "chunks_inserted": total_inserted,
            "pages_processed": len(documents),
            "message": f"Successfully ingested {total_inserted} of {len(chunks)} chunks from {len(documents)} pages"
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
    Enhanced search: Extracts core keywords, tries keyword search first,
    then falls back to vector search.
    """
    import re
    from app.database import get_db
    
    supabase_client = get_db()
    table_name = "handbook_documents"
    
    # 1. CLEANING & KEYWORD EXTRACTION
    # Removes "what is our", "tell me about", etc.
    stop_words = {'what', 'is', 'our', 'the', 'a', 'an', 'are', 'we', 'how', 'do', 'does', 'tell', 'me', 'about', 'companys', 'company'}
    words = re.sub(r'[^\w\s]', '', query).lower().split()
    search_terms = [w for w in words if w not in stop_words]
    
    # If no keywords remain, use the longest word from the original query
    if not search_terms:
        search_terms = [max(words, key=len)] if words else ["mission"]

    # We use the most "significant" word for the keyword search (usually the longest)
    primary_keyword = max(search_terms, key=len)
    print(f"[query_handbook] Targeting primary keyword: '{primary_keyword}'")

    results = []

    # 2. STEP 1: KEYWORD SEARCH (Most Reliable)
    try:
        keyword_res = supabase_client.table(table_name) \
            .select("id, content, metadata") \
            .ilike("content", f"%{primary_keyword}%") \
            .limit(k) \
            .execute()
        
        if keyword_res.data:
            print(f"[query_handbook] Found {len(keyword_res.data)} results via keyword search.")
            for row in keyword_res.data:
                results.append({
                    'content': row.get('content', ''),
                    'metadata': row.get('metadata', {}),
                    'similarity': 0.9  # High score for direct keyword match
                })
            return _format_rag_results(results)
    except Exception as e:
        print(f"[query_handbook] Keyword search failed: {e}")

    # 3. STEP 2: VECTOR SEARCH FALLBACK
    print(f"[query_handbook] Keyword search failed or returned 0. Falling back to Vectors.")
    try:
        query_embedding = embeddings.embed_query(query)
        rpc_res = supabase_client.rpc(
            'match_handbook',
            {
                'query_embedding': query_embedding,
                'match_threshold': 0.2, # Low threshold for safety
                'match_count': k
            }
        ).execute()

        if rpc_res.data:
            print(f"[query_handbook] Found {len(rpc_res.data)} results via Vector RPC.")
            return _format_rag_results(rpc_res.data)
    except Exception as e:
        print(f"[query_handbook] Vector search failed: {e}")

    return []

def _format_rag_results(rows: list) -> list:
    """Helper to standardize results for the Chatbot."""
    formatted = []
    for row in rows:
        metadata = row.get('metadata', {})
        formatted.append({
            "content": row.get('content', ''),
            "page_number": metadata.get("page_number", 1),
            "score": float(row.get('similarity', 0.0))
        })
    return formatted


async def chat_with_rag(user_message: str) -> str:
    """
    Answer user questions using RAG (Retrieval Augmented Generation).
    Uses handbook data from Supabase to provide accurate answers with page citations.
    
    Flow:
    1. Query handbook_documents vector store using user's message
    2. Retrieve top 1-3 relevant chunks
    3. Format context and inject into system prompt
    4. Send to LLM with updated system prompt
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
                    {"role": "system", "content": "You are the Space42 Platform Assistant. You help users with general platform tasks and questions."},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        
        # RETRIEVAL STEP: Query handbook_documents vector store
        print(f"[RAG] Querying handbook for: {user_message}")
        relevant_chunks = query_handbook(user_message, k=3)
        
        # PRINT THE CONTEXT: Log what query_handbook returns
        print(f"[RAG] query_handbook returned {len(relevant_chunks)} chunks")
        if relevant_chunks:
            for i, chunk in enumerate(relevant_chunks):
                print(f"[RAG] Chunk {i+1}: Page {chunk.get('page_number', 'N/A')}, Score: {chunk.get('score', 'N/A')}, Content preview: {chunk.get('content', '')[:100]}...")
        else:
            print("[RAG] WARNING: query_handbook returned empty list - no chunks found!")
        
        # CONTEXT INJECTION: Format top 1-3 relevant chunks
        context_block = ""
        page_numbers = set()
        
        if relevant_chunks:
            # Take top 1-3 chunks (already sorted by relevance)
            top_chunks = relevant_chunks[:3]
            context_parts = []
            
            for chunk in top_chunks:
                content = chunk.get("content", "")
                if content:  # Only add non-empty content
                    context_parts.append(content)
                    page_num = chunk.get("page_number", 0)
                    if page_num:
                        page_numbers.add(page_num)
            
            # CHECK THE LOGIC: Ensure results are joined into a single string
            if context_parts:
                # Format as "CONTEXT FROM HANDBOOK" block
                context_block = "CONTEXT FROM HANDBOOK:\n" + "\n\n".join(context_parts)
                pages_str = ", ".join(sorted([str(p) for p in page_numbers])) if page_numbers else ""
                print(f"[RAG] Context block created: {len(context_block)} characters, Pages: {pages_str}")
            else:
                print("[RAG] WARNING: All chunks had empty content!")
                context_block = ""
                pages_str = ""
        else:
            # No relevant chunks found - will use fallback mode
            print("[RAG] No relevant handbook chunks found for query")
            pages_str = ""
        
        # FORCE ACCESS: Update system prompt to force AI to use context
        if context_block:
            # System prompt that forces the AI to use the provided context
            system_prompt = """You are the Space42 Platform Assistant. You MUST use the provided handbook context when necessary. If context is provided below, you DO have access to company data. Use it to answer! Do not say you don't have access - the context IS your access."""
        else:
            # ERROR HANDLING: Fallback to general assistant mode
            print("[RAG] Falling back to general assistant mode (no handbook context)")
            system_prompt = "You are the Space42 Platform Assistant. Help users with general platform tasks and questions. If asked about company policies, mention that the information isnot available right now, but you can help with other platform features."
        
        # PROMPT ASSEMBLY: Combine context and user question
        # CHECK THE LOGIC: Ensure context is properly added to the message
        if context_block:
            # Use handbook context - format it clearly
            user_prompt = f"{context_block}\n\n---\n\nQuestion: {user_message}"
            
            # Add page citation instruction if we have pages
            if pages_str:
                user_prompt += f"\n\n(Reference: Handbook pages {pages_str})"
            
            print(f"[RAG] User prompt length: {len(user_prompt)} characters")
            print(f"[RAG] Context included in prompt: {len(context_block)} characters")
        else:
            user_prompt = user_message
            print(f"[RAG] No context block - using user message only: {len(user_prompt)} characters")
        
        # Send to ChatOpenAI model
        # LangChain ChatOpenAI accepts messages as a list of message objects or a string
        # Format: Use HumanMessage and SystemMessage from langchain.schema
        from langchain.schema import HumanMessage, SystemMessage
        
        # CHECK THE LOGIC: Ensure both SystemMessage and HumanMessage contain the right content
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        print(f"[RAG] System prompt: {system_prompt[:100]}...")
        print(f"[RAG] User prompt preview: {user_prompt[:200]}...")
        print(f"[RAG] Sending {len(messages)} messages to LLM")
        
        response = llm.invoke(messages)
        answer = response.content if hasattr(response, 'content') else str(response)
        
        print(f"[RAG] LLM response received: {len(answer)} characters")
        
        # Ensure page numbers are mentioned if we have context
        if pages_str and context_block and pages_str not in answer:
            answer += f" (Source: Handbook pages {pages_str})"
        
        return answer
    
    except Exception as e:
        print(f"Error in RAG chat: {e}")
        import traceback
        traceback.print_exc()
        # ERROR HANDLING: Graceful fallback
        try:
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are the Space42 Platform Assistant. Help users with general questions."},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as fallback_error:
            print(f"Fallback also failed: {fallback_error}")
            return "I'm having trouble connecting right now. Please try again later."
