import { ArrowUpRight } from 'lucide-react'

export default function CategoryCard({ category, onClick }) {
  return (
    <div
      onClick={() => onClick(category.slug)}
      className="group relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Category Image */}
      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#103321]/95 via-[#103321]/40 to-black/10 group-hover:from-[#103321] transition-all duration-300" />

      {/* Decorative lime accent border on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#95C623] rounded-3xl transition-all duration-300 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between text-white z-10">
        {/* Top badge */}
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white/90">
            {category.itemCount} Styles
          </span>
          <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-[#95C623] text-white group-hover:text-[#103321] flex items-center justify-center transition-all duration-300 transform group-hover:rotate-45">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Bottom Title & Details */}
        <div>
          <span className="text-xs font-semibold text-[#95C623] block mb-1">
            {category.amharicName}
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-[#95C623] transition-colors leading-tight">
            {category.name}
          </h3>
          <p className="text-xs text-white/75 mt-1 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
            {category.description}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#95C623] group-hover:underline">
            <span>Explore Collection</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </div>
  )
}

