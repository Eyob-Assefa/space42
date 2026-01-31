# Space42 - Recruitment Platform MVP

A hackathon-ready, fully functional MVP for a space-themed recruitment platform with AI-powered resume screening.

## 🚀 Features

### Candidate Experience
- **Landing Page**: Space-themed interactive landing page with floating chatbot
- **Job Listings**: Browse and apply to job openings
- **Application Flow**: Upload CV, enter details, submit applications
- **Life at Space42**: Virtual tour page

### Recruiter Experience
- **Dashboard**: View all job postings with applicant counts
- **Resume Screening**: AI-powered candidate evaluation
- **AI Matching**: Describe ideal candidate and auto-score applications
- **AI Actions**: Generate interview emails, suggest questions

### AI Features
- **Chatbot**: OpenAI-powered assistant on landing page
- **Resume Scoring**: AI analyzes CVs against job descriptions
- **Smart Matching**: Re-score candidates based on ideal candidate description

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database & Auth**: Supabase (PostgreSQL, Auth)
- **File Storage**: Supabase Storage
- **AI**: OpenAI API

## 📁 Project Structure

```
space42-platform/
├── client/                 # Next.js frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── app/           # App Router pages
│       ├── components/    # React components
│       └── lib/           # Utilities
├── server/                # FastAPI backend
│   └── app/
│       ├── api/           # API endpoints
│       ├── services/      # Business logic
│       └── models/        # Database models & schemas
└── docker-compose.yml     # Docker configuration
```

## 🏃 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (optional)
- Supabase account
- OpenAI API key

### Setup

1. **Clone and navigate to the project**
   ```bash
   cd space42-platform
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Create a storage bucket named `cvs` (public)
   - Note your Supabase URL and keys

3. **Backend Setup**
   ```bash
   cd server
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Frontend Setup**
   ```bash
   cd client
   npm install
   # Create .env.local with:
   # NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   # NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

5. **Database Setup**
   - The database tables will be created automatically on first run
   - Or run migrations manually if needed

6. **Run the Application**

   **Option A: Docker Compose**
   ```bash
   docker-compose up
   ```

   **Option B: Manual**
   ```bash
   # Terminal 1 - Backend
   cd server
   uvicorn app.main:app --reload

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🔐 Authentication

- Uses Supabase Auth
- Two roles: `candidate` and `recruiter`
- First-time users are automatically signed up
- Session persists across page refreshes

## 📝 Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/space42
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 Usage

### For Candidates
1. Visit the landing page
2. Click "Explore Jobs"
3. Login/Sign up (select Candidate role)
4. Browse jobs and click to apply
5. Fill application form and upload CV
6. Submit application

### For Recruiters
1. Login/Sign up (select Recruiter role)
2. View dashboard with all jobs
3. Click a job to see applicants
4. Use filters to narrow down candidates
5. Enter ideal candidate description and re-score
6. Use AI actions: generate emails, suggest questions
7. Update candidate status (Applied → Interview → Offer)

## 🤖 AI Features

- **Chatbot**: Ask questions on the landing page
- **Resume Scoring**: Automatic scoring when CV is uploaded
- **AI Matching**: Re-score based on ideal candidate description
- **Email Generation**: Generate interview invitation emails
- **Question Suggestions**: Get relevant interview questions

## 📦 API Endpoints

### Auth
- `POST /api/auth/verify` - Verify Supabase token
- `POST /api/auth/create-profile` - Create user profile

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/{id}` - Get job details
- `POST /api/jobs` - Create job (recruiter only)
- `GET /api/jobs/{id}/applicants` - Get applicants for a job

### Applicants
- `POST /api/applicants/apply` - Submit application
- `GET /api/applicants/screening/{job_id}` - Get applicants for screening
- `POST /api/applicants/ai-score` - Re-score applicants
- `PATCH /api/applicants/{id}/status` - Update application status
- `POST /api/applicants/{id}/generate-email` - Generate interview email
- `POST /api/applicants/{id}/suggest-questions` - Get interview questions

### Chat
- `POST /api/chat` - Chat with AI assistant

## 🐛 Troubleshooting

- **Database connection errors**: Check DATABASE_URL in .env
- **Supabase errors**: Verify Supabase credentials and bucket exists
- **OpenAI errors**: Check API key and quota
- **CORS errors**: Ensure backend CORS allows frontend origin
- **File upload errors**: Verify Supabase Storage bucket `cvs` exists and is public

## 📄 License

MIT

## 🙏 Notes

- This is a hackathon MVP - some features are simplified
- Placeholder images/videos should be replaced with actual assets
- Database migrations may need manual setup in production
- OpenAI API usage will incur costs

