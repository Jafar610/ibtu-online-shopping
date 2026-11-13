import { categories } from '../../data/categories'
import CategoryCard from './CategoryCard'
import SectionHeading from '../common/SectionHeading'

export default function CategorySection({ onSelectCategory }) {
  return (
    <section id="categories" className="py-16 sm:py-24 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="Curated By Heritage"
          title="Explore Our Collections"
          amharicTitle="የፋሽን ስብስቦቻችንን ይጎብኙ"
          description="Find your style from our carefully selected fashion collections, handwoven by skilled Ethiopian artisans."
        />

        {/* 5-Category Layout: First row 3 cards, Second row 2 featured wide cards or 5 responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.slice(0, 3).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={onSelectCategory}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {categories.slice(3, 5).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={onSelectCategory}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

