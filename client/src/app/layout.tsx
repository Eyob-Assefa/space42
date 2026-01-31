import type { Metadata } from 'next'
import '../styles/globals.css'
// 1. Import the ChatBot component
import ChatBot from '../components/ChatBot' 

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
      <body className="antialiased">
        {/* The page content (your cards, satellite, etc.) */}
        {children}

        {/* 2. The ChatBot floats here, globally across all pages */}
        <ChatBot />
      </body>
    </html>
  )
}
