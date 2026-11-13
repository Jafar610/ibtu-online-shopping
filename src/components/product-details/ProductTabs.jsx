import { useState } from 'react'
import { Truck, RotateCcw, Shield, Shirt } from 'lucide-react'

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'specs', label: 'Specifications' },
  { id: 'shipping', label: 'Shipping & Returns' },
]

export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description')

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-5 py-3.5 text-xs font-bold transition-all duration-200 cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? 'border-[#95C623] text-[#103321] bg-[#95C623]/5'
                : 'border-transparent text-gray-500 hover:text-[#103321] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-6">
        {activeTab === 'description' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Shirt className="w-4 h-4 text-[#95C623]" />
                  <span className="text-xs font-bold text-[#103321]">Fabric & Material</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{product.fabric}</p>
              </div>
              <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-[#95C623]" />
                  <span className="text-xs font-bold text-[#103321]">Care Instructions</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Hand wash in cold water</li>
                  <li>• Do not bleach</li>
                  <li>• Iron on low heat</li>
                  <li>• Dry in shade</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#103321]/5 rounded-xl p-4 border border-[#103321]/10">
              <p className="text-xs font-bold text-[#103321] mb-1">Styling Suggestion</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                This piece pairs beautifully with traditional jewelry and accessories for cultural events.
                For a modern look, combine with contemporary accessories to create a fusion style that
                celebrates Ethiopian heritage while embracing modern fashion sensibilities.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-3">
            {[
              { label: 'Material', value: product.fabric },
              { label: 'Available Sizes', value: product.sizes?.join(', ') || 'One Size' },
              { label: 'Available Colors', value: product.colors?.join(', ') || 'As shown' },
              { label: 'Category', value: product.category?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) },
              { label: 'Product Code', value: product.id?.toUpperCase() },
              { label: 'Weight', value: 'Approx. 300–500g' },
              { label: 'Origin', value: 'Handcrafted in Ethiopia 🇪🇹' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-xs font-bold text-gray-500 w-32 shrink-0">{label}</span>
                <span className="text-xs text-gray-800 font-medium flex-1">{value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 bg-[#95C623]/10 rounded-xl border border-[#95C623]/20">
              <Truck className="w-5 h-5 text-[#95C623] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#103321] mb-1">Delivery Information</p>
                <ul className="text-xs text-gray-600 space-y-1 leading-relaxed">
                  <li>• <strong>Addis Ababa:</strong> 1–3 business days</li>
                  <li>• <strong>Other Ethiopian cities:</strong> 3–7 business days</li>
                  <li>• <strong>International:</strong> 10–21 business days (where available)</li>
                  <li>• Free shipping on orders over 2,000 ETB</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <RotateCcw className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#103321] mb-1">Returns & Exchanges</p>
                <ul className="text-xs text-gray-600 space-y-1 leading-relaxed">
                  <li>• 7-day return window from delivery date</li>
                  <li>• Items must be unworn and in original condition</li>
                  <li>• Custom-fit orders cannot be returned</li>
                  <li>• Contact support to initiate a return</li>
                </ul>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed">
              * Delivery times are estimates and may vary. ibtu is not responsible for delays caused
              by customs or external factors. All policies are subject to update — please review our
              latest terms on the website.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

