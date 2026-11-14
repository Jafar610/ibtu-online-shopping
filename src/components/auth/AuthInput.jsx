export default function AuthInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  required = false,
  autoComplete,
  disabled = false,
}) {
  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-gray-700 tracking-wide">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm bg-white rounded-xl border transition-all duration-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:cursor-not-allowed ${
            Icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-200 hover:border-gray-300 focus:border-[#95C623] focus:ring-[#95C623]/20'
          }`}
        />
      </div>
      {error && (
        <p className="text-[11px] font-medium text-red-500 animate-fadeIn flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
