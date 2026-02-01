'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  
  // Hide header completely on login and recruiter pages
  if (pathname === '/login' || pathname?.startsWith?.('/recruiter')) return null;

  // Check if we are on the 'Why Space42' page (or others that have their own back button)
  // We will hide the global logo on these pages to prevent overlap.
  const hideLogo = pathname === '/why-space42';

  return (
    <header className="fixed top-0 left-0 right-0 z-[999] pointer-events-none">
      {/* Changed 'justify-between' to simple flex. 
         We use 'ml-auto' on the menu to force it to the right, 
         ensuring it stays there even if the logo is hidden.
      */}
      <div className="flex items-start p-6">
        
        {/* LOGO - Top Left (Conditionally rendered) */}
        {!hideLogo && (
          <Link href="/" className="pointer-events-auto text-2xl font-black text-white tracking-tighter">
            SPACE<span className="text-blue-500">42</span>
          </Link>
        )}

        {/* THE HAMBURGER MENU - Fixed Top Right */}
        {/* Added 'ml-auto' to push this to the right side regardless of logo presence */}
        <Link
          href="/login"
          className="ml-auto pointer-events-auto flex flex-col gap-1.5 p-4 rounded-xl border-2 border-white/10 hover:border-blue-500/50 transition-all bg-black/40 backdrop-blur-md shadow-2xl"
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