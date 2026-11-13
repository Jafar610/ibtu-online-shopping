import { X, Ruler } from 'lucide-react'

const SIZE_GUIDE = [
  { size: 'XS', bust: 82, waist: 66, length: 135, shoulder: 36 },
  { size: 'S',  bust: 86, waist: 70, length: 137, shoulder: 38 },
  { size: 'M',  bust: 90, waist: 74, length: 140, shoulder: 40 },
  { size: 'L',  bust: 96, waist: 80, length: 142, shoulder: 42 },
  { size: 'XL', bust: 102, waist: 86, length: 145, shoulder: 44 },
  { size: 'XXL',bust: 108, waist: 92, length: 148, shoulder: 46 },
]

export default function SizeGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#103321]">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#95C623]" />
            <span className="font-bold text-white">Size Guide</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* How to measure note */}
          <div className="bg-[#95C623]/10 border border-[#95C623]/30 rounded-xl p-3.5 mb-5">
            <p className="text-xs text-[#103321] font-semibold mb-1">How to Measure</p>
            <ul className="text-xs text-gray-600 space-y-1 leading-relaxed">
              <li>• <strong>Bust:</strong> Measure around the fullest part of your chest.</li>
              <li>• <strong>Waist:</strong> Measure around your natural waistline.</li>
              <li>• <strong>Length:</strong> From shoulder seam to hem.</li>
              <li>• <strong>Shoulder:</strong> Across the back from shoulder to shoulder.</li>
            </ul>
          </div>

          {/* Size table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-xs text-center">
              <thead>
                <tr className="bg-[#103321] text-white">
                  <th className="py-2.5 px-3 font-bold text-left">Size</th>
                  <th className="py-2.5 px-3 font-bold">Bust (cm)</th>
                  <th className="py-2.5 px-3 font-bold">Waist (cm)</th>
                  <th className="py-2.5 px-3 font-bold">Length (cm)</th>
                  <th className="py-2.5 px-3 font-bold">Shoulder (cm)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row, idx) => (
                  <tr
                    key={row.size}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="py-2.5 px-3 font-bold text-[#103321] text-left">{row.size}</td>
                    <td className="py-2.5 px-3 text-gray-700">{row.bust}</td>
                    <td className="py-2.5 px-3 text-gray-700">{row.waist}</td>
                    <td className="py-2.5 px-3 text-gray-700">{row.length}</td>
                    <td className="py-2.5 px-3 text-gray-700">{row.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
            * All measurements are in centimeters and are approximate. For custom fit, please contact us.
            Measurements may vary slightly per garment style.
          </p>
        </div>
      </div>
    </div>
  )
}

