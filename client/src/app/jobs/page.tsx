'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Job {
  id: number
  title: string
  description: string
  requirements: string
  created_at: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    years_of_experience: 0,
    tech_stack: '',
  })
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchJobs()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/jobs`)
      setJobs(response.data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setShowApplicationForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob || !cvFile) return

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append('job_id', selectedJob.id.toString())
      formDataToSend.append('candidate_id', session.user.id)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('years_of_experience', formData.years_of_experience.toString())
      formDataToSend.append('tech_stack', formData.tech_stack)
      formDataToSend.append('cv_file', cvFile)

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/applicants/apply`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      alert('Application submitted successfully!')
      setShowApplicationForm(false)
      setFormData({ name: '', email: '', years_of_experience: 0, tech_stack: '' })
      setCvFile(null)
    } catch (error: any) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application: ' + (error.response?.data?.detail || error.message))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-dark">
        <div className="text-white text-xl">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-space-dark p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Explore Jobs</h1>
          <Link href="/" className="text-space-light hover:text-space-blue">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleJobClick(job)}
              className="bg-space-dark border-2 border-space-light rounded-lg p-6 cursor-pointer hover:border-space-blue transition-colors"
            >
              <h2 className="text-2xl font-bold text-white mb-3">{job.title}</h2>
              <p className="text-gray-300 mb-4 line-clamp-3">
                {job.description || 'No description available'}
              </p>
              <button className="text-space-light hover:text-space-blue font-semibold">
                Apply Now →
              </button>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>No jobs available at the moment.</p>
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-space-dark border-2 border-space-light rounded-lg max-w-2xl w-full p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Apply for {selectedJob.title}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Tech Stack</label>
                <input
                  type="text"
                  value={formData.tech_stack}
                  onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                  required
                  placeholder="e.g., React, Python, Node.js"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Upload CV (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-space-light hover:bg-space-blue text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

