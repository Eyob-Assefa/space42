import type { Metadata } from 'next'
import '../styles/globals.css'
import ChatBot from '../components/ChatBot' 
import Header from '../components/Header' // 1. Added Header Import

export const metadata: Metadata = {
  title: 'Space42 - Recruitment Platform',
  description: 'Space-themed recruitment platform powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#05070a]">
        {/* 2. Global Header stays at the top of every page */}
        <Header />

        {/* 3. Wrap children in a relative container with z-index */}
        <main className="relative z-10">
          {children}
        </main>

        {/* 4. Global ChatBot */}
        <ChatBot />
      </body>
    </html>
  )
}