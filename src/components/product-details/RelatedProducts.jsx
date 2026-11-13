import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard'
import { products as allProducts } from '../../data/products'

export default function RelatedProducts({ currentProduct, onQuickView }) {
  const related = allProducts
    .filter(
      (p) =>
        p.id !== currentProduct.id &&
        (p.category === currentProduct.category ||
          Math.abs(p.price - currentProduct.price) < 2000)
    )
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)

  if (related.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#95C623] block mb-1">
            More to Explore
          </span>
          <h2 className="font-serif text-xl font-bold text-[#103321]">You May Also Like</h2>
        </div>
        <Link
          to="/shop"
          className="text-xs font-bold text-[#103321] hover:text-[#95C623] transition-colors underline underline-offset-2"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {related.map((product) => (
          <Link key={product.id} to={`/product/${product.slug || product.id}`}>
            <ProductCard
              product={product}
              onQuickView={onQuickView}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

