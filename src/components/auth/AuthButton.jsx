import { Loader2 } from 'lucide-react'

export default function AuthButton({
  children,
  type = 'submit',
  variant = 'primary', // 'primary' | 'forest' | 'outline'
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
}) {
  const baseClasses =
    'w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'

  const variants = {
    primary: 'bg-[#95C623] hover:bg-[#82ad1e] text-[#103321]',
    forest: 'bg-[#103321] hover:bg-[#184a30] text-white',
    outline: 'bg-white border-2 border-gray-200 hover:border-[#103321] text-gray-700',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  )
}
