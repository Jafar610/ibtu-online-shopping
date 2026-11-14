import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, ShieldCheck, Truck } from 'lucide-react'
import leftSideImg from '../../assets/left-side-form-img.jpg'
import logoImg from '../../assets/logo.jpg'

export default function AuthLayout({
  children,
  subtitle = 'Discover authentic Ethiopian fashion and shop your favorite styles.',
}) {
  return (
    <div className="min-h-screen flex bg-[#F8F9FA] text-[#1A1A1A]">
      {/* Left Column: Visual Brand Showcase (Desktop only) */}
      <div className="hidden lg:relative lg:flex lg:w-[48%] xl:w-[45%] flex-col justify-between p-10 xl:p-14 text-white overflow-hidden bg-[#103321]">
        {/* Background lifestyle image with forest green overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={leftSideImg}
            alt="Ethiopian Traditional Fashion"
            className="w-full h-full object-cover object-center mix-blend-overlay opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#103321] via-[#103321]/75 to-[#103321]/90" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                #95C623 0px,
                #95C623 2px,
                transparent 2px,
                transparent 20px
              )`,
            }}
          />
        </div>

        {/* Top: Logo & Back link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#95C623] bg-white p-0.5 transition-transform duration-300 group-hover:scale-105">
              <img src={logoImg} alt="ibtu logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-2xl font-extrabold tracking-tight text-white leading-none">
                  ibtu
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#95C623]" />
              </div>
              <span className="text-[10px] text-[#95C623] font-medium tracking-widest uppercase">
                ሀበሻን ጥበብ
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-[#95C623] transition-colors py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store</span>
          </Link>
        </div>

        {/* Middle: Brand message */}
        <div className="relative z-10 max-w-md my-auto py-12 space-y-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#95C623] bg-[#95C623]/15 px-3.5 py-1 rounded-full border border-[#95C623]/25">
            <Sparkles className="w-3 h-3 text-[#95C623]" />
            Ethiopian Luxury Fashion
          </span>

          <h2 className="font-serif text-3xl xl:text-4xl font-bold leading-tight text-white">
            Wear Our Culture,
            <span className="block text-[#95C623]">Live with Style.</span>
          </h2>

          <p className="text-sm xl:text-base text-white/75 leading-relaxed font-light">
            {subtitle}
          </p>

          {/* Key Value Badges */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs text-white/80">
              <div className="w-6 h-6 rounded-lg bg-[#95C623]/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#95C623]" />
              </div>
              <span>100% Authentic Handspun Menen & Shemma Cotton</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              <div className="w-6 h-6 rounded-lg bg-[#95C623]/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#95C623]" />
              </div>
              <span>Direct Empowerment for Master Ethiopian Weavers</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              <div className="w-6 h-6 rounded-lg bg-[#95C623]/20 flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5 text-[#95C623]" />
              </div>
              <span>Fast & Secure Delivery Across Ethiopia & Worldwide</span>
            </div>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="relative z-10 text-xs text-white/40 pt-4 border-t border-white/10 flex justify-between">
          <span>© 2026 ibtu (ሀበሻን ጥበብ). All rights reserved.</span>
          <span>Addis Ababa, Ethiopia</span>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-10 xl:p-14 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between pb-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#95C623] bg-white p-0.5">
              <img src={logoImg} alt="ibtu logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-sans text-xl font-extrabold text-[#103321]">ibtu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#95C623]" />
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#103321] py-1.5 px-3 rounded-lg border border-gray-200"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Store</span>
          </Link>
        </div>

        {/* Form wrapper */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            {children}
          </div>
        </div>

        {/* Bottom footer links */}
        <div className="text-center text-xs text-gray-400 pt-6">
          <div className="flex justify-center gap-4 mb-2">
            <Link to="/" className="hover:text-[#103321] transition-colors">Home</Link>
            <span>•</span>
            <Link to="/shop" className="hover:text-[#103321] transition-colors">Shop Collection</Link>
            <span>•</span>
            <span className="cursor-pointer hover:text-[#103321]">Privacy Policy</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-[#103321]">Terms of Service</span>
          </div>
          <p>© 2026 ibtu. Proudly celebrating Ethiopian heritage.</p>
        </div>
      </div>
    </div>
  )
}
