import { useMemo } from 'react'

const DEFAULT_ICONS = {
  all: '🛍️',
  'mens-collection': '👔',
  'womens-collection': '👗',
  'habesha-kemis': '🌿',
  'traditional-wear': '🎋',
  accessories: '💍',
}

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Products', amharic: 'ሁሉም ምርቶች', icon: '🛍️' },
  { id: 'mens-collection', label: "Men's Fashion", amharic: 'የወንዶች ልብስ', icon: '👔' },
  { id: 'womens-collection', label: "Women's Fashion", amharic: 'የሴቶች ልብስ', icon: '👗' },
  { id: 'habesha-kemis', label: 'Habesha Kemis', amharic: 'ሃበሻ ቀሚስ', icon: '🌿' },
  { id: 'traditional-wear', label: 'Traditional Wear', amharic: 'ባህላዊ ልብስ', icon: '🎋' },
  { id: 'accessories', label: 'Accessories', amharic: 'ጌጣጌጥ', icon: '💍' },
]

export default function CategoryNavigation({ selected, onChange, categories = null }) {
  const categoryList = useMemo(() => {
    if (!categories || categories.length === 0) {
      return DEFAULT_CATEGORIES
    }

    const dynamicItems = categories.map((cat) => ({
      id: cat.slug || String(cat.id),
      label: cat.name,
      amharic: cat.amharic_name || cat.amharicName || null,
      icon: DEFAULT_ICONS[cat.slug] || '✨',
      productCount: cat.product_count ?? cat.productCount,
    }))

    return [
      { id: 'all', label: 'All Products', amharic: 'ሁሉም ምርቶች', icon: '🛍️' },
      ...dynamicItems,
    ]
  }, [categories])

  return (
    <div className="bg-white border-b border-gray-100 sticky top-[57px] z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          {categoryList.map((cat) => {
            const isActive = selected === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => onChange(cat.id)}
                className={`flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#95C623] text-[#103321] shadow-sm'
                    : 'text-gray-600 hover:text-[#103321] hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.productCount !== undefined && cat.productCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#103321]/20 text-[#103321]' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.productCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { DEFAULT_CATEGORIES as CATEGORIES }
