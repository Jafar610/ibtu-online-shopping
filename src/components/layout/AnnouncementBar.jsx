import { useState } from 'react'
import { Truck, ChevronDown, Check, Globe } from 'lucide-react'

export default function AnnouncementBar({ currentLang = 'EN', onLanguageChange }) {
  const [isLangOpen, setIsLangOpen] = useState(false)
  const languages = [
    { code: 'EN', label: 'English', native: 'English' },
    { code: 'AM', label: 'Amharic', native: 'አማርኛ' },
  ]

  return (
    <div className="bg-[#95C623] text-[#103321] text-xs font-medium py-2 px-4 border-b border-[#82ad1e]/40 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Free shipping highlight */}
        <div className="flex items-center gap-2 font-semibold">
          <Truck className="w-4 h-4 shrink-0 text-[#103321] animate-pulse" />
          <span className="hidden sm:inline">Free Shipping on Orders Over 2000 ETB!</span>
          <span className="sm:hidden">Free Shipping Over 2000 ETB!</span>
          <span className="hidden md:inline-block bg-[#103321] text-[#95C623] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-1">
            Nationwide & Diaspora
          </span>
        </div>

        {/* Right: Quick Links & Language Selector */}
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden md:flex items-center gap-4 text-xs">
            <a href="#about-story" className="hover:text-black transition-colors">
              About
            </a>
            <span className="text-[#103321]/30">|</span>
            <a href="#contact" className="hover:text-black transition-colors">
              Contact
            </a>
            <span className="text-[#103321]/30">|</span>
            <a href="#faq" className="hover:text-black transition-colors">
              FAQ
            </a>
          </nav>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 font-bold hover:text-black py-0.5 px-2 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Select language"
              aria-expanded={isLangOpen}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsLangOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1.5 z-40 text-gray-800 text-xs">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        if (onLanguageChange) onLanguageChange(lang.code)
                        setIsLangOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#95C623]/10 hover:text-[#103321] transition-colors cursor-pointer"
                    >
                      <span className="font-medium">
                        {lang.label} ({lang.native})
                      </span>
                      {currentLang === lang.code && (
                        <Check className="w-3.5 h-3.5 text-[#103321] font-bold" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

