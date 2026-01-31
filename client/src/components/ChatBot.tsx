'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Space42 AI assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/`, {
        message: input
      })
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      
      {!isOpen ? (
        /* MODE 1: THE BOT ICON & GREETING */
        <div className="flex flex-col items-end gap-4">
          <div className="bg-white text-gray-800 p-5 rounded-2xl shadow-2xl border-2 border-blue-500 max-w-[240px] animate-bounce relative">
            <p className="text-xs font-black text-blue-600 uppercase mb-1">Mission Control</p>
            <p className="text-sm font-medium leading-tight">
              Hi! Welcome to Space42. Click me to start our tour!
            </p>
            <div className="absolute -bottom-2 right-12 w-4 h-4 bg-white border-r-2 border-b-2 border-blue-500 rotate-45"></div>
          </div>

          {/* LARGE 128px TRANSPARENT ICON */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-32 h-32 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 bg-transparent overflow-hidden"
          >
            <Image 
              src="/assets/bot-avatar.png" 
              alt="Space42 Assistant"
              width={128}
              height={128}
              className="rounded-full object-cover drop-shadow-[0_0_20px_rgba(59,130,246,0.7)]"
            />
          </button>
        </div>
      ) : (
        /* MODE 2: THE CONVERSATION BOX (New Design + Functionality) */
        <div className="w-96 h-[550px] bg-gray-900/90 backdrop-blur-2xl border-2 border-blue-500/50 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.4)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-blue-600/80 p-5 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden bg-gray-800">
                 <Image src="/assets/bot-avatar.png" alt="Bot" width={40} height={40} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-tight">Space42 Assistant</h3>
                <span className="text-[10px] text-blue-100 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> MISSION ACTIVE
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[url('/assets/grid-pattern.svg')] bg-repeat bg-center">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800/80 text-gray-100 rounded-tl-none border border-white/10'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 rounded-2xl px-4 py-2 border border-white/5 italic text-blue-400 text-[10px] animate-pulse">
                  Analyzing mission data...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="p-5 bg-gray-900/50 border-t border-white/10 backdrop-blur-md">
            <div className="flex gap-2 bg-gray-800/80 rounded-2xl p-1.5 border border-white/5 focus-within:border-blue-500/50 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Mission Control..."
                className="flex-1 bg-transparent text-white text-sm px-3 py-2 outline-none"
                disabled={loading}
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 disabled:opacity-30 transition-all active:scale-90"
              >
                <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}