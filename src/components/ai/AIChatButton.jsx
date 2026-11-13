import { Sparkles } from 'lucide-react'

export default function AIChatButton({ onClick, isOpen }) {
  if (isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#95C623] text-[#103321] shadow-2xl hover:bg-[#82ad1e] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="Open ibtu AI Shopping Assistant"
        title="ibtu AI Stylist"
      >
        {/* Pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-[#95C623] opacity-40 animate-ping pointer-events-none" />

        <div className="relative flex items-center justify-center">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        {/* Tooltip / Label */}
        <span className="absolute right-full mr-3 bg-[#103321] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-white/10">
          Ask ibtu AI Stylist ✨
        </span>
      </button>
    </div>
  )
}
