'use client'

import Link from 'next/link'

const ONBOARDING_PDF = '/documents/JSC_Welcome_Kit.pdf'

function OnboardingDocumentActions() {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <a
        href={ONBOARDING_PDF}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-500/90 text-white rounded-xl font-bold text-sm transition-all border border-blue-400/50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        View PDF in new tab
      </a>
      <a
        href={ONBOARDING_PDF}
        download="JSC_Welcome_Kit.pdf"
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download PDF
      </a>
    </div>
  )
}

const timelineItems = [
  {
    date: 'Feb 2',
    title: 'Onboarding Document',
    description: 'Read the onboarding documents and familiarize yourself with company policies and regulations. Use the AI assistant (bottom right) to ask any questions—no need to contact HR or recruiters.',
    deadline: 'Deadline: Feb 2',
    icon: '📄',
    hasChatbot: true,
  },
  {
    date: 'Feb 3',
    title: 'Orientation Day',
    description: 'Join us for your official orientation! Get to know the team, learn about our culture, and kick off your journey at Space42.',
    reminder: 'Set a reminder for Feb 3',
    icon: '🎯',
    hasChatbot: false,
  },
  {
    date: 'Feb 5',
    title: 'Team Meeting',
    description: 'Meet with your specific team. Connect with your colleagues, understand your role, and start collaborating.',
    icon: '👥',
    hasChatbot: false,
  },
  {
    date: 'Feb 6',
    title: 'Company Tour',
    description: 'Take a physical tour around the company grounds. Explore the workspace and get comfortable with your new environment.',
    icon: '🏢',
    hasChatbot: false,
  },
]

export default function NewHirePortalPage() {
  return (
    <main className="min-h-screen py-24 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3">
            NEW HIRE <span className="text-blue-500">PORTAL</span>
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-[0.3em]">
            Your Onboarding Journey
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/60 via-blue-400/40 to-blue-500/60" />

          <div className="space-y-0">
            {timelineItems.map((item, index) => (
              <div key={index} className="relative flex gap-8 pb-12 last:pb-0">
                {/* Date badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600/90 border-2 border-blue-400 flex items-center justify-center text-lg z-10 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  {item.icon}
                </div>

                {/* Content card */}
                <div className="flex-1 glass-card p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-blue-500 font-black text-sm tracking-widest uppercase">
                      {item.date}
                    </span>
                    {item.deadline && (
                      <span className="text-amber-400/90 text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20">
                        {item.deadline}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>
                  {item.reminder && (
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-4">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span>{item.reminder}</span>
                    </div>
                  )}
                  {item.hasChatbot && <OnboardingDocumentActions />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Congratulations message */}
        <div className="mt-12 p-8 glass-card rounded-2xl border-2 border-blue-500/40 text-center">
          <p className="text-white text-lg font-bold leading-relaxed">
            Congratulations on joining Space42! We&apos;re thrilled to have you on board. Wishing you an exciting and rewarding journey ahead.
          </p>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 text-sm font-bold uppercase tracking-widest transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
