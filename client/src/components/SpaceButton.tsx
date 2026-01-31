'use client'

interface SpaceButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function SpaceButton({ children, onClick, variant = 'primary', className = '' }: SpaceButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 animate-float'
  const variantClasses = variant === 'primary' 
    ? 'bg-space-light hover:bg-space-blue text-white shadow-lg' 
    : 'bg-transparent border-2 border-space-light hover:bg-space-light text-white'

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  )
}

