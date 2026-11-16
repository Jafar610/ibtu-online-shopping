import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, Star, Award, Users, Leaf, ShieldCheck, ArrowRight, ChevronDown,
} from 'lucide-react'
import AnnouncementBar from '../components/layout/AnnouncementBar'
import Navbar from '../components/layout/Navbar'
import MobileMenu from '../components/layout/MobileMenu'
import SearchOverlay from '../components/layout/SearchOverlay'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import QuickViewModal from '../components/product/QuickViewModal'

const values = [
  {
    icon: Heart,
    title: 'Cultural Identity',
    amharic: 'ማንነት',
    description:
      'We celebrate the rich heritage of Ethiopian fashion, ensuring every garment tells a meaningful cultural story.',
  },
  {
    icon: Star,
    title: 'Quality',
    amharic: 'ጥራት',
    description:
      'From handspun cotton to machine-precision stitching, we maintain rigorous quality in every piece we offer.',
  },
  {
    icon: Users,
    title: 'Customer Satisfaction',
    amharic: 'ደንበኛ እርካታ',
    description:
      'Your shopping experience matters. We work tirelessly to ensure every order meets your expectations.',
  },
  {
    icon: Award,
    title: 'Creativity',
    amharic: 'ፈጠራ',
    description:
      'We blend traditional weaving artistry with contemporary design to create fashion that is both timeless and fresh.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    amharic: 'እምነት',
    description:
      'Transparent pricing, honest product descriptions, and reliable delivery — we build relationships through trust.',
  },
  {
    icon: Leaf,
    title: 'Ethical Trade',
    amharic: 'ፍትሃዊ ንግድ',
    description:
      'We support Ethiopian artisans directly, ensuring fair compensation and sustainable livelihoods for our weavers.',
  },
]

export default function AboutPage() {
  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A]">
      <AnnouncementBar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        activePage="about"
      />

      <main className="flex-1">

        {/* ── SECTION A: HERO ─────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#103321] text-white py-20 sm:py-28 lg:py-36">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-tibeb-pattern opacity-10 pointer-events-none" />

          {/* Hero image overlay */}
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80')",
            }}
          />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#95C623] bg-[#95C623]/15 px-4 py-1.5 rounded-full border border-[#95C623]/30">
              About IBTU · ሀበሻን ጥበብ
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Celebrating Ethiopian Heritage{' '}
              <span className="text-[#95C623]">Through Fashion</span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
              IBTU brings together the beauty of Ethiopian traditional clothing and contemporary
              fashion, helping customers express their identity through carefully selected styles.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm font-semibold text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#95C623]" />
                <span>Handwoven Artistry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#95C623]" />
                <span>Nationwide Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#95C623]" />
                <span>Artisan Supported</span>
              </div>
            </div>

            {/* Scroll cue */}
            <div className="pt-6 flex justify-center animate-bounce opacity-60">
              <ChevronDown className="w-6 h-6 text-[#95C623]" />
            </div>
          </div>
        </section>

        {/* ── SECTION B: OUR STORY ────────────────────────────────── */}
        <section className="py-16 sm:py-24 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Text side */}
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#95C623] px-3.5 py-1 rounded-full bg-[#95C623]/15">
                  Our Story · ታሪካችን
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#103321] leading-tight">
                  Rooted in Ethiopian Culture, Reaching the World
                </h2>
                <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                  <p>
                    IBTU (ሀበሻን ጥበብ) was born from a simple yet powerful idea: to make Ethiopia's
                    extraordinary clothing tradition accessible to everyone. The name itself — meaning
                    "Ethiopian Craft" — reflects our deepest commitment.
                  </p>
                  <p>
                    Ethiopian fashion has flourished for centuries. The intricate Tibeb borders of the
                    Habesha Kemis, the pure white Netela draped across shoulders, the hand-spun Shemma
                    fabric — these are not just garments. They are living expressions of identity, faith,
                    and community.
                  </p>
                  <p>
                    Our platform was created to give these masterpieces the stage they deserve, bringing
                    the work of skilled Ethiopian weavers and designers directly to customers across the
                    country and beyond.
                  </p>
                </div>
              </div>

              {/* Image side */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80"
                  alt="Ethiopian traditional clothing craftsmanship"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#103321]/70 via-transparent to-transparent flex items-end p-6">
                  <p className="text-white text-xs sm:text-sm font-medium">
                    Handloom artistry passed down through generations · Addis Ababa & Wolaita
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION C & D: MISSION + VISION (side by side) ───── */}
        <section className="py-16 sm:py-24 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#95C623] px-3.5 py-1 rounded-full bg-[#95C623]/15">
                Purpose · ዓላማ
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#103321] mt-4">
                Our Mission &amp; Vision
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mission */}
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#103321] flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#95C623]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#103321]">Our Mission</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To offer Ethiopian customers and fashion lovers a curated selection of high-quality
                  traditional and contemporary clothing, delivered with an effortless and trustworthy
                  shopping experience — celebrating our cultural identity with every purchase.
                </p>
                <div className="pt-2 space-y-2">
                  {[
                    'Curate authentic Ethiopian fashion',
                    'Support local artisans and weavers',
                    'Deliver a seamless, honest experience',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#95C623] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vision */}
              <div className="bg-[#103321] rounded-3xl p-8 sm:p-10 shadow-sm space-y-4 text-white">
                <div className="w-12 h-12 rounded-2xl bg-[#95C623]/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-[#95C623]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">Our Vision</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  To become Ethiopia's most trusted fashion destination — a platform where every
                  Ethiopian, at home or abroad, can find, celebrate, and proudly wear their cultural
                  heritage in modern, contemporary styles.
                </p>
                <div className="pt-2 space-y-2">
                  {[
                    "Ethiopia's leading fashion platform",
                    'Bridge tradition with modernity',
                    'Inspire pride in Ethiopian craftsmanship',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-white/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#95C623] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION E: OUR VALUES ───────────────────────────────── */}
        <section className="py-16 sm:py-24 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#95C623] px-3.5 py-1 rounded-full bg-[#95C623]/15">
                Our Values · እሴቶቻችን
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#103321]">
                What Drives Everything We Do
              </h2>
              <p className="text-gray-500 text-sm max-w-xl mx-auto">
                Every decision at IBTU is guided by these six values — from the products we select to
                the way we treat our customers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((val) => {
                const Icon = val.icon
                return (
                  <div
                    key={val.title}
                    className="group p-6 rounded-2xl border border-gray-100 bg-[#F8F9FA] hover:bg-[#103321] hover:border-[#103321] transition-all duration-300 space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#95C623]/15 group-hover:bg-[#95C623]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#103321] group-hover:text-[#95C623] transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#103321] group-hover:text-white text-sm transition-colors">
                        {val.title}
                      </h4>
                      <p className="text-[10px] text-[#95C623] font-medium mt-0.5">{val.amharic}</p>
                    </div>
                    <p className="text-xs text-gray-500 group-hover:text-white/70 leading-relaxed transition-colors">
                      {val.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION F: CALL TO ACTION ───────────────────────────── */}
        <section className="py-16 sm:py-20 bg-[#103321] relative overflow-hidden">
          <div className="absolute inset-0 bg-tibeb-pattern opacity-10 pointer-events-none" />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#95C623]">
              Ready to Explore?
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
              Discover Authentic Ethiopian Fashion
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-lg mx-auto">
              Browse our curated collection of handwoven dresses, traditional garments, modern designs,
              and artisan accessories — all in one place.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#95C623] text-[#103321] font-bold text-sm hover:bg-[#82ad1e] transition-colors shadow-lg"
            >
              Explore Our Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
      <CartDrawer />
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  )
}
