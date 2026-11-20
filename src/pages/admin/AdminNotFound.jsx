import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminPageHeader from '../../components/admin/AdminPageHeader'

export default function AdminNotFound() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Administrative Page Not Found"
          description="The requested administrative page does not exist or has been moved."
          breadcrumbs={[{ label: 'Not Found' }]}
        />

        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-[#103321]">
              404 - Admin Route Not Found
            </h3>
            <p className="text-xs text-gray-500">
              The URL you entered does not match any registered administrative management routes.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/dashboard"
              className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] text-white hover:text-[#103321] text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard Overview</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
