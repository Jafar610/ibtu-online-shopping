import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Clock, CreditCard, Boxes, Truck, X } from 'lucide-react'
import { sampleAdminNotifications } from '../../data/admin/adminDashboardMockData'

const ICON_MAP = {
  payment: CreditCard,
  inventory: Boxes,
  shipment: Truck,
}

export default function AdminNotificationMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(sampleAdminNotifications)
  const menuRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleClear = () => {
    setNotifications([])
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-500 hover:text-[#103321] hover:bg-gray-100 transition-colors cursor-pointer"
        title="Admin Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-fadeIn space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-sm text-[#103321]">
                System Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-[#103321] hover:text-[#95C623] cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No notifications at this time.
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 pr-1 space-y-1">
              {notifications.map((n) => {
                const Icon = ICON_MAP[n.type] || Bell

                return (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl transition-colors flex items-start gap-3 ${
                      !n.read ? 'bg-amber-50/40' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#103321]/10 text-[#103321] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 leading-tight">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                        {n.description}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {n.time}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Development Mock Feed</span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
