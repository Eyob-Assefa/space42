import json
import os
from typing import List, Dict, Optional, Any
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def score_resume(cv_text: str, job_description: str, ideal_candidate: str = "") -> float:
    """Score a resume using OpenAI JSON mode for reliability."""
    try:
        system_prompt = "You are a recruitment scoring engine. You must output JSON only."
        user_prompt = f"""
        Score this resume (0-100) based on:
        1. Relevance to: {job_description}
        2. Match with ideal candidate: {ideal_candidate if ideal_candidate else "General fit"}
        
        Resume:
        {cv_text[:3000]}
        
        Output format: {{ "score": <number_0_to_100>, "reasoning": "<short_summary>" }}
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        
        data = json.loads(response.choices[0].message.content)
        score = float(data.get("score", 50.0))
        return max(0.0, min(100.0, score))
        
    except Exception as e:
        print(f"[AI Agent] Error scoring resume: {e}")
        return 50.0

async def match_jobs_with_cv(cv_text: str, jobs_list: List[Dict]) -> str:
    """Match a candidate's CV to available jobs."""
    try:
        if not jobs_list:
            return "There are currently no open positions to match against."

        jobs_summary = "\n".join([
            f"- ID {j.get('id')}: {j.get('title')}" 
            for j in jobs_list
        ])
        
        prompt = f"""
        Role: Recruitment Advisor.
        Task: Match candidate to best 3 jobs.
        
        Candidate CV:
        {cv_text[:2000]}...
        
        Jobs:
        {jobs_summary}
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[AI Agent] Error matching jobs: {e}")
        return "I'm having trouble analyzing the job list."

async def chat_with_ai(user_message: str) -> str:
    """General chatbot conversation."""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful recruitment AI. Be concise."},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=250
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[AI Agent] Chat error: {e}")
        return "I'm having trouble connecting to the AI service."


async def generate_interview_email(candidate_name: str, job_title: str) -> str:
    """Generate a professional interview invitation email with Space42 branding."""
    try:
        prompt = f"""
        Write a short, professional interview invitation email for:
        Candidate: {candidate_name}
        Role: {job_title}
        
        IMPORTANT: You must sign off the email exactly like this:
        
        Best regards,
        
        Recruiter
        Human Resources
        Space42
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[AI Agent] Email error: {e}")
        # Fallback with correct branding if AI fails
        return f"Dear {candidate_name},\n\nPlease join us for an interview for the {job_title} role.\n\nBest regards,\n\nRecruiter\nHuman Resources\nSpace42"

async def suggest_interview_questions(job_title: str, tech_stack: str) -> List[str]:
    """Suggest interview questions."""
    try:
        prompt = f"""
        Generate 5 technical interview questions for:
        Role: {job_title}
        Stack: {tech_stack}
        Return only the questions, numbered 1-5.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        text = response.choices[0].message.content
        return [q.strip() for q in text.split('\n') if q.strip() and q.strip()[0].isdigit()][:5]
    except Exception as e:
        return ["1. Tell me about yourself."]

# --- THE FIXED RECRUITER INSTRUCTION HANDLER ---
async def handle_recruiter_instruction(
    message: str,
    job_id: int,
    application_ids: Optional[List[int]],
    current_application_id: Optional[int],
    supabase_client: Any
) -> dict:
    """
    Handles /filter, /rank, /email using proper AI logic.
    """
    msg_lower = message.strip().lower()
    
    # 1. Fetch Data
    try:
        # If specific IDs provided (e.g. from previous filter), use them. Otherwise fetch all for job.
        query = supabase_client.table("applications").select("*")
        
        if application_ids:
            query = query.in_("id", application_ids)
        else:
            query = query.eq("job_id", job_id)
            
        response = query.execute()
        applications = response.data or []
        
        # Get Job Title
        job_res = supabase_client.table("jobs").select("title").eq("id", job_id).execute()
        job_title = job_res.data[0]['title'] if job_res.data else "the position"
        
    except Exception as e:
        print(f"[AI Agent] DB Fetch Error: {e}")
        return {"response": "Error fetching data.", "instruction": None}

    # --- TOOL 1: /filter (AI Logic) ---
    if msg_lower.startswith("/filter"):
        criteria = message[7:].strip()
        if not criteria:
            return {"response": "Please provide criteria, e.g., '/filter experience > 5'", "instruction": None}

        # Prepare data for AI
        candidates_summary = []
        for app in applications:
            candidates_summary.append({
                "id": app["id"],
                "name": app["name"],
                "years_of_experience": app["years_of_experience"],
                "tech_stack": app["tech_stack"],
                "ai_score": app["ai_score"]
            })
            
        # Ask AI to filter
        system_prompt = """You are a data filtering engine. 
        Return a JSON object with a list of 'ids' that match the user's criteria. 
        Example: {"ids": [1, 5, 8]}
        """
        
        user_prompt = f"""
        Candidates:
        {json.dumps(candidates_summary, indent=2)}
        
        Filter Criteria: "{criteria}"
        
        Return JSON with matching IDs only.
        """
        
        try:
            ai_res = client.chat.completions.create(
                model="gpt-3.5-turbo-1106",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0
            )
            result = json.loads(ai_res.choices[0].message.content)
            filtered_ids = result.get("ids", [])
            
            # Count matches
            count = len(filtered_ids)
            
            return {
                "response": f"Filtered candidates based on '{criteria}'. Found {count} matches.",
                "application_ids": filtered_ids,
                "instruction": "filter"
            }
        except Exception as e:
            print(f"Filter error: {e}")
            return {"response": "I had trouble understanding that filter criteria.", "instruction": None}

    # --- TOOL 2: /rank (Python Logic is safer/faster here) ---
    if msg_lower.startswith("/rank"):
        criteria = message[5:].strip().lower()
        
        sorted_apps = []
        msg = ""
        
        if "exp" in criteria:
            sorted_apps = sorted(applications, key=lambda x: x.get("years_of_experience", 0), reverse=True)
            msg = "Ranked by experience (highest first)."
        elif "score" in criteria or "ai" in criteria:
            sorted_apps = sorted(applications, key=lambda x: x.get("ai_score", 0), reverse=True)
            msg = "Ranked by AI Match Score."
        else:
            # Default to score
            sorted_apps = sorted(applications, key=lambda x: x.get("ai_score", 0), reverse=True)
            msg = "Ranked by AI Score (default)."
            
        return {
            "response": msg,
            "application_ids": [app["id"] for app in sorted_apps],
            "instruction": "rank"
        }

    # --- TOOL 3: /email (AI Generation) ---
    if msg_lower.startswith("/email"):
        if not current_application_id:
            return {"response": "Please click on a specific candidate first to generate an email.", "instruction": None}
            
        # Find the specific candidate
        candidate = next((a for a in applications if a["id"] == current_application_id), None)
        
        if not candidate:
            return {"response": "Selected candidate not found in the current list.", "instruction": None}
            
        email_body = await generate_interview_email(candidate["name"], job_title)
        
        return {
            "response": f"Draft for {candidate['name']}:\n\n{email_body}",
            "email_content": email_body,
            "instruction": "email"
        }

    # --- STANDARD CHAT (Context Aware) ---
    # If no command, just chat about the visible candidates
    summary_text = "\n".join([f"- {a['name']} (Exp: {a['years_of_experience']}, Stack: {a['tech_stack']})" for a in applications[:5]])
    
    chat_response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful recruitment assistant. The user is looking at a list of candidates."},
            {"role": "user", "content": f"Context candidates:\n{summary_text}\n\nUser says: {message}"}
        ],
        temperature=0.7
    )
    
    return {
        "response": chat_response.choices[0].message.content,
        "instruction": None
    }