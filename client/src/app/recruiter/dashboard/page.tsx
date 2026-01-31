'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { supabase } from '@/lib/supabase'

interface Job {
  id: number
  title: string
  description: string
  applicant_count?: number
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchJobs()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setUser(session.user)

    // Verify user is recruiter
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/verify`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )
    } catch (error) {
      console.error('Auth verification failed:', error)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/jobs`)
      const jobsData = response.data

      // Fetch applicant counts for each job
      const jobsWithCounts = await Promise.all(
        jobsData.map(async (job: Job) => {
          try {
            const applicantsResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/jobs/${job.id}/applicants`
            )
            return {
              ...job,
              applicant_count: applicantsResponse.data.applicant_count || 0,
            }
          } catch (error) {
            return { ...job, applicant_count: 0 }
          }
        })
      )

      setJobs(jobsWithCounts)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-dark">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-space-dark p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Recruiter Dashboard</h1>
            {user && (
              <p className="text-gray-400">Welcome, {user.email}</p>
            )}
          </div>
          <Link href="/" className="text-space-light hover:text-space-blue">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/recruiter/screening/${job.id}`}
              className="bg-space-dark border-2 border-space-light rounded-lg p-6 hover:border-space-blue transition-colors"
            >
              <h2 className="text-2xl font-bold text-white mb-3">{job.title}</h2>
              <p className="text-gray-300 mb-4 line-clamp-2">
                {job.description || 'No description available'}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-space-light font-semibold">
                  {job.applicant_count || 0} Applicants
                </span>
                <span className="text-gray-400">View →</span>
              </div>
            </Link>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>No job postings yet. Create your first job to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}

