from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"


class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    INTERVIEW = "interview"
    OFFER = "offer"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)  # Supabase UUID
    email = Column(String, unique=True, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="candidate")
    jobs = relationship("Job", back_populates="recruiter")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    requirements = Column(Text)
    recruiter_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    recruiter = relationship("User", back_populates="jobs")
    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    years_of_experience = Column(Integer, nullable=False)
    tech_stack = Column(String, nullable=False)
    cv_url = Column(String)  # Supabase Storage URL
    ai_score = Column(Float, default=0.0)
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.APPLIED)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("User", back_populates="applications")
    comments = relationship("Comment", back_populates="application")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    application = relationship("Application", back_populates="comments")

