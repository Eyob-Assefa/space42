'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ScreeningPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const router = useRouter()

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault()
    setIsScanning(true)
    // AI Processing Simulation
    setTimeout(() => router.push('/recruiter/review'), 2800)
  }

  return (
    <main className="min-h-screen bg-[#020408] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Dynamic Background HUD */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[1px] border-blue-500/10 rounded-full animate-pulse" />
      </div>

      <div className="relative w-full max-w-2xl glass-card p-12 border-blue-500/20 shadow-2xl">
        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4 relative">
              <div className="absolute inset-0 bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-scan-progress" />
            </div>
            <p className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
              Analyzing Neural Signatures...
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 mb-10">
          <div className="h-12 w-1.5 bg-blue-500 shadow-[0_0_15px_#3b82f6]" />
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">AI Analysis</h2>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em]">Mission Parameters</p>
          </div>
        </div>

        <form onSubmit={handleStartScan} className="space-y-8">
          <div className="relative group">
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full h-60 bg-black/40 border-2 border-white/5 rounded-3xl p-8 text-white text-lg placeholder:text-white/5 outline-none focus:border-blue-500/40 transition-all font-mono italic leading-relaxed"
              placeholder="Enter ranking instructions (e.g., 'Prioritize developers with experience in real-time satellite telemetry and Rust...')"
              required
            />
            <div className="absolute bottom-6 right-8 text-[10px] text-white/20 font-mono uppercase">
              Input Buffer: {inputValue.length} chars
            </div>
          </div>

          <button 
            type="submit"
            className="btn-neon w-full py-6 text-sm tracking-[0.4em] uppercase"
          >
            Submit Instructions & Scan
          </button>
        </form>

        <div className="mt-8 flex justify-between text-[9px] font-mono text-white/20 uppercase tracking-widest">
          <span>Targeting Sector: TECH-09</span>
          <span>AI Core: Stable</span>
        </div>
      </div>
    </main>
  )
}