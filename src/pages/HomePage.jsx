import { useState } from 'react'
import AnnouncementBar from '../components/layout/AnnouncementBar'
import Navbar from '../components/layout/Navbar'
import MobileMenu from '../components/layout/MobileMenu'
import SearchOverlay from '../components/layout/SearchOverlay'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import QuickViewModal from '../components/product/QuickViewModal'
import AIChatButton from '../components/ai/AIChatButton'
import AIChatDrawer from '../components/ai/AIChatDrawer'

import HeroSection from '../components/home/HeroSection'
import CategorySection from '../components/home/CategorySection'
import NewArrivals from '../components/home/NewArrivals'
import PromotionalBanner from '../components/home/PromotionalBanner'
import BestSellers from '../components/home/BestSellers'
import WhyChooseUs from '../components/home/WhyChooseUs'
import Newsletter from '../components/home/Newsletter'

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all')

  const handleShopClick = () => {
    const el = document.getElementById('new-arrivals')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleStoryClick = () => {
    const el = document.getElementById('about-story')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSelectCategory = (categorySlug) => {
    setActiveCategoryFilter(categorySlug)
    const el = document.getElementById('new-arrivals')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A]">
      {/* 1. Slim Announcement Bar */}
      <AnnouncementBar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* 2. Sticky Main Navigation Bar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {/* 3. Hero Banner Section */}
        <HeroSection
          onShopClick={handleShopClick}
          onStoryClick={handleStoryClick}
        />

        {/* 4. Shop by Category Section */}
        <CategorySection onSelectCategory={handleSelectCategory} />

        {/* 5. New Arrivals Section */}
        <NewArrivals
          onQuickView={(product) => setQuickViewProduct(product)}
          activeCategoryFilter={activeCategoryFilter}
        />

        {/* 6. Promotional Heritage Banner */}
        <PromotionalBanner onExplore={handleShopClick} />

        {/* 7. Best Sellers Section */}
        <BestSellers
          onQuickView={(product) => setQuickViewProduct(product)}
          onViewAll={handleShopClick}
        />

        {/* Brand Heritage Story Showcase */}
        <section id="about-story" className="py-16 sm:py-24 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#95C623] px-3.5 py-1 rounded-full bg-[#95C623]/15">
                  Our Heritage & Mission
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#103321] leading-tight">
                  Preserving Ancient Weaving Traditions for the Global Wardrobe.
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  At <strong>ibtu (ሀበሻን ጥበብ)</strong>, every thread tells an Ethiopian story. From the hand-spun raw cotton cultivated in the Rift Valley to the vibrant loom-woven Tibeb patterns crafted by generations of master weavers in Dorze, Gondar, and Addis Ababa, our mission is to elevate Ethiopian luxury onto the global stage.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                    <span className="font-serif text-2xl font-bold text-[#103321] block">
                      100% Cotton
                    </span>
                    <span className="text-xs text-gray-500">Pure Menen & Shemma</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                    <span className="font-serif text-2xl font-bold text-[#95C623] block">
                      Ethical Trade
                    </span>
                    <span className="text-xs text-gray-500">Direct Artisan Empowerment</span>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80"
                  alt="Ethiopian Traditional Craftsmanship"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#103321]/80 via-transparent to-transparent flex items-end p-6">
                  <p className="text-white text-xs sm:text-sm font-medium">
                    Handloom artistry passed down through centuries • Addis Ababa & Wolaita
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Why Choose ibtu Section */}
        <WhyChooseUs />

        {/* 9. Newsletter Subscription Section */}
        <Newsletter />
      </main>

      {/* 10. Comprehensive Footer */}
      <Footer />

      {/* Global Modals & Drawers */}
      <CartDrawer />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(product) => setQuickViewProduct(product)}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelectCategory={handleSelectCategory}
      />

      {/* 11. Floating AI Shopping Assistant */}
      <AIChatButton
        isOpen={isAIChatOpen}
        onClick={() => setIsAIChatOpen(true)}
      />

      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onQuickView={(product) => setQuickViewProduct(product)}
      />
    </div>
  )
}
