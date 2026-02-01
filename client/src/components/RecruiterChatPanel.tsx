'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RecruiterChatPanelProps {
  jobId: number
  applicationIds: number[]
  currentApplicationId: number | null
  onApplicationIdsChange?: (ids: number[]) => void
}

const COMMANDS = [
  { cmd: '/filter', desc: 'Filter applicants by skill or criteria' },
  { cmd: '/rank', desc: 'Rank by experience, skills, or score' },
  { cmd: '/email', desc: 'Generate interview email for current applicant' },
]

export default function RecruiterChatPanel({
  jobId,
  applicationIds,
  currentApplicationId,
  onApplicationIdsChange
}: RecruiterChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your recruitment assistant. Use instruction mode by typing '/' before your prompt—try /filter, /rank, or /email. You can also ask me anything about the applicants."
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCommands, setShowCommands] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (input === '/') setShowCommands(true)
    else setShowCommands(false)
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/recruiter-instruction`,
        {
          message: input,
          job_id: jobId,
          application_ids: applicationIds.length ? applicationIds : undefined,
          current_application_id: currentApplicationId
        }
      )
      const data = response.data
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      if (data.application_ids && onApplicationIdsChange) {
        onApplicationIdsChange(data.application_ids)
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const selectCommand = (cmd: string) => {
    setInput(cmd + ' ')
    setShowCommands(false)
    inputRef.current?.focus()
  }

  return (
    <div className="h-full flex flex-col bg-black/60 border-l border-white/10">
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-400/50 overflow-hidden bg-gray-800">
          <Image src="/assets/bot-avatar.png" alt="AI" width={40} height={40} />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Recruitment AI</h3>
          <span className="text-[10px] text-blue-400 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Instruction mode: type /
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800/80 text-gray-100 rounded-tl-none border border-white/10'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 rounded-2xl px-4 py-2 border border-white/5 italic text-blue-400 text-xs animate-pulse">
              Processing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 border-t border-white/10 relative">
        {showCommands && (
          <div className="absolute bottom-full left-5 right-5 mb-2 bg-gray-900 border border-blue-500/40 rounded-xl shadow-xl overflow-hidden z-10">
            <div className="p-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest border-b border-white/10">
              Available commands
            </div>
            {COMMANDS.map(({ cmd, desc }) => (
              <button
                key={cmd}
                onClick={() => selectCommand(cmd)}
                className="w-full px-4 py-3 text-left hover:bg-white/5 flex flex-col gap-0.5 transition-colors"
              >
                <span className="text-blue-400 font-mono font-bold">{cmd}</span>
                <span className="text-gray-400 text-xs">{desc}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
              if (e.key === 'Escape') setShowCommands(false)
            }}
            placeholder="Type / for commands, or ask anything..."
            className="flex-1 bg-black/60 border border-white/10 rounded-xl text-white text-sm px-4 py-3 outline-none focus:border-blue-500 transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-500 disabled:opacity-30 transition-all font-bold text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
