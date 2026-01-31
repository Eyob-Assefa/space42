from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, jobs, applicants, chat

app = FastAPI(title="Space42 API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applicants.router)
app.include_router(chat.router)


@app.get("/")
async def root():
    return {"message": "Space42 API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

