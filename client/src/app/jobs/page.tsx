'use client'

import { useState } from 'react';
import Image from 'next/image';
import ChatBot from '@/components/ChatBot';

const JOBS = [
  { id: 1, category: "Finance & Tax", title: "Associate - Financial Accounting", match: 88, icon: "💰" },
  { id: 2, category: "Finance & Tax", title: "Tax Manager", match: 92, icon: "📊" },
  { id: 3, category: "Satellite Ops", title: "VP - Satellite Operations", match: 85, icon: "🛰️" },
  { id: 4, category: "Space Engineering", title: "Manager - Spacecraft Analysis", match: 78, icon: "🔬" },
  { id: 5, category: "Space Engineering", title: "Senior Manager - Payload Systems", match: 82, icon: "📡" },
  { id: 6, category: "Systems Support", title: "Senior Engineer - Solutions", match: 90, icon: "💻" },
];

export default function JobsPage() {
  const [cvStatus, setCvStatus] = useState<'idle' | 'success' | 'no_fit' | 'missing_info'>('idle');
  const [isScanning, setIsScanning] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    
    // SIMULATED AI SCANNING LOGIC
    setTimeout(() => {
      setIsScanning(false);
      const fileName = file.name.toLowerCase();
      
      if (fileName.includes('incomplete')) {
        setCvStatus('missing_info');
      } else if (fileName.includes('art') || fileName.includes('chef')) {
        setCvStatus('no_fit');
      } else {
        setCvStatus('success');
      }
    }, 2500);
  };

  return (
    <main className="min-h-screen pt-28 pb-12 px-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT SIDE: THE JOB GRID (6 BARS) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {JOBS.map((job) => (
            <div 
              key={job.id} 
              className={`glass-card p-6 flex items-center justify-between transition-all duration-500 border-white/10 ${
                cvStatus === 'success' && job.match > 85 ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'opacity-80'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl border border-blue-500/20">
                  {job.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 tracking-widest uppercase mb-1">{job.category}</p>
                  <h3 className="text-lg font-bold text-white leading-tight">{job.title}</h3>
                </div>
              </div>
              
              {/* Match Percentage Circle */}
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center border-2 border-blue-500/30 rounded-full">
                  <span className="text-[10px] font-bold">{job.match}%</span>
                </div>
                <span className="text-[8px] uppercase mt-1 tracking-tighter opacity-60">Match</span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE: THE UPLOAD ZONE */}
        <div className="w-full lg:w-[400px] space-y-6">
          <div className={`glass-card p-10 border-2 border-dashed transition-all duration-500 flex flex-col items-center text-center ${
            isScanning ? 'border-blue-500 bg-blue-500/5' : 'border-white/20'
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-700 ${isScanning ? 'animate-spin bg-blue-500' : 'bg-white/5'}`}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-black tracking-tighter mb-2">Initialize Recruitment Scan</h2>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Drop your CV here. Our AI will analyze your trajectory and match you with the perfect role...
            </p>

            <input type="file" id="cv-input" className="hidden" onChange={handleFileUpload} />
            <label 
              htmlFor="cv-input" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl cursor-pointer transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] block"
            >
              {isScanning ? 'SCANNING ENCRYPTED DATA...' : 'UPLOAD CV'}
            </label>
          </div>

          {/* Feedback Area for Results */}
          {cvStatus === 'missing_info' && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-xs font-bold animate-pulse">
              ⚠️ CRITICAL: Identity or contact markers missing from file.
            </div>
          )}
        </div>
      </div>

      {/* Passing the Status to the Global ChatBot */}
      <ChatBot cvStatus={cvStatus} />
    </main>
  );
}