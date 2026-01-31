'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  
  // Hide header on login/recruiter pages as discussed
  if (pathname === '/login' || pathname === '/recruiter') return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-[999] pointer-events-none">
      {/* We use px-6 to match the standard gutter of the robot at the bottom */}
      <div className="flex justify-between items-start p-6">
        
        {/* LOGO - Top Left */}
        <Link href="/" className="pointer-events-auto text-2xl font-black text-white tracking-tighter">
          SPACE<span className="text-blue-500">42</span>
        </Link>

        {/* THE HAMBURGER MENU - Fixed Top Right */}
        <Link
          href="/login"
          className="pointer-events-auto flex flex-col gap-1.5 p-4 rounded-xl border-2 border-white/10 hover:border-blue-500/50 transition-all bg-black/40 backdrop-blur-md shadow-2xl"
        >
          {/* Tactical bars with consistent right-alignment */}
          <div className="w-8 h-1 bg-white rounded-full"></div>
          <div className="w-5 h-1 bg-white rounded-full ml-auto"></div>
          <div className="w-8 h-1 bg-white rounded-full"></div>
        </Link>
      </div>
    </header>
  )
}