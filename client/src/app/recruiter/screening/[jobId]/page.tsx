'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { supabase } from '@/lib/supabase'
import CandidateCard from '@/components/CandidateCard'

interface Application {
  id: number
  name: string
  email: string
  years_of_experience: number
  tech_stack: string
  ai_score: number
  cv_url?: string
  status: string
}

export default function ScreeningPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = parseInt(params.jobId as string)

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    min_experience: '',
    tech_filter: '',
  })
  const [idealCandidate, setIdealCandidate] = useState('')
  const [scoring, setScoring] = useState(false)
  const [emailContent, setEmailContent] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null)

  useEffect(() => {
    checkAuth()
    fetchApplications()
  }, [jobId])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.min_experience) {
        params.append('min_experience', filters.min_experience)
      }
      if (filters.tech_filter) {
        params.append('tech_filter', filters.tech_filter)
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/applicants/screening/${jobId}?${params.toString()}`
      )
      setApplications(response.data)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [filters])

  const handleAIScoring = async () => {
    if (!idealCandidate.trim()) {
      alert('Please describe your ideal candidate')
      return
    }

    setScoring(true)
    try {
      const applicationIds = applications.map(app => app.id)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/applicants/ai-score`,
        {
          ideal_candidate_description: idealCandidate,
          application_ids: applicationIds,
        }
      )
      setApplications(response.data)
      alert('Applications re-scored successfully!')
    } catch (error) {
      console.error('Error scoring applications:', error)
      alert('Failed to score applications')
    } finally {
      setScoring(false)
    }
  }

  const handleStatusChange = async (applicationId: number, status: string) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/applicants/${applicationId}/status?status=${status}`
      )
      fetchApplications()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleGenerateEmail = async (applicationId: number) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/applicants/${applicationId}/generate-email`
      )
      setEmailContent(response.data.email_content)
      setSelectedApplication(applicationId)
    } catch (error) {
      console.error('Error generating email:', error)
    }
  }

  const handleSuggestQuestions = async (applicationId: number) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/applicants/${applicationId}/suggest-questions`
      )
      setQuestions(response.data.questions)
      setSelectedApplication(applicationId)
    } catch (error) {
      console.error('Error suggesting questions:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-dark">
        <div className="text-white text-xl">Loading applications...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-space-dark p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/recruiter/dashboard" className="text-space-light hover:text-space-blue">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-8">Resume Screening</h1>

        {/* Filters */}
        <div className="bg-space-dark border-2 border-space-light rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Minimum Years of Experience</label>
              <input
                type="number"
                value={filters.min_experience}
                onChange={(e) => setFilters({ ...filters, min_experience: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light"
                placeholder="e.g., 3"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Tech Stack Filter</label>
              <input
                type="text"
                value={filters.tech_filter}
                onChange={(e) => setFilters({ ...filters, tech_filter: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light"
                placeholder="e.g., React, Python"
              />
            </div>
          </div>
        </div>

        {/* AI Matching */}
        <div className="bg-space-dark border-2 border-space-light rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">AI Matching</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Describe your ideal candidate</label>
              <textarea
                value={idealCandidate}
                onChange={(e) => setIdealCandidate(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light h-24"
                placeholder="e.g., Senior full-stack developer with 5+ years experience in React and Node.js..."
              />
            </div>
            <button
              onClick={handleAIScoring}
              disabled={scoring || !idealCandidate.trim()}
              className="bg-space-light hover:bg-space-blue text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {scoring ? 'Scoring...' : 'Re-score Applications'}
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">
            Applicants ({applications.length})
          </h2>
          {applications.map((app) => (
            <CandidateCard
              key={app.id}
              name={app.name}
              experience={app.years_of_experience}
              techStack={app.tech_stack}
              aiScore={app.ai_score}
              cvUrl={app.cv_url}
              status={app.status}
              onStatusChange={(status) => handleStatusChange(app.id, status)}
              onGenerateEmail={() => handleGenerateEmail(app.id)}
              onSuggestQuestions={() => handleSuggestQuestions(app.id)}
            />
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>No applicants found for this job.</p>
          </div>
        )}

        {/* Email Modal */}
        {emailContent && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-space-dark border-2 border-space-light rounded-lg max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Generated Interview Email</h2>
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <pre className="text-white whitespace-pre-wrap">{emailContent}</pre>
              </div>
              <button
                onClick={() => {
                  setEmailContent('')
                  setSelectedApplication(null)
                }}
                className="bg-space-light hover:bg-space-blue text-white px-6 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Questions Modal */}
        {questions.length > 0 && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-space-dark border-2 border-space-light rounded-lg max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Suggested Interview Questions</h2>
              <div className="space-y-2 mb-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4">
                    <p className="text-white">{q}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setQuestions([])
                  setSelectedApplication(null)
                }}
                className="bg-space-light hover:bg-space-blue text-white px-6 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

