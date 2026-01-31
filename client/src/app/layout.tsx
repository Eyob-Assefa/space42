import type { Metadata } from 'next'
import '../styles/globals.css'
import Header from '@/components/Header'

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
      <body>
        <Header />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}

