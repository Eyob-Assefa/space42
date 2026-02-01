from openai import OpenAI
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def score_resume(cv_text: str, job_description: str, ideal_candidate: str = "") -> float:
    """Score a resume against job description and ideal candidate description."""
    try:
        prompt = f"""
        You are a recruitment AI assistant. Score this resume on a scale of 0-100 based on:
        1. Relevance to the job description
        2. Match with ideal candidate description
        3. Experience and skills alignment
        
        Job Description: {job_description}
        
        Ideal Candidate Description: {ideal_candidate if ideal_candidate else "General fit"}
        
        Resume Text:
        {cv_text[:3000]}  # Limit to avoid token limits
        
        Return ONLY a number between 0 and 100. No explanation.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a recruitment scoring assistant. Return only numbers."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=10
        )
        
        score_text = response.choices[0].message.content.strip()
        score = float(score_text)
        return max(0, min(100, score))  # Clamp between 0-100
    except Exception as e:
        print(f"Error scoring resume: {e}")
        return 50.0  # Default score


async def match_jobs_with_cv(cv_text: str, jobs_list: List[Dict]) -> str:
    """Match a candidate's CV to available jobs using AI."""
    try:
        jobs_summary = "\n\n".join([
            f"Job ID: {j.get('id')}\nTitle: {j.get('title')}\nDescription: {j.get('description', '')[:500]}"
            for j in jobs_list
        ])
        
        prompt = f"""
        You are a recruitment AI assistant for Space42. Based on the candidate's CV/resume, recommend which jobs are the best match.
        
        Available Jobs:
        {jobs_summary}
        
        Candidate's CV/Resume:
        {cv_text[:4000]}
        
        For each job that matches well, explain why it's a good fit. Rank the top 3-5 matches.
        If no jobs match well, say so and suggest what skills they might develop.
        Be helpful and encouraging.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful recruitment assistant matching candidates to jobs."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error matching jobs: {e}")
        return "I'm having trouble analyzing your CV right now. Please try again later."


async def chat_with_ai(user_message: str) -> str:
    """Handle chatbot conversations."""
    try:
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
    except Exception as e:
        print(f"Error in AI chat: {e}")
        return "I'm having trouble connecting right now. Please try again later."


async def generate_interview_email(candidate_name: str, job_title: str) -> str:
    """Generate an interview email template."""
    try:
        prompt = f"""
        Generate a professional interview invitation email for:
        Candidate: {candidate_name}
        Position: {job_title}
        
        Keep it concise and professional.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an HR assistant generating professional emails."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating email: {e}")
        return f"Dear {candidate_name},\n\nWe would like to invite you for an interview for the {job_title} position.\n\nBest regards,\nSpace42 Team"


async def handle_recruiter_instruction(
    message: str,
    job_id: int,
    application_ids: Optional[List[int]],
    current_application_id: Optional[int],
    db
) -> dict:
    """Handle recruiter instructions: /filter, /rank, /email. Returns response and optionally filtered/ranked IDs."""
    msg_lower = message.strip().lower()
    
    # Fetch applications
    if application_ids:
        response = db.table("applications").select("*").in_("id", application_ids).execute()
    else:
        response = db.table("applications").select("*").eq("job_id", job_id).execute()
    
    applications = response.data or []
    
    # Get job info
    job_response = db.table("jobs").select("*").eq("id", job_id).execute()
    job = job_response.data[0] if job_response.data else {}
    job_title = job.get("title", "the position")
    
    # /filter - filter by skill/criteria
    if msg_lower.startswith("/filter"):
        criteria = message[7:].strip() or "general fit"
        filtered = [
            a for a in applications
            if criteria.lower() in (a.get("tech_stack") or "").lower()
            or criteria.lower() in (a.get("name") or "").lower()
        ]
        if not filtered and criteria.lower() != "general fit":
            filtered = [a for a in applications if criteria.lower() in str(a).lower()]
        response_text = f"Filtered to {len(filtered)} applicant(s) matching '{criteria}'."
        return {
            "response": response_text,
            "application_ids": [a["id"] for a in filtered],
            "instruction": "filter"
        }
    
    # /rank - re-rank by experience, skills, or score
    if msg_lower.startswith("/rank"):
        by = message[5:].strip().lower() or "score"
        if "experience" in by or "exp" in by:
            sorted_apps = sorted(applications, key=lambda a: a.get("years_of_experience", 0), reverse=True)
            response_text = f"Ranked {len(sorted_apps)} applicants by experience (highest first)."
        elif "skill" in by or "tech" in by:
            sorted_apps = sorted(applications, key=lambda a: len((a.get("tech_stack") or "").split(",")), reverse=True)
            response_text = f"Ranked {len(sorted_apps)} applicants by tech stack breadth."
        else:
            sorted_apps = sorted(applications, key=lambda a: a.get("ai_score", 0), reverse=True)
            response_text = f"Ranked {len(sorted_apps)} applicants by AI score."
        return {
            "response": response_text,
            "application_ids": [a["id"] for a in sorted_apps],
            "instruction": "rank"
        }
    
    # /email - generate interview email for current applicant
    if msg_lower.startswith("/email"):
        if not current_application_id:
            return {"response": "Please select an applicant first to generate an email.", "instruction": "email"}
        app = next((a for a in applications if a["id"] == current_application_id), None)
        if not app:
            return {"response": "Applicant not found.", "instruction": "email"}
        email_content = await generate_interview_email(app["name"], job_title)
        return {
            "response": f"Generated interview email for {app['name']}:\n\n{email_content}",
            "email_content": email_content,
            "instruction": "email"
        }
    
    # Normal chat - AI responds helpfully
    try:
        apps_summary = "\n".join([
            f"- {a.get('name')} (Score: {a.get('ai_score', 0):.1f}, Exp: {a.get('years_of_experience')}y, Tech: {a.get('tech_stack', 'N/A')})"
            for a in applications[:10]
        ]) if applications else "No applicants yet."
        prompt = f"""You are a recruitment AI assistant for Space42. The recruiter is viewing applicants for job "{job_title}".
        
Current applicants ({len(applications)} total):
{apps_summary}

Recruiter message: {message}

Respond helpfully. You can suggest using /filter, /rank, or /email for specific actions. Be concise."""
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful recruitment assistant. Be concise and actionable."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=300
        )
        return {"response": response.choices[0].message.content, "instruction": None}
    except Exception as e:
        print(f"Error in recruiter chat: {e}")
        return {"response": "I'm having trouble processing that. Try /filter, /rank, or /email for specific actions.", "instruction": None}


async def suggest_interview_questions(job_title: str, tech_stack: str) -> List[str]:
    """Suggest interview questions based on job and tech stack."""
    try:
        prompt = f"""
        Generate 5 relevant interview questions for:
        Position: {job_title}
        Tech Stack: {tech_stack}
        
        Return only the questions, one per line, numbered.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an HR assistant generating interview questions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        
        questions_text = response.choices[0].message.content
        questions = [q.strip() for q in questions_text.split('\n') if q.strip() and q.strip()[0].isdigit()]
        return questions[:5]
    except Exception as e:
        print(f"Error generating questions: {e}")
        return [
            "Tell me about yourself.",
            "Why are you interested in this position?",
            "What is your experience with the required technologies?",
            "Describe a challenging project you worked on.",
            "Where do you see yourself in 5 years?"
        ]

