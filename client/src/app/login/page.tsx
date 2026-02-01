'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [role, setRole] = useState<'newhire' | 'recruiter' | 'admin'>('newhire');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // SPECIFIC BYPASS LOGIC
    // If credentials match 'recruiter'/'recruiter', go straight to the dashboard
    if (email === 'recruiter' && password === 'recruiter') {
      router.push('/recruiter/dashboard');
      return;
    }

    // STANDARD LOGIC (For other roles)
    if (role === 'recruiter') {
      router.push('/recruiter/dashboard');
    } else if (role === 'newhire') {
      router.push('/new-hire');
    } else {
      router.push('/'); // admin
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black relative">
      <div className="z-50 w-full max-w-md p-10 bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl">
        <h2 className="text-4xl font-black text-center mb-10 tracking-tighter text-white uppercase">
          MISSION <span className="text-blue-500">ACCESS</span>
        </h2>

        {/* ROLE SELECTOR (Matches Header/Bot Alignment) */}
        <div className="flex flex-col gap-4 mb-10">
          {[
            { id: 'newhire', label: 'New Hire Portal' },
            { id: 'recruiter', label: 'Recruiter Portal' },
            { id: 'admin', label: 'Admin Portal' }
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id as any)}
              className={`w-full py-5 rounded-2xl font-black transition-all border-2 text-xs uppercase tracking-[0.2em] ${
                role === id 
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)]' 
                : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* LOGIN FORM */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input 
            type="text" // Changed to text to allow 'recruiter' string easily
            placeholder="IDENTITY EMAIL / USERNAME" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none focus:border-blue-500"
            required
          />
          <input 
            type="password" 
            placeholder="SECURITY KEY" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white text-sm outline-none focus:border-blue-500"
            required
          />
          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-5 rounded-2xl transition-all active:scale-95 shadow-lg mt-4 uppercase tracking-widest"
          >
            Authenticate
          </button>
        </form>
      </div>
    </main>
  );
}