'use client'

import Link from 'next/link'

export default function LifePage() {
  return (
    <div className="min-h-screen bg-space-dark p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-space-light hover:text-space-blue">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-8">Life at Space42</h1>

        <div className="bg-space-dark border-2 border-space-light rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Virtual Tour</h2>
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <video
              controls
              className="w-full h-full rounded-lg"
              src="/videos/virtual-tour.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-gray-300 mt-4">
            Experience what it's like to work at Space42. Join us on our journey to revolutionize recruitment!
          </p>
        </div>
      </div>
    </div>
  )
}

