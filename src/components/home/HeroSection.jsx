import { useState, useEffect } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import heroSlide1 from '../../assets/hero-slide-1.jpg'
import heroSlide2 from '../../assets/hero-slide-2.jpg'

export default function HeroSection({ onShopClick }) {
  const slides = [
    {
      id: 'slide-1',
      titleLine1: 'Wear Our Culture,',
      titleLine2: 'Live with Style',
      description: 'Discover premium Ethiopian fashion with modern design.',
      buttonText: 'Shop Now',
      image: heroSlide1,
    },
    {
      id: 'slide-2',
      titleLine1: 'Tradition Meets',
      titleLine2: 'Modern Elegance',
      description: 'Authentic handspun Ethiopian fabrics and timeless Habesha designs.',
      buttonText: 'Explore',
      image: heroSlide2,
    },
  ]

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [slides.length])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const slide = slides[currentSlide]

  return (
    <section id="hero" className="relative w-full h-[520px] sm:h-[600px] lg:h-[660px] overflow-hidden bg-black select-none">
      {/* Full-width Background Slide Images */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={s.image}
            alt={s.titleLine1}
            className="w-full h-full object-cover object-top sm:object-center"
          />
          {/* Dark Overlay for optimal text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        </div>
      ))}

      {/* Hero Content Overlay: Title, Description, and Button */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex items-center">
        <div className="max-w-2xl text-left space-y-4 sm:space-y-6">
          {/* Main Title */}
          <h1 className="font-sans font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.15] tracking-tight">
            <span className="block">{slide.titleLine1}</span>
            <span className="block text-white">{slide.titleLine2}</span>
          </h1>

          {/* Description */}
          <p className="font-sans text-sm sm:text-lg lg:text-xl text-white/90 max-w-lg leading-relaxed">
            {slide.description}
          </p>

          {/* Action Button: Shop Now or Explore */}
          <div className="pt-2">
            <button
              onClick={onShopClick}
              className="bg-[#95C623] hover:bg-[#82ad1e] text-[#103321] font-bold text-sm sm:text-base px-8 py-3.5 rounded-full inline-flex items-center gap-2.5 transition-all duration-200 shadow-lg hover:shadow-[#95C623]/30 cursor-pointer active:scale-95"
            >
              <span>{slide.buttonText}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Slider Arrow Controls: Left `<` and Right `>` Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-[#95C623] hover:text-[#103321] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer z-20 shadow-lg active:scale-90"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-[#95C623] hover:text-[#103321] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer z-20 shadow-lg active:scale-90"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slider Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentSlide === idx
                ? 'w-8 h-2.5 bg-[#95C623]'
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
