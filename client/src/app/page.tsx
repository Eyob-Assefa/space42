'use client'

import { useState } from 'react'
import Link from 'next/link'
import ChatBot from '@/components/ChatBot'
import SpaceButton from '@/components/SpaceButton'

export default function Home() {
  const [showWhyModal, setShowWhyModal] = useState(false)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/space-bg.jpg)',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-12 animate-float">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 text-center">
            Space42
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 text-center">
            Launch Your Career to New Heights
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <SpaceButton onClick={() => setShowWhyModal(true)}>
            Why Space42
          </SpaceButton>
          <Link href="/jobs">
            <SpaceButton>Explore Jobs</SpaceButton>
          </Link>
          <Link href="/life">
            <SpaceButton variant="secondary">Life at Space42</SpaceButton>
          </Link>
        </div>

        {/* Why Space42 Modal */}
        {showWhyModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-space-dark border-2 border-space-light rounded-lg max-w-2xl w-full p-8 relative">
              <button
                onClick={() => setShowWhyModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-3xl font-bold text-white mb-6">Why Space42?</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-xl font-semibold text-space-light mb-2">Our Mission</h3>
                  <p>
                    To revolutionize recruitment by connecting exceptional talent with groundbreaking opportunities 
                    in the tech industry. We believe in matching the right people with the right roles, 
                    creating success stories that reach for the stars.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-space-light mb-2">Our Goals</h3>
                  <p>
                    • Streamline the hiring process with AI-powered matching<br/>
                    • Provide transparent, fair, and efficient recruitment<br/>
                    • Build a community of top-tier professionals and innovative companies<br/>
                    • Reduce time-to-hire while improving candidate quality
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-space-light mb-2">Our Vision</h3>
                  <p>
                    To become the leading recruitment platform where technology meets human potential, 
                    creating a future where finding the perfect job or candidate is as effortless as 
                    looking up at the stars.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chatbot */}
      <ChatBot />
    </div>
  )
}

