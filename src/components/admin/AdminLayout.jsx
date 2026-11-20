import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import AdminMobileMenu from './AdminMobileMenu'

export default function AdminLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-[#F8F9FA] text-[#1A1A1A] antialiased">
      {/* 1. Desktop Fixed/Sticky Sidebar (>=lg) */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-40">
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onCloseMobile={() => {}}
        />
      </div>

      {/* 2. Mobile Drawer Navigation (<lg) */}
      <AdminMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 3. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Admin Header */}
        <AdminHeader
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="h-12 border-t border-gray-100 bg-white px-6 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} IBTU E-Commerce Platform</span>
            <span>•</span>
            <span className="font-serif">ሀበሻን ጥበብ የፋሽን መድረክ</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Frontend Architecture (Milestone 5 - Step 7)</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
