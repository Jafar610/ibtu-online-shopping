import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function PasswordInput({
  label = 'Password',
  id = 'password',
  value,
  onChange,
  placeholder = '••••••••',
  error,
  required = false,
  autoComplete = 'current-password',
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-gray-700 tracking-wide">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full py-2.5 sm:py-3 pl-10 pr-11 text-xs sm:text-sm bg-white rounded-xl border transition-all duration-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-200 hover:border-gray-300 focus:border-[#95C623] focus:ring-[#95C623]/20'
          }`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#103321] transition-colors cursor-pointer"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <p className="text-[11px] font-medium text-red-500 animate-fadeIn flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
