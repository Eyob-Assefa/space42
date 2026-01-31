'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import axios from 'axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // If user doesn't exist, sign up
        if (authError.message.includes('Invalid login')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          })

          if (signUpError) throw signUpError

          // Create profile
          if (signUpData.user) {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/create-profile`, {
              id: signUpData.user.id,
              email: signUpData.user.email,
              role,
              name: name || email.split('@')[0],
            })
          }
        } else {
          throw authError
        }
      }

      // Get user session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Redirect based on role
        if (role === 'recruiter') {
          router.push('/recruiter/dashboard')
        } else {
          router.push('/jobs')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-dark px-4">
      <div className="bg-space-dark border-2 border-space-light rounded-lg p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Space42</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Role</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex-1 py-2 rounded ${
                  role === 'candidate'
                    ? 'bg-space-light text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`flex-1 py-2 rounded ${
                  role === 'recruiter'
                    ? 'bg-space-light text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Recruiter
              </button>
            </div>
          </div>

          {role === 'candidate' && (
            <div>
              <label className="block text-gray-300 mb-2">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-space-light"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-space-light hover:bg-space-blue text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login / Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-space-light hover:text-space-blue">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

