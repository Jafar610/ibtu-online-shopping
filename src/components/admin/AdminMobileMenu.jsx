import { useEffect } from 'react'
import { X } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

export default function AdminMobileMenu({ isOpen, onClose }) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#103321] z-50 shadow-2xl flex flex-col animate-slideRight">
        {/* Close Button top-right overlay */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-3 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
          title="Close Navigation"
        >
          <X className="w-4 h-4" />
        </button>

        <AdminSidebar isCollapsed={false} onCloseMobile={onClose} />
      </div>
    </div>
  )
}
