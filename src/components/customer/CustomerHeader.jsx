import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export default function CustomerHeader({
  title,
  subtitle,
  breadcrumbs = [],
  action,
}) {
  return (
    <div className="bg-white border-b border-gray-100 py-6 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-2 flex-wrap">
          <Link to="/" className="hover:text-[#103321] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/account" className="hover:text-[#103321] transition-colors">
            My Account
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span>/</span>
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-[#103321] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#103321] font-semibold">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#103321]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div className="self-start sm:self-auto">{action}</div>}
        </div>
      </div>
    </div>
  )
}
