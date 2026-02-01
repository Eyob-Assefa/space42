from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"


class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    INTERVIEW = "interview"
    OFFER = "offer"


class UserBase(BaseModel):
    email: EmailStr
    role: UserRole
    name: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: str
    cv_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class JobBase(BaseModel):
    title: str
    description: Optional[str] = None
    requirements: Optional[str] = None


class JobCreate(JobBase):
    pass


class JobResponse(JobBase):
    id: int
    recruiter_id: str
    created_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class ApplicationBase(BaseModel):
    name: str
    email: EmailStr
    years_of_experience: int
    tech_stack: str


class ApplicationCreate(ApplicationBase):
    job_id: int


class ApplicationResponse(ApplicationBase):
    id: int
    job_id: int
    candidate_id: str
    cv_url: Optional[str] = None
    ai_score: float
    status: ApplicationStatus
    created_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    application_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class AIScoringRequest(BaseModel):
    ideal_candidate_description: str
    application_ids: Optional[List[int]] = None


class ChatMessage(BaseModel):
    message: str


class ChatMatchJobsRequest(BaseModel):
    message: str
    cv_text: Optional[str] = None


class RecruiterInstructionRequest(BaseModel):
    message: str
    job_id: int
    application_ids: Optional[List[int]] = None
    current_application_id: Optional[int] = None

