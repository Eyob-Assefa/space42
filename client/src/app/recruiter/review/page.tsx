'use client'
import { useState, useEffect } from 'react'

export default function ReviewDeck() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationClass, setAnimationClass] = useState('animate-card-enter')

  const candidates = [
    { name: "Sefan Garomssa", score: 98, role: "Principal Engineer", tags: ["NEXT.JS", "PYTHON", "AI"], summary: "High alignment with orbital system requirements. Proposed a modular architecture for the Space42 bot." },
    { name: "Sarah Connor", score: 92, role: "Security Architect", tags: ["CYBER", "RUST", "C++"], summary: "Unparalleled experience in defensive systems. AI notes high resilience in stressful environments." },
    { name: "James Holden", score: 88, role: "Systems Lead", tags: ["GO", "K8S", "DOCKER"], summary: "Specializes in distributed systems and real-time data sync across wide-area networks." }
  ]

  const current = candidates[currentIndex]

  const handleNext = () => {
    if (currentIndex < candidates.length - 1) {
      setIsAnimating(true)
      setAnimationClass('animate-card-exit')
      
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setAnimationClass('animate-card-enter')
        setIsAnimating(false)
      }, 500) // Matches CSS animation duration
    }
  }

  return (
    <main className="h-screen bg-[#020408] flex pt-20 overflow-hidden">
      
      {/* LEFT: THE DOSSIER AREA */}
      <div className="flex-1 p-10 flex flex-col items-center justify-center">
        <div className={`w-full max-w-3xl space-y-8 ${animationClass}`}>
          
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-blue-500 font-bold text-xs uppercase tracking-[0.3em]">AI Ranking: Top Tier</p>
              <h2 className="text-6xl font-black text-white tracking-tighter">{current.name}</h2>
            </div>
            <div className="text-right">
              <div className="text-5xl font-mono text-blue-400 font-black drop-shadow-[0_0_10px_#60a5fa]">{current.score}%</div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold font-mono">Instruction Match</p>
            </div>
          </div>

          {/* Dossier Card */}
          <div className="glass-card p-12 border-white/5 bg-white/[0.02] relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]" />
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <section>
                  <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3">AI Intelligence Report</h4>
                  <p className="text-lg text-gray-300 leading-relaxed font-serif italic">"{current.summary}"</p>
                </section>
                <div className="flex flex-wrap gap-2">
                  {current.tags.map(t => <span key={t} className="px-3 py-1 border border-white/10 rounded-md text-[9px] font-bold text-white/40">{t}</span>)}
                </div>
              </div>
              <div className="border-l border-white/10 pl-8 space-y-4 opacity-40">
                <div className="h-4 w-3/4 bg-white/20 rounded" />
                <div className="h-4 w-1/2 bg-white/10 rounded" />
                <div className="h-32 w-full bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-[10px] text-white/20 uppercase tracking-widest">Full CV Preview Locked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Controls Bar */}
        <div className="mt-12 flex gap-4 w-full max-w-3xl">
          <button 
            disabled={currentIndex === 0 || isAnimating}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="flex-1 py-4 border-2 border-white/10 rounded-2xl text-white/40 font-bold hover:bg-white/5 transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-20"
          >
            Previous Dossier
          </button>
          <button 
            disabled={currentIndex === candidates.length - 1 || isAnimating}
            onClick={handleNext}
            className="flex-1 py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all uppercase tracking-[0.2em] text-xs shadow-[0_10px_30px_rgba(0,0,0,0.5)] disabled:opacity-20"
          >
            Next Dossier
          </button>
        </div>
      </div>

      {/* RIGHT: PERSISTENT INTEL BAR */}
      <aside className="w-[450px] border-l border-white/5 bg-black/80 backdrop-blur-3xl flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
            <h3 className="font-black text-white uppercase tracking-[0.3em] text-sm">Mission Support AI</h3>
          </div>
          <span className="text-[10px] text-white/20 font-mono">v4.2-Stable</span>
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="p-5 bg-blue-500/5 border-l-2 border-blue-400 rounded-r-2xl text-[13px] text-blue-100/70 italic font-serif leading-relaxed">
            "Candidate {current.name.split(' ')[0]} displays an anomaly in their history: a 2-year gap that aligns perfectly with a classified orbital project. Should I cross-reference their security clearance?"
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">Active Chat</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            {/* Example conversation would be mapped here */}
          </div>
        </div>

        <div className="p-8 pt-0">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <input 
              type="text" 
              placeholder="Query candidate specifics..." 
              className="relative w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none focus:border-blue-500 transition-all font-mono"
            />
          </div>
        </div>
      </aside>
    </main>
  )
}