const CATEGORIES = [
  { id: 'all', label: 'All Products', amharic: 'ሁሉም ምርቶች', icon: '🛍️' },
  { id: 'mens-collection', label: "Men's Fashion", amharic: 'የወንዶች ልብስ', icon: '👔' },
  { id: 'womens-collection', label: "Women's Fashion", amharic: 'የሴቶች ልብስ', icon: '👗' },
  { id: 'habesha-kemis', label: 'Habesha Kemis', amharic: 'ሃበሻ ቀሚስ', icon: '🌿' },
  { id: 'traditional-wear', label: 'Traditional Wear', amharic: 'ባህላዊ ልብስ', icon: '🎋' },
  { id: 'accessories', label: 'Accessories', amharic: 'ጌጣጌጥ', icon: '💍' },
]

export default function CategoryNavigation({ selected, onChange }) {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-[57px] z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          {CATEGORIES.map((cat) => {
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
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { CATEGORIES }

