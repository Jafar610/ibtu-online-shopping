import { ArrowRight, Sparkles, Gift } from 'lucide-react'
import Button from '../common/Button'
import promoImg from '../../assets/Promotional-Banner.jpg'

export default function PromotionalBanner({ onExplore }) {
  return (
    <section id="promotional-banner" className="py-12 sm:py-20 bg-[#103321] text-white relative overflow-hidden">
      {/* Decorative Ethiopian Tibeb-inspired geometric background pattern */}
      <div className="absolute inset-0 opacity-10 bg-tibeb-pattern pointer-events-none" />

      {/* Ambient gradient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#95C623]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-[#0b2216] via-[#103321] to-[#16462c] rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="p-8 sm:p-12 lg:p-16 lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#95C623]/15 text-[#95C623] text-xs font-bold uppercase tracking-widest border border-[#95C623]/30">
                <Gift className="w-3.5 h-3.5" />
                <span>Special Ethiopian Season Highlight</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Celebrate Your Style.{' '}
                <span className="text-[#95C623] block sm:inline">
                  Embrace Your Heritage.
                </span>
              </h2>

              <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl">
                Discover unique fashion pieces inspired by the beauty of Ethiopian culture. Handspun, authentic, and tailored to turn heads at every gathering.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button
                  onClick={onExplore}
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="font-bold shadow-lg shadow-[#95C623]/25"
                >
                  Explore the Collection
                </Button>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Sparkles className="w-4 h-4 text-[#95C623]" />
                  <span>Limited artisan batches available</span>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full min-h-[320px] overflow-hidden">
              <img
                src={promoImg}
                alt="Ethiopian Cultural Elegance"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#103321] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#103321] lg:to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

