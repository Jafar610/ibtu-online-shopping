export default function SectionHeading({
  tag,
  title,
  amharicTitle,
  description,
  centered = true,
  theme = 'dark', // 'dark' (for light backgrounds) or 'light' (for dark backgrounds)
  className = '',
}) {
  const isLight = theme === 'light'

  return (
    <div className={`mb-10 sm:mb-14 ${centered ? 'text-center max-w-2xl mx-auto' : 'max-w-xl'} ${className}`}>
      {tag && (
        <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#95C623]/15 text-[#95C623] mb-3">
          {tag}
        </span>
      )}
      
      <div className="flex flex-col gap-1 items-center justify-center">
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl font-sans font-bold tracking-tight ${
            isLight ? 'text-white' : 'text-[#103321]'
          }`}
        >
          {title}
        </h2>
        {amharicTitle && (
          <span className="text-sm font-medium text-[#95C623] tracking-wide">
            {amharicTitle}
          </span>
        )}
      </div>

      {description && (
        <p
          className={`mt-3 text-sm sm:text-base leading-relaxed ${
            isLight ? 'text-white/80' : 'text-gray-600'
          }`}
        >
          {description}
        </p>
      )}

      {centered && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="w-10 h-[2px] bg-[#95C623]" />
          <span className="w-2 h-2 rotate-45 bg-[#103321]" />
          <span className="w-10 h-[2px] bg-[#95C623]" />
        </div>
      )}
    </div>
  )
}

