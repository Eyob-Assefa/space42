'use client'

import { useState } from 'react';
// IMPORT THE CHATBOT SO WE CAN CONTROL IT
import ChatBot from '../../components/ChatBot' 

const JOBS = [
  { 
    id: 1, 
    category: "Finance & Tax", 
    title: "Associate - Financial Accounting", 
    match: 88, 
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: 2, 
    category: "Finance & Tax", 
    title: "Tax Manager", 
    match: 92, 
    image: "https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: 3, 
    category: "Satellite Ops", 
    title: "VP - Satellite Operations", 
    match: 85, 
    image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: 4, 
    category: "Space Engineering", 
    title: "Manager - Spacecraft Analysis", 
    match: 78, 
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: 5, 
    category: "Space Engineering", 
    title: "Senior Manager - Payload Systems", 
    match: 82, 
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80" 
  },
  { 
    id: 6, 
    category: "Systems Support", 
    title: "Senior Engineer - Solutions", 
    match: 90, 
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" 
  },
];

export default function JobsPage() {
  const [cvStatus, setCvStatus] = useState('idle');
  const [isScanning, setIsScanning] = useState(false);

  const handleFileUpload = (e:any) => {
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
    <main className="min-h-screen pt-28 pb-12 px-6 lg:px-10 max-w-[1600px] mx-auto relative">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* LEFT SIDE: JOB GRID */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
          {JOBS.map((job) => (
            <div 
              key={job.id} 
              className={`group relative h-80 rounded-[30px] overflow-hidden border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:border-white/30 shadow-2xl ${
                cvStatus === 'success' && job.match > 85 ? 'ring-2 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : ''
              }`}
            >
              {/* Background Image */}
              <img 
                src={job.image} 
                alt={job.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Vertical Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c162d] via-[#0c162d]/40 to-transparent opacity-90" />

              {/* Card Content */}
              <div className="relative z-10 flex flex-col justify-between h-full p-8 w-full">
                
                {/* TOP: Match Score */}
                <div className="self-end w-16 h-16 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex flex-col items-center justify-center shadow-lg">
                  <span className="text-base font-bold text-white">
                    {cvStatus === 'success' ? `${job.match}%` : '--'}
                  </span>
                  <span className="text-[4px] uppercase tracking-widest text-blue-200">Compatibility</span>
                </div>

                {/* BOTTOM: Job Info */}
                <div className="flex flex-col">
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-600/30 border border-blue-500/30 self-start mb-3 backdrop-blur-sm">
                    <p className="text-[9px] font-bold text-blue-300 tracking-widest uppercase">{job.category}</p>
                  </div>
                  <h3 className="text-2xl font-bold text-white leading-tight">{job.title}</h3>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE: UPLOAD ZONE (COMPACT & DYNAMIC) */}
        <div className="w-full lg:w-[400px] sticky top-32">
          <div className={`glass-card p-8 border-2 border-dashed rounded-[30px] transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden bg-[#0c162d]/60 backdrop-blur-md ${
            isScanning ? 'border-blue-500 bg-blue-500/10' : 
            cvStatus === 'success' ? 'border-green-500/50 bg-green-500/5' : 'border-white/10'
          }`}>
            
            {/* Dynamic Icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform duration-700 ${
              isScanning ? 'animate-spin bg-blue-500' : 
              cvStatus === 'success' ? 'bg-green-500 scale-110' : 'bg-white/5'
            }`}>
              {isScanning ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : cvStatus === 'success' ? (
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            
            {/* Content Area */}
            {cvStatus === 'success' ? (
              <div className="animate-fade-in-up">
                <h2 className="text-xl font-bold text-white mb-3">Analysis Complete</h2>
                <button 
                  onClick={() => setCvStatus('idle')}
                  className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all uppercase tracking-wider"
                >
                  Scan Another CV
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black tracking-tighter mb-6 text-white">
                  {isScanning ? 'Scanning...' : 'Upload CV'}
                </h2>

                <input type="file" id="cv-input" className="hidden" onChange={handleFileUpload} />
                <label 
                  htmlFor="cv-input" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl cursor-pointer transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] block hover:scale-105 active:scale-95 text-base"
                >
                  {isScanning ? 'PROCESSING...' : 'SELECT FILE'}
                </label>
              </>
            )}
          
            {cvStatus === 'missing_info' && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-xs font-bold animate-pulse w-full">
                ⚠️ Identity markers missing.
              </div>
            )}
          </div>
        </div>
      </div>

      
      <ChatBot cvStatus={cvStatus} />
      
    </main>
  );
}