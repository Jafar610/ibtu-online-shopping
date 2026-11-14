import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export default function AuthNotification({
  type = 'error', // 'error' | 'success'
  message,
  onClose,
}) {
  if (!message) return null

  const isSuccess = type === 'success'

  return (
    <div
      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs animate-fadeIn ${
        isSuccess
          ? 'bg-[#95C623]/15 border-[#95C623]/40 text-[#103321]'
          : 'bg-red-50 border-red-200 text-red-700'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-[#95C623] shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        )}
        <span className="font-medium leading-relaxed">{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
