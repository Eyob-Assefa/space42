"""
RAG (Retrieval Augmented Generation) service for Space42 company chatbot.
Uses LangChain to load company data from PDF and answer questions.
"""
import os
from pathlib import Path
from typing import List, Optional
try:
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_openai import OpenAIEmbeddings, ChatOpenAI
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import FAISS
    from langchain.chains import RetrievalQA
    from langchain.prompts import PromptTemplate
    from langchain.schema import Document
except ImportError:
    # Fallback for older langchain versions
    try:
        from langchain.document_loaders import PyPDFLoader
        from langchain.embeddings import OpenAIEmbeddings
        from langchain.chat_models import ChatOpenAI
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        from langchain.vectorstores import FAISS
        from langchain.chains import RetrievalQA
        from langchain.prompts import PromptTemplate
        from langchain.schema import Document
    except ImportError:
        # If langchain is not available, we'll use a simple fallback
        Document = None
        PyPDFLoader = None
        FAISS = None
        RetrievalQA = None
        PromptTemplate = None
        RecursiveCharacterTextSplitter = None
from dotenv import load_dotenv

load_dotenv()

# Path to company data PDF
COMPANY_DATA_PATH = Path(__file__).parent.parent.parent / "data" / "space42_company_data.pdf"

# Initialize embeddings and LLM (will be None if langchain not available)
try:
    embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
    llm = ChatOpenAI(
        model_name="gpt-3.5-turbo",
        temperature=0.7,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
except:
    embeddings = None
    llm = None

# Global variable to store the vector store
_vector_store: Optional[FAISS] = None


def _load_company_data() -> List:
    """Load and process company data from PDF."""
    if not COMPANY_DATA_PATH.exists():
        print(f"Warning: Company data PDF not found at {COMPANY_DATA_PATH}")
        print("Creating placeholder file...")
        _create_placeholder_pdf()
        # Return default content if PDF doesn't exist
        if Document is None:
            return []
        return [
            Document(page_content="Space42 is a recruitment platform that connects candidates with jobs. We offer AI-powered screening, resume analysis, and job management services.")
        ]
    
    try:
        loader = PyPDFLoader(str(COMPANY_DATA_PATH))
        documents = loader.load()
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_documents(documents)
        return chunks
    except Exception as e:
        print(f"Error loading company data: {e}")
        # Return default content on error
        if Document is None:
            return []
        return [
            Document(page_content="Space42 is a recruitment platform that connects candidates with jobs. We offer AI-powered screening, resume analysis, and job management services.")
        ]


def _create_placeholder_pdf():
    """Create a placeholder PDF file with basic company information."""
    try:
        from PyPDF2 import PdfWriter
        from io import BytesIO
        
        # Create data directory if it doesn't exist
        COMPANY_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        
        # For now, create a simple text file that can be converted
        # In production, you would have a real PDF file
        text_content = """Space42 Company Information

Welcome to Space42!

About Space42:
Space42 is a cutting-edge recruitment platform that connects talented candidates with innovative companies. We specialize in space-themed technology recruitment and help both candidates and recruiters find their perfect match.

Our Mission:
To revolutionize the recruitment industry by making the hiring process more efficient, transparent, and space-themed!

Services:
- Job Posting and Management
- AI-Powered Candidate Screening
- Resume Analysis and Scoring
- Interview Scheduling and Management
- Company Information and Resources

Contact:
For more information, please visit our website or contact our support team.
"""
        
        # Create a simple text file (placeholder - in production use actual PDF)
        text_path = COMPANY_DATA_PATH.with_suffix('.txt')
        with open(text_path, 'w', encoding='utf-8') as f:
            f.write(text_content)
        
        print(f"Created placeholder text file at {text_path}")
        print(f"Note: Please add a proper PDF file at {COMPANY_DATA_PATH} for production use")
    except Exception as e:
        print(f"Error creating placeholder file: {e}")


def _get_vector_store():
    """Get or create the vector store for company data."""
    global _vector_store
    
    if FAISS is None or embeddings is None:
        return None
    
    if _vector_store is None:
        # Load company data
        chunks = _load_company_data()
        
        if not chunks:
            # If no data loaded, create a simple in-memory store
            if Document is None:
                chunks = []
            else:
                chunks = [
                    Document(page_content="Space42 is a recruitment platform. We help connect candidates with jobs.")
                ]
        
        if chunks:
            # Create vector store
            _vector_store = FAISS.from_documents(chunks, embeddings)
    
    return _vector_store


async def chat_with_rag(user_message: str) -> str:
    """
    Answer user questions using RAG (Retrieval Augmented Generation).
    Uses company data from PDF to provide accurate answers.
    """
    try:
        # Check if langchain is available
        if FAISS is None or llm is None or embeddings is None:
            # Fallback to simple OpenAI chat
            from openai import OpenAI
            import os
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a friendly AI assistant for Space42, a space-themed recruitment platform. Be helpful, concise, and space-themed in your responses."},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=200
            )
            return response.choices[0].message.content
        
        vector_store = _get_vector_store()
        
        # Create prompt template
        prompt_template = """Use the following pieces of context about Space42 company to answer the question.
        If you don't know the answer based on the context, say that you don't know, but try to be helpful.
        Be friendly and space-themed in your responses.
        
        Context: {context}
        
        Question: {question}
        
        Answer:"""
        
        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Create retrieval QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vector_store.as_retriever(search_kwargs={"k": 3}),
            chain_type_kwargs={"prompt": PROMPT},
            return_source_documents=False
        )
        
        # Get answer
        result = qa_chain.invoke({"query": user_message})
        return result.get("result", "I'm having trouble processing that. Please try again.")
    
    except Exception as e:
        print(f"Error in RAG chat: {e}")
        # Fallback to simple response
        return "I'm having trouble connecting right now. Please try again later."

