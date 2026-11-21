import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard'
import { productApi } from '../../services/api/productApi'
import { products as allProducts } from '../../data/products'

export default function RelatedProducts({ currentProduct, onQuickView, relatedProducts = null }) {
  const [items, setItems] = useState(() => relatedProducts || [])

  useEffect(() => {
    if (relatedProducts) {
      setItems(relatedProducts)
      return
    }

    if (!currentProduct?.id) return

    let isMounted = true
    productApi
      .getRelatedProducts(currentProduct.id, 4)
      .then((prods) => {
        if (isMounted && Array.isArray(prods) && prods.length > 0) {
          setItems(prods)
        } else if (isMounted) {
          // Fallback to in-memory filter if backend returned 0
          const fallback = allProducts
            .filter(
              (p) =>
                p.id !== currentProduct.id &&
                (p.category === currentProduct.category ||
                  Math.abs(p.price - (currentProduct.price || 0)) < 2500)
            )
            .slice(0, 4)
          setItems(fallback)
        }
      })
      .catch(() => {
        if (isMounted) {
          const fallback = allProducts
            .filter((p) => p.id !== currentProduct.id)
            .slice(0, 4)
          setItems(fallback)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentProduct?.id, currentProduct?.category, currentProduct?.price, relatedProducts])

  if (!items || items.length === 0) return null

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
        {items.map((product) => (
          <div key={product.id}>
            <ProductCard
              product={product}
              onQuickView={onQuickView}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
