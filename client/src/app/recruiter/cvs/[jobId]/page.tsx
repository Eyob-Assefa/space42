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

export default function CVViewerPage() {
  const params = useParams()
  // Handles /jobs/1, /jobs/2, etc. properly
  const jobId = parseInt(params.jobId as string, 10)
  
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredIds, setFilteredIds] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)

  const displayList = filteredIds.length 
    ? applications.filter(a => filteredIds.includes(a.id)) 
    : applications
    
  const currentApp = displayList[currentIndex] || null

  useEffect(() => {
    if (!jobId) return;

    const fetchApplicants = async () => {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await axios.get(`${apiUrl}/api/jobs/${jobId}/applicants`)
        const data = res.data
        
        if (Array.isArray(data)) {
          setApplications(data)
          setFilteredIds(data.map((a: Application) => a.id))
        } else {
          setApplications([])
          setFilteredIds([])
        }
      } catch (err) {
        console.error("Fetch error:", err)
        setApplications([])
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

  const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1) }
  const handleNext = () => { if (currentIndex < displayList.length - 1) setCurrentIndex(prev => prev + 1) }

  // --- RENDER ---
  // We ALWAYS render the main structure, regardless of loading state
  
  return (
    <main className="min-h-screen h-screen w-full bg-[#020408] flex overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: List */}
      <aside className={`${leftCollapsed ? 'w-16' : 'w-72'} flex-shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!leftCollapsed && (
            <div className="flex flex-col gap-1">
              <Link href="/recruiter/dashboard" className="text-[10px] text-blue-400/80 hover:text-blue-400 font-bold uppercase tracking-widest w-fit">
                ← Dashboard
              </Link>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                 JOB {jobId} CVs
              </span>
            </div>
          )}
          <button onClick={() => setLeftCollapsed(!leftCollapsed)} className="p-2 text-white/60 hover:text-white">
            <svg className={`w-5 h-5 transition-transform ${leftCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 7l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-4 text-center text-xs text-gray-500 animate-pulse">Loading list...</div>
          ) : displayList.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">No applicants found.</div>
          ) : (
            <div className="p-2 space-y-1">
               {displayList.map((app, idx) => (
                 <button
                   key={app.id}
                   onClick={() => setCurrentIndex(idx)}
                   className={`w-full text-left p-3 rounded-xl transition-all ${
                     currentIndex === idx ? 'bg-blue-600/30 border border-blue-500/50 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                   }`}
                 >
                   {!leftCollapsed ? (
                     <>
                       <div className="font-bold text-sm truncate">{app.name}</div>
                       <div className="text-[10px] text-blue-400/80">{app.ai_score?.toFixed(1) || '0.0'} • {app.years_of_experience}y</div>
                     </>
                   ) : (
                     <div className="text-center font-bold">{idx + 1}</div>
                   )}
                 </button>
               ))}
            </div>
          )}
        </div>
      </aside>

      {/* 2. CENTER: Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 bg-black/30 flex flex-col items-center justify-center p-6 relative">
          
          {loading ? (
            <div className="text-blue-400 animate-pulse">Loading CV data...</div>
          ) : !currentApp ? (
             <div className="text-gray-500 flex flex-col items-center gap-2">
                <p>No applicant selected.</p>
                <Link href="/recruiter/dashboard" className="text-blue-400 hover:underline text-sm">Return to Dashboard</Link>
             </div>
          ) : currentApp.cv_url ? (
            <iframe src={currentApp.cv_url} className="w-full max-w-4xl h-full min-h-[500px] rounded-xl border border-white/10 bg-white" />
          ) : (
            <div className="w-full max-w-4xl h-96 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-gray-500">
              No CV PDF uploaded for {currentApp.name}
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-white/10 flex justify-center gap-4 bg-[#020408]">
          <button onClick={handlePrev} disabled={currentIndex === 0 || !displayList.length} className="px-6 py-2 border border-white/20 rounded-lg text-white disabled:opacity-30">
            ← Prev
          </button>
          <span className="flex items-center text-gray-400 text-sm">
            {displayList.length > 0 ? `${currentIndex + 1} / ${displayList.length}` : '0 / 0'}
          </span>
          <button onClick={handleNext} disabled={currentIndex === displayList.length - 1 || !displayList.length} className="px-6 py-2 border border-white/20 rounded-lg text-white disabled:opacity-30">
            Next →
          </button>
        </div>
      </div>

      {/* 3. RIGHT: Chat Panel (Always Visible) */}
      <div className="w-[380px] flex-shrink-0 border-l border-white/10 bg-black/20">
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