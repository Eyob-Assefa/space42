import type { Metadata } from 'next'
import '../styles/globals.css'
import ChatBot from '../components/ChatBot' 
import Header from '../components/Header'

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
        <Header />
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
        <ChatBot />
      </body>
    </html>
  )
}