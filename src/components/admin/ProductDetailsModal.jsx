import { X, Layers, Shirt, Tag, Check, Package, Sparkles } from 'lucide-react'
import AdminStatusBadge from './AdminStatusBadge'

export default function ProductDetailsModal({ isOpen, onClose, product, onEdit }) {
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#103321]/10 text-[#103321] flex items-center justify-center">
              <Shirt className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif font-extrabold text-lg text-[#103321]">
                Product Details
              </h3>
              <span className="font-mono text-xs text-gray-400 font-bold">
                SKU: {product.sku}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Product Overview Row */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-full sm:w-44 h-52 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <AdminStatusBadge status={product.productStatus} type="order" />
              <AdminStatusBadge status={product.stockStatus} type="stock" />
              {product.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#95C623] text-[#103321]">
                  {product.badge}
                </span>
              )}
            </div>

            <h2 className="font-serif font-extrabold text-xl text-[#103321]">
              {product.name}
            </h2>
            {product.amharicName && (
              <p className="font-serif text-sm text-gray-500">{product.amharicName}</p>
            )}

            <div className="pt-2 flex items-baseline gap-3">
              <span className="font-serif font-extrabold text-2xl text-[#103321]">
                {product.price.toLocaleString()} ETB
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()} ETB
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-gray-600">
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase">Category</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {product.category?.replace('-', ' ')}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase">Total Stock</span>
                <span className="font-bold text-[#103321]">
                  {product.stockCount} units
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Fabric */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs text-gray-700 leading-relaxed">
          <p>
            <strong className="text-[#103321]">Artisan Details: </strong>
            {product.description || 'Authentic Ethiopian handcrafted attire.'}
          </p>
          {product.fabric && (
            <p>
              <strong className="text-[#103321]">Fabric: </strong>
              {product.fabric}
            </p>
          )}
        </div>

        {/* Variants Breakdown */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#103321] flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#95C623]" />
              <span>Available Product Variants ({product.variants.length})</span>
            </h4>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 text-gray-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3.5 py-2.5">SKU</th>
                    <th className="px-3.5 py-2.5">Size</th>
                    <th className="px-3.5 py-2.5">Color</th>
                    <th className="px-3.5 py-2.5">Stock</th>
                    <th className="px-3.5 py-2.5">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {product.variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-3.5 py-2.5 font-mono text-[11px] font-bold text-[#103321]">
                        {v.sku}
                      </td>
                      <td className="px-3.5 py-2.5">{v.size}</td>
                      <td className="px-3.5 py-2.5">{v.color}</td>
                      <td className="px-3.5 py-2.5 font-bold">
                        {v.stockQuantity}
                      </td>
                      <td className="px-3.5 py-2.5">
                        {v.price?.toLocaleString()} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gallery Image Previews */}
        {product.images && product.images.length > 1 && (
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-xs text-[#103321]">
              Photo Gallery ({product.images.length} photos)
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((imgUrl, idx) => (
                <div key={idx} className="w-16 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                  <img src={imgUrl} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              onEdit(product)
            }}
            className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#95C623] hover:text-[#103321] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Edit This Product
          </button>
        </div>
      </div>
    </div>
  )
}
