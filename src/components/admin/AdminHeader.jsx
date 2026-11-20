import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  ChevronDown,
  User,
  LogOut,
  ExternalLink,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AdminSearch from './AdminSearch'
import AdminNotificationMenu from './AdminNotificationMenu'

export default function AdminHeader({
  onToggleSidebar,
  isSidebarCollapsed,
  onOpenMobileMenu,
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileDropdownOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleName = user?.role === 'data_encoder' ? 'Data Encoder' : 'Administrator'
  const displayName = user?.name || user?.firstName || 'System Admin'

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-100 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Sidebar Toggle & Mobile Menu */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button (<lg) */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-[#103321] hover:bg-gray-100 transition-colors cursor-pointer"
          title="Open Admin Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Button (>=lg) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-xl text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors cursor-pointer"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Live System Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-700">IBTU Control Console</span>
        </div>
      </div>

      {/* Center: Search Interface */}
      <div className="flex-1 max-w-md hidden md:block">
        <AdminSearch />
      </div>

      {/* Right Controls: Notifications, View Store, and Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Public Store link shortcut */}
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#103321] transition-all"
          title="Open Public Store in new tab or navigate"
        >
          <span>Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </Link>

        {/* Notifications */}
        <AdminNotificationMenu />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-[#103321] block leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                {roleName}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fadeIn space-y-1">
              <div className="px-3 py-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#103321] block">
                  {displayName}
                </span>
                <span className="text-[11px] text-gray-400 block truncate">
                  {user?.email || 'admin@ibtu.com'}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#95C623]/20 text-[#103321]">
                  Role: {roleName}
                </span>
              </div>

              <Link
                to="/"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#103321] transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span>Visit Public Storefront</span>
              </Link>

              <div className="pt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
