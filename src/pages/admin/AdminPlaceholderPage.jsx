import { Link } from 'react-router-dom'
import {
  Clock,
  ArrowLeft,
  Sparkles,
  Layers,
  Shirt,
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
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminPageHeader from '../../components/admin/AdminPageHeader'

const ICON_MAP = {
  products: Shirt,
  categories: Layers,
  inventory: Boxes,
  orders: ShoppingBag,
  payments: CreditCard,
  shipments: Truck,
  coupons: Tag,
  customers: Users,
  reviews: Star,
  messages: MessageSquare,
  users: UserCheck,
  roles: Shield,
  reports: BarChart3,
  settings: Settings,
  'audit-logs': ScrollText,
}

export default function AdminPlaceholderPage({
  title = 'Management Module',
  description = 'This administrative interface is scheduled for full CRUD implementation in Step 8.',
  moduleKey = 'products',
  plannedFeatures = [],
}) {
  const Icon = ICON_MAP[moduleKey] || Layers

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title={title}
          description={description}
          breadcrumbs={[{ label: title }]}
          badge="Scheduled for Step 8"
          action={
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
          }
        />

        {/* Milestone Foundation Card */}
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#95C623]/20 text-[#103321] mx-auto flex items-center justify-center shadow-xs">
            <Icon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#103321] text-[#95C623]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 5 • Step 7 Foundation Active</span>
            </span>

            <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-[#103321] pt-1">
              {title} Management Ready for Implementation
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
              The route, navigation structure, role verification, and layout for this module have been reserved per Step 7 specifications. Full management tables, forms, filters, and actions will be built in Phase 5 – Step 8.
            </p>
          </div>

          {/* Planned Features Checklist */}
          {plannedFeatures && plannedFeatures.length > 0 && (
            <div className="pt-2 max-w-md mx-auto text-left bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Planned Functionality (Step 8):
              </span>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {plannedFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#95C623]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/admin/dashboard"
              className="px-6 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] text-white hover:text-[#103321] text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Admin Dashboard Overview</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
