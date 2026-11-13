export default function Button({
  children,
  variant = 'primary', // primary (lime), forest, outline, ghost
  size = 'md', // sm, md, lg
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'bg-[#95C623] text-[#103321] hover:bg-[#82ad1e] active:scale-[0.98] shadow-sm font-semibold hover:shadow-md hover:shadow-[#95C623]/20',
    forest: 'bg-[#103321] text-white hover:bg-[#16462c] active:scale-[0.98] shadow-sm font-semibold hover:shadow-md hover:shadow-[#103321]/20',
    outline: 'border-2 border-[#103321] text-[#103321] hover:bg-[#103321] hover:text-white active:scale-[0.98]',
    'outline-light': 'border-2 border-white/60 text-white hover:bg-white hover:text-[#103321] active:scale-[0.98]',
    'outline-lime': 'border-2 border-[#95C623] text-[#95C623] hover:bg-[#95C623] hover:text-[#103321] active:scale-[0.98]',
    ghost: 'text-[#103321] hover:bg-black/5 active:scale-[0.98]',
    'ghost-light': 'text-white hover:bg-white/10 active:scale-[0.98]',
  }

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  )
}

