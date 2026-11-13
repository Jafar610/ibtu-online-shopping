import ProductCard from './ProductCard'

export default function ProductGrid({ products, onQuickView }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No products found in this collection.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  )
}

