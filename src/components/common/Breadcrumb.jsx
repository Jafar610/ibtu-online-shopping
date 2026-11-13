import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-xs text-white/70">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-3 h-3 text-white/40 shrink-0" />}
            {item.href ? (
              <Link
                to={item.href}
                className="hover:text-[#95C623] transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-white font-semibold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

