import { useState } from 'react'
import AnnouncementBar from '../layout/AnnouncementBar'
import Navbar from '../layout/Navbar'
import MobileMenu from '../layout/MobileMenu'
import SearchOverlay from '../layout/SearchOverlay'
import Footer from '../layout/Footer'
import CartDrawer from '../cart/CartDrawer'
import QuickViewModal from '../product/QuickViewModal'
import CustomerSidebar from './CustomerSidebar'
import CustomerHeader from './CustomerHeader'

export default function CustomerLayout({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  children,
}) {
  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A]">
      {/* 1. Slim Announcement Bar */}
      <AnnouncementBar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* 2. Main Navigation Bar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* 3. Customer Header & Breadcrumbs */}
      {title && (
        <CustomerHeader
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          action={action}
        />
      )}

      {/* 4. Main Body: Sidebar + Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Customer Left Sidebar */}
          <CustomerSidebar />

          {/* Dynamic Content Area */}
          <div className="flex-1 min-w-0 w-full">{children}</div>
        </div>
      </main>

      {/* 5. Footer */}
      <Footer />

      {/* Overlays & Drawers */}
      <CartDrawer />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onQuickView={(p) => setQuickViewProduct(p)}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
