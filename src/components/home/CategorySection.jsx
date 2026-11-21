import { useState, useEffect } from 'react'
import { categories as defaultCategories } from '../../data/categories'
import { categoryApi } from '../../services/api/categoryApi'
import CategoryCard from './CategoryCard'
import SectionHeading from '../common/SectionHeading'

export default function CategorySection({ onSelectCategory }) {
  const [items, setItems] = useState(defaultCategories)

  useEffect(() => {
    let isMounted = true
    categoryApi
      .getCatalogCategories()
      .then((cats) => {
        if (isMounted && Array.isArray(cats) && cats.length > 0) {
          const formatted = cats.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            amharicName: c.amharic_name || c.amharicName || 'ሀበሻ ጥበብ',
            description: c.description || 'Authentic Ethiopian artisan attire and cultural garments.',
            image: c.image || defaultCategories[0]?.image,
            itemCount: c.product_count ?? 0,
          }))
          setItems(formatted)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section id="categories" className="py-16 sm:py-24 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="Curated By Heritage"
          title="Explore Our Collections"
          amharicTitle="የፋሽን ስብስቦቻችንን ይጎብኙ"
          description="Find your style from our carefully selected fashion collections, handwoven by skilled Ethiopian artisans."
        />

        {/* 5-Category Layout: First row 3 cards, Second row 2 featured wide cards or responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.slice(0, 3).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={onSelectCategory}
            />
          ))}
        </div>

        {items.length > 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
            {items.slice(3, 5).map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={onSelectCategory}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
