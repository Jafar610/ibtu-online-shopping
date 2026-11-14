export default function PasswordStrengthIndicator({ password }) {
  if (!password) return null

  // Calculate score 0-4
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const levels = [
    { label: 'Very Weak', color: 'bg-red-400', textColor: 'text-red-500' },
    { label: 'Weak', color: 'bg-orange-400', textColor: 'text-orange-500' },
    { label: 'Fair', color: 'bg-amber-400', textColor: 'text-amber-500' },
    { label: 'Good', color: 'bg-lime-500', textColor: 'text-lime-600' },
    { label: 'Strong', color: 'bg-[#95C623]', textColor: 'text-[#103321]' },
  ]

  const current = levels[score]

  return (
    <div className="space-y-1.5 pt-1 text-left">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-500">Password strength:</span>
        <span className={`font-bold ${current.textColor}`}>{current.label}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              step < score ? current.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <p className="text-[10px] text-gray-400">
        Use 8+ characters with uppercase, numbers & symbols for maximum security.
      </p>
    </div>
  )
}
