'use client'

interface CandidateCardProps {
  name: string
  experience: number
  techStack: string
  aiScore: number
  cvUrl?: string
  status?: string
  onStatusChange?: (status: string) => void
  onGenerateEmail?: () => void
  onSuggestQuestions?: () => void
}

export default function CandidateCard({
  name,
  experience,
  techStack,
  aiScore,
  cvUrl,
  status = 'applied',
  onStatusChange,
  onGenerateEmail,
  onSuggestQuestions
}: CandidateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-space-dark border-2 border-space-light rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-gray-400">{experience} years of experience</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(aiScore)}`}>
            {aiScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">AI Score</div>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-300">Tech Stack:</p>
        <p className="text-white">{techStack}</p>
      </div>

      {cvUrl && (
        <a
          href={cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-space-light hover:text-space-blue underline"
        >
          Download CV
        </a>
      )}

      <div className="space-y-2">
        <p className="text-sm text-gray-300">Status:</p>
        <div className="flex space-x-2">
          {['applied', 'interview', 'offer'].map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange?.(s)}
              className={`px-3 py-1 rounded text-sm ${
                status === s
                  ? 'bg-space-light text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-2 pt-2">
        <button
          onClick={onGenerateEmail}
          className="flex-1 bg-space-light hover:bg-space-blue text-white px-4 py-2 rounded text-sm transition-colors"
        >
          Generate Email
        </button>
        <button
          onClick={onSuggestQuestions}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          Suggest Questions
        </button>
      </div>
    </div>
  )
}

