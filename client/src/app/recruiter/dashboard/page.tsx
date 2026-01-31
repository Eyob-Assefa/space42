'use client'
import Link from 'next/link';

const JOB_DATA = [
  { id: 'fin', role: "Finance", apps: 1293, status: "Critical", color: "border-blue-500" },
  { id: 'tech', role: "Tech", apps: 8761, status: "Active", color: "border-cyan-400" },
  { id: 'eng', role: "Engineer", apps: 2371, status: "Active", color: "border-indigo-500" },
];

export default function RecruiterDashboard() {
  return (
    <main className="min-h-screen bg-[#020408] pt-24 pb-12 px-10 relative overflow-hidden">
      {/* Background HUD Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="w-[900px] h-[900px] border-[1px] border-blue-500/30 rounded-full animate-pulse" />
        <h2 className="absolute text-[12rem] font-black text-blue-900/10 uppercase tracking-tighter select-none">ARENA v4.2</h2>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex gap-12">
        
        {/* SIDEBAR: ORIGINAL CATEGORIES */}
        <aside className="w-48 flex flex-col gap-4">
          <div className="mb-6 border-l-2 border-blue-500 pl-4">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Control</p>
            <h3 className="text-xl font-bold text-white uppercase italic">Arena</h3>
          </div>
          {['CVs', 'EMAIL', 'Followups'].map((item) => (
            <button key={item} className="w-full py-4 text-xs font-black uppercase tracking-widest border border-white/10 rounded-xl bg-white/5 hover:bg-blue-600/20 hover:border-blue-500 transition-all text-white/60 hover:text-white shadow-lg">
              {item}
            </button>
          ))}
        </aside>

        {/* MAIN GRID: JOB CLUSTERS */}
        <div className="flex-1 space-y-8">
          <header className="flex justify-between items-end border-b border-white/10 pb-6">
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">
              Recruiter <span className="text-blue-500">Dashboard</span>
            </h1>
            <div className="flex flex-col items-end font-mono text-blue-400/50 text-[10px] uppercase tracking-widest">
              <span>Status: Online</span>
              <span>Encrypted Session: Active</span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {JOB_DATA.map((job) => (
              <div key={job.id} className={`glass-card p-8 border-t-2 ${job.color} group bg-gradient-to-br from-white/[0.05] to-transparent`}>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest border border-blue-500/30 px-2 py-1 rounded">
                    {job.status}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-pulse" />
                </div>
                
                <h3 className="text-3xl font-black text-white mb-1 uppercase tracking-tighter">{job.role}</h3>
                <p className="text-gray-500 text-[10px] font-mono mb-10 tracking-widest">UID: {job.id.toUpperCase()}-09-ALPHA</p>

                <div className="space-y-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-mono text-white font-black">{job.apps.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Applications</span>
                  </div>
                  
                  <Link 
                    href="/recruiter/screening"
                    className="block w-full text-center py-4 bg-transparent border-2 border-blue-400/60 rounded-xl text-blue-400 font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all active:scale-95"
                  >
                    Review CVs
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* SYSTEM TELEMETRY */}
          <div className="mt-12 p-5 bg-black/60 border border-white/5 rounded-2xl font-mono text-[9px] text-blue-400/30 uppercase flex items-center gap-6">
            <div className="flex gap-2">
              <div className="w-1 h-3 bg-blue-500/50" />
              <div className="w-1 h-3 bg-blue-500/30" />
              <div className="w-1 h-3 bg-blue-500/10" />
            </div>
            <span className="flex-1 tracking-[0.2em]">Holographic Buffer: Synchronized. Ready for AI Input.</span>
            <span className="text-blue-500/60">0.0024ms Latency</span>
          </div>
        </div>
      </div>
    </main>
  );
}