import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Shirt,
  Layers,
  ShoppingBag,
  CreditCard,
  Truck,
  Tag,
  Boxes,
  Users,
  Star,
  MessageSquare,
  UserCheck,
  Shield,
  BarChart3,
  Settings,
  ScrollText,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { getFilteredAdminNavigation } from '../../data/admin/adminNavigation'
import { useAuth } from '../../context/AuthContext'

const ICON_MAP = {
  LayoutDashboard,
  Shirt,
  Layers,
  ShoppingBag,
  CreditCard,
  Truck,
  Tag,
  Boxes,
  Users,
  Star,
  MessageSquare,
  UserCheck,
  Shield,
  BarChart3,
  Settings,
  ScrollText,
}

export default function AdminSidebar({ isCollapsed = false, onCloseMobile }) {
  const location = useLocation()
  const { user } = useAuth()

  const navGroups = getFilteredAdminNavigation(user?.role || 'admin')

  return (
    <aside
      className={`h-full flex flex-col bg-[#103321] text-white transition-all duration-300 border-r border-[#103321] select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* 1. Brand Logo Header */}
      <div className="h-16 flex items-center px-5 border-b border-white/10 shrink-0 justify-between">
        <Link
          to="/admin/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-[#95C623] text-[#103321] flex items-center justify-center font-serif font-black text-lg shrink-0 shadow-sm">
            I
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-serif font-extrabold text-base tracking-tight text-white block leading-tight">
                IBTU <span className="text-[#95C623] font-sans text-xs">Admin</span>
              </span>
              <span className="text-[10px] text-gray-300 font-serif block truncate">
                ሀበሻን ጥበብ Control Panel
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* 2. Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400/90 mb-1">
                {group.label}
              </h4>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = ICON_MAP[item.icon] || LayoutDashboard
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/admin/dashboard' && location.pathname === '/admin')

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group relative ${
                      isActive
                        ? 'bg-[#95C623] text-[#103321] shadow-sm font-extrabold'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#103321]' : 'text-gray-300'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-[#103321] text-[#95C623]'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-400 text-amber-950'
                            : item.badgeColor === 'rose'
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Footer with Role and Store Link */}
      <div className="p-3 border-t border-white/10 shrink-0 space-y-2">
        <Link
          to="/"
          onClick={onCloseMobile}
          className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Back to Public Storefront"
        >
          <ExternalLink className="w-4 h-4 text-[#95C623] shrink-0" />
          {!isCollapsed && (
            <span className="truncate flex-1">Public Storefront</span>
          )}
        </Link>
      </div>
    </aside>
  )
}
