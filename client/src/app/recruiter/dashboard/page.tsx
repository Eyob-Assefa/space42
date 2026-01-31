'use client'

import Link from 'next/link';

const STATS = [
  { role: "Finance", apps: 1293 },
  { role: "Tech", apps: 8861 },
  { role: "Engineer", apps: 2371 },
];

export default function RecruiterDashboard() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-8 flex flex-col items-center">
      {/* 1. DASHBOARD HEADER */}
      <h1 className="text-6xl font-serif italic text-white mb-16 tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        Recruiter Dashboard
      </h1>

      <div className="w-full max-w-7xl flex gap-8">
        
        {/* 2. SIDEBAR NAVIGATION (Pill Design) */}
        <aside className="w-48 flex flex-col gap-6">
          {['CVs', 'EMAIL', 'Followups'].map((item) => (
            <button 
              key={item} 
              className="px-6 py-4 border-2 border-blue-400/50 rounded-full text-white font-bold tracking-widest hover:bg-blue-500/20 hover:border-blue-400 transition-all text-sm uppercase"
            >
              {item}
            </button>
          ))}
        </aside>

        {/* 3. THE DATA TABLE (Tactical Grid) */}
        <div className="flex-1 relative">
          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
            <h2 className="text-[12rem] font-black text-blue-800 rotate-[-5deg]">SPACE 42 ARENA</h2>
          </div>

          <table className="w-full border-collapse border-2 border-white/40 backdrop-blur-sm relative z-10">
            <thead>
              <tr className="border-b-2 border-white/40">
                <th className="p-8 text-2xl font-bold text-white border-r-2 border-white/40">Job Roles</th>
                <th className="p-8 text-2xl font-bold text-white border-r-2 border-white/40 text-center">Number of Applications</th>
                <th className="p-8 text-2xl font-bold text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {STATS.map((row, index) => (
                <tr key={index} className="border-b-2 border-white/40 last:border-b-0 hover:bg-white/5 transition-colors">
                  <td className="p-10 text-2xl text-center text-white border-r-2 border-white/40">
                    {row.role}
                  </td>
                  <td className="p-10 text-2xl text-center text-white border-r-2 border-white/40">
                    {row.apps.toLocaleString()}
                  </td>
                  <td className="p-10 text-center">
                    <button className="px-8 py-3 bg-transparent border-2 border-blue-400 rounded-xl text-white font-bold text-lg shadow-[0_0_20px_rgba(96,165,250,0.5)] hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(96,165,250,0.8)] transition-all active:scale-95">
                      View CVs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}