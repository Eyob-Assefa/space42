'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import RecruiterChatPanel from '@/components/RecruiterChatPanel'

interface Application {
  id: number
  name: string
  email: string
  years_of_experience: number
  tech_stack: string
  cv_url: string | null
  ai_score: number
  status: string
}

const MOCK_APPLICATIONS: Application[] = [
  { id: 1, name: 'Mariam Mansouri', email: 'mariam@example.com', years_of_experience: 8, tech_stack: 'Next.js, Python, AI', cv_url: '/documents/mock-cv1.pdf', ai_score: 98, status: 'applied' },
  { id: 2, name: 'Sarah Connor', email: 'sarah@example.com', years_of_experience: 6, tech_stack: 'Cyber, Rust, C++', cv_url: '/documents/mock-cv2.pdf', ai_score: 92, status: 'applied' },
  { id: 3, name: 'James Holden', email: 'james@example.com', years_of_experience: 5, tech_stack: 'Go, K8s, Docker', cv_url: '/documents/mock-cv3.pdf', ai_score: 88, status: 'applied' },
  { id: 4, name: 'Amos Burton', email: 'amos@example.com', years_of_experience: 12, tech_stack: 'C, Linux, Embedded', cv_url: '/documents/mock-cv1.pdf', ai_score: 95, status: 'applied' },
  { id: 5, name: 'Chrisjen Avasarala', email: 'chris@example.com', years_of_experience: 20, tech_stack: 'Leadership, Strategy, Polished', cv_url: '/documents/mock-cv2.pdf', ai_score: 84, status: 'applied' },
  { id: 6, name: 'Bobbie Draper', email: 'bobbie@example.com', years_of_experience: 7, tech_stack: 'Python, Django, AWS', cv_url: '/documents/mock-cv3.pdf', ai_score: 91, status: 'applied' },
  { id: 7, name: 'Arthur Dent', email: 'arthur@example.com', years_of_experience: 2, tech_stack: 'React, Tailwind, Node', cv_url: '/documents/mock-cv1.pdf', ai_score: 72, status: 'applied' },
  { id: 8, name: 'Ford Prefect', email: 'ford@example.com', years_of_experience: 15, tech_stack: 'Ruby, Rails, Postgres', cv_url: '/documents/mock-cv2.pdf', ai_score: 89, status: 'applied' },
  { id: 9, name: 'Tricia McMillan', email: 'tricia@example.com', years_of_experience: 4, tech_stack: 'Vue, Firebase, GCP', cv_url: '/documents/mock-cv3.pdf', ai_score: 86, status: 'applied' },
  { id: 10, name: 'Zaphod Beeblebrox', email: 'zaphod@example.com', years_of_experience: 10, tech_stack: 'PHP, Laravel, MySQL', cv_url: '/documents/mock-cv3.pdf', ai_score: 78, status: 'applied' },
  { id: 11, name: 'Elaine Marley', email: 'elaine@example.com', years_of_experience: 9, tech_stack: 'Java, Spring Boot, Oracle', cv_url: '/documents/mock-cv1.pdf', ai_score: 93, status: 'applied' },
  { id: 12, name: 'Guybrush Threepwood', email: 'guybrush@example.com', years_of_experience: 3, tech_stack: 'Swift, SwiftUI, iOS', cv_url: '/documents/mock-cv2.pdf', ai_score: 81, status: 'applied' },
  { id: 13, name: 'Stan S. Stanman', email: 'stan@example.com', years_of_experience: 11, tech_stack: 'Salesforce, CRM, Apex', cv_url: '/documents/mock-cv3.pdf', ai_score: 75, status: 'applied' },
  { id: 14, name: 'Lara Croft', email: 'lara@example.com', years_of_experience: 8, tech_stack: 'Kotlin, Android, Coroutines', cv_url: '/documents/mock-cv1.pdf', ai_score: 94, status: 'applied' },
  { id: 15, name: 'Nathan Drake', email: 'nathan@example.com', years_of_experience: 6, tech_stack: 'Flutter, Dart, GraphQL', cv_url: '/documents/mock-cv2.pdf', ai_score: 87, status: 'applied' },
  { id: 16, name: 'Jill Valentine', email: 'jill@example.com', years_of_experience: 5, tech_stack: 'C#, .NET, Azure', cv_url: '/documents/mock-cv3.pdf', ai_score: 90, status: 'applied' },
  { id: 17, name: 'Leon Kennedy', email: 'leon@example.com', years_of_experience: 4, tech_stack: 'Angular, RxJS, SASS', cv_url: '/documents/mock-cv1.pdf', ai_score: 83, status: 'applied' },
  { id: 18, name: 'Ada Wong', email: 'ada@example.com', years_of_experience: 9, tech_stack: 'Svelte, Vite, Vercel', cv_url: '/documents/mock-cv2.pdf', ai_score: 96, status: 'applied' },
  { id: 19, name: 'Joel Miller', email: 'joel@example.com', years_of_experience: 14, tech_stack: 'Python, Flask, PyTorch', cv_url: '/documents/mock-cv3.pdf', ai_score: 85, status: 'applied' },
  { id: 20, name: 'Ellie Williams', email: 'ellie@example.com', years_of_experience: 3, tech_stack: 'React Native, Redux, Node', cv_url: '/documents/mock-cv1.pdf', ai_score: 97, status: 'applied' },
];

export default function CVViewerPage() {
  const params = useParams()
  const jobId = parseInt(params.jobId as string, 10) || 1
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredIds, setFilteredIds] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)

  const displayList = filteredIds.length ? applications.filter(a => filteredIds.includes(a.id)) : applications
  const currentApp = displayList[currentIndex] || null

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/applicants/screening/${jobId}`
        )
        const data = res.data
        if (Array.isArray(data) && data.length > 0) {
          setApplications(data)
          setFilteredIds(data.map((a: Application) => a.id))
        } else {
          setApplications(MOCK_APPLICATIONS)
          setFilteredIds(MOCK_APPLICATIONS.map(a => a.id))
        }
      } catch {
        setApplications(MOCK_APPLICATIONS)
        setFilteredIds(MOCK_APPLICATIONS.map(a => a.id))
      } finally {
        setLoading(false)
      }
    }
    fetchApplicants()
  }, [jobId])

  const handleApplicationIdsChange = useCallback((ids: number[]) => {
    setFilteredIds(ids)
    setCurrentIndex(0)
  }, [])

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
  }

  const handleNext = () => {
    if (currentIndex < displayList.length - 1) setCurrentIndex(prev => prev + 1)
  }

  const selectByIndex = (idx: number) => {
    setCurrentIndex(idx)
  }

  if (loading) {
    return (
      <main className="h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-blue-400 font-mono text-sm animate-pulse">Loading applicants...</div>
      </main>
    )
  }

  if (!displayList.length) {
    return (
      <main className="h-screen bg-[#020408] flex flex-col items-center justify-center gap-6">
        <p className="text-gray-400">No applicants for this job yet.</p>
        <Link href="/recruiter/dashboard" className="text-blue-400 hover:text-blue-300 font-bold">
          ← Back to Dashboard
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen h-screen w-full bg-[#020408] flex overflow-hidden">
      {/* LEFT: CV List - Collapsible */}
      <aside
        className={`${
          leftCollapsed ? 'w-16' : 'w-72'
        } flex-shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col transition-all duration-300`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!leftCollapsed && (
            <div className="flex flex-col gap-1">
              <Link href="/recruiter/dashboard" className="text-[10px] text-blue-400/80 hover:text-blue-400 font-bold uppercase tracking-widest w-fit">
                ← Dashboard
              </Link>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">CVs ({displayList.length})</span>
            </div>
          )}
          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title={leftCollapsed ? 'Expand list' : 'Collapse list'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${leftCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 7l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {leftCollapsed ? (
            <div className="py-4 flex flex-col items-center gap-2">
              <Link
                href="/recruiter/dashboard"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                title="Back to Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
              {displayList.map((app, idx) => (
                <button
                  key={app.id}
                  onClick={() => selectByIndex(idx)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    currentIndex === idx ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                  title={app.name}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {displayList.map((app, idx) => (
                <button
                  key={app.id}
                  onClick={() => selectByIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    currentIndex === idx
                      ? 'bg-blue-600/30 border border-blue-500/50 text-white'
                      : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-sm truncate">{app.name}</div>
                  <div className="text-[10px] text-blue-400/80 mt-0.5">{app.ai_score.toFixed(1)} • {app.years_of_experience}y exp</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* CENTER: CV Viewer */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 bg-black/30 flex flex-col items-center justify-center p-6">
          {currentApp?.cv_url ? (
            <iframe
              src={currentApp.cv_url}
              className="w-full max-w-4xl h-full min-h-[500px] rounded-xl border border-white/10 bg-white"
              title={`CV - ${currentApp.name}`}
            />
          ) : (
            <div className="w-full max-w-4xl h-96 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-gray-500">
              No CV available for {currentApp?.name}
            </div>
          )}
        </div>

        {/* Bottom: Prev/Next */}
        <div className="p-4 border-t border-white/10 flex justify-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-8 py-3 border-2 border-white/20 rounded-xl text-white font-bold uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          <span className="flex items-center px-6 text-gray-400 font-mono text-sm">
            {currentIndex + 1} / {displayList.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === displayList.length - 1}
            className="px-8 py-3 border-2 border-white/20 rounded-xl text-white font-bold uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      </div>

      {/* RIGHT: Recruitment Chatbot */}
      <div className="w-[380px] flex-shrink-0">
        <RecruiterChatPanel
          jobId={jobId}
          applicationIds={filteredIds}
          currentApplicationId={currentApp?.id ?? null}
          onApplicationIdsChange={handleApplicationIdsChange}
        />
      </div>
    </main>
  )
}
