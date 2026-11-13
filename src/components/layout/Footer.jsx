import {
  MapPin,
  Phone,
  Mail,
  Send,
  ArrowUp,
  ShieldCheck,
} from 'lucide-react'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer id="contact" className="bg-[#103321] text-white pt-16 pb-8 border-t border-white/10 relative">
      {/* Decorative subtle pattern */}
      <div className="absolute inset-0 opacity-5 bg-tibeb-pattern pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <a href="#" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#95C623] bg-white p-0.5">
                <img
                  src="/src/assets/logo.jpg"
                  alt="ibtu logo"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div>
                <span className="font-sans text-2xl font-extrabold tracking-tight text-white block">
                  ibtu
                </span>
                <span className="text-xs text-[#95C623] tracking-widest font-semibold uppercase">
                  ሀበሻን ጥበብ
                </span>
              </div>
            </a>

            <p className="text-sm text-white/75 leading-relaxed max-w-sm">
              ibtu is an Ethiopian fashion e-commerce destination celebrating cultural identity, handspun cotton, and authentic Tibeb craftsmanship for the modern world.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#95C623] hover:text-[#103321] text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#95C623] hover:text-[#103321] text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#95C623] hover:text-[#103321] text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#95C623] hover:text-[#103321] text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#95C623]">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <a href="#" className="hover:text-[#95C623] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#new-arrivals" className="hover:text-[#95C623] transition-colors">
                  Shop All
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-[#95C623] transition-colors">
                  Collections
                </a>
              </li>
              <li>
                <a href="#about-story" className="hover:text-[#95C623] transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#95C623] transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#95C623]">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <a href="#shipping" className="hover:text-[#95C623] transition-colors">
                  Shipping & Delivery Info
                </a>
              </li>
              <li>
                <a href="#returns" className="hover:text-[#95C623] transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#sizing" className="hover:text-[#95C623] transition-colors">
                  Ethiopian Size Guide
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-[#95C623] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-[#95C623] transition-colors">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info (3 cols) */}
          <div id="contact-info" className="lg:col-span-3 space-y-4">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#95C623]">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs text-white/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#95C623] shrink-0 mt-0.5" />
                <span>Bole Sub-City, Atlas Road, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#95C623] shrink-0" />
                <span>+251 911 234 567 / +251 116 789 012</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#95C623] shrink-0" />
                <span>support@ibtu.com</span>
              </li>
              <li className="pt-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#95C623] shrink-0" />
                  <span className="text-[11px] text-white/90">
                    Direct Artisan Support • Mon-Sat 9am-7pm
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© 2026 ibtu (ሀበሻን ጥበብ). All rights reserved.</p>

          {/* Payment Method Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-white/40 mr-1">
              Accepted Payments:
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium text-[11px]">
              Telebirr
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium text-[11px]">
              CBE Birr
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium text-[11px]">
              Chapa
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium text-[11px]">
              Visa
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium text-[11px]">
              Mastercard
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-[#95C623] hover:underline cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}
