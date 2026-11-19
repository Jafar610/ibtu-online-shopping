import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  MapPin,
  Package,
  ShoppingBag,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function CustomerSidebar({ onCloseMobile }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const navItems = [
    {
      to: '/account',
      label: 'Account Overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/account/profile',
      label: 'My Profile',
      icon: User,
    },
    {
      to: '/account/addresses',
      label: 'My Addresses',
      icon: MapPin,
    },
    {
      to: '/account/orders',
      label: 'My Orders',
      icon: Package,
    },
  ]

  const handleLogout = () => {
    logout()
    if (onCloseMobile) onCloseMobile()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-full lg:w-64 space-y-6 shrink-0">
      {/* Customer Quick Profile Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#103321] text-[#95C623] flex items-center justify-center font-bold text-base shadow-xs shrink-0">
          {user?.avatar || (user?.firstName ? user.firstName.charAt(0) : 'U')}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif font-bold text-sm text-[#103321] truncate">
            {user?.name || `${user?.firstName || 'Customer'} ${user?.lastName || ''}`}
          </h3>
          <p className="text-xs text-gray-400 truncate">
            {user?.email || 'customer@ibtu.com'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1.5 block">
          Customer Portal
        </span>

        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#103321] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#103321] hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#95C623]' : 'text-gray-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-[#95C623]' : 'text-gray-300'
                    }`}
                  />
                </>
              )}
            </NavLink>
          )
        })}

        <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
          <NavLink
            to="/shop"
            onClick={onCloseMobile}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#103321] hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-gray-400" />
              <span>Back to Store</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  )
}
