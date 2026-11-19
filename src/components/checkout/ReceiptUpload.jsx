import { useState, useRef } from 'react'
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon, Info } from 'lucide-react'
import { useCheckout } from '../../context/CheckoutContext'

const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function ReceiptUpload() {
  const { receiptFile, setReceiptFile } = useCheckout()
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      setError('Please upload a valid image (JPEG, PNG, or WebP).')
      return
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller image.`)
      return
    }

    // Create object URL for frontend preview
    const previewUrl = URL.createObjectURL(file)
    setReceiptFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      previewUrl,
    })
  }

  const handleRemove = () => {
    if (receiptFile?.previewUrl) {
      URL.revokeObjectURL(receiptFile.previewUrl)
    }
    setReceiptFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
      <div>
        <h4 className="font-serif font-bold text-sm text-[#103321] flex items-center gap-1.5">
          <UploadCloud className="w-4 h-4 text-[#95C623]" />
          <span>Upload Payment Confirmation Screenshot / Receipt</span>
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          Attach your Telebirr, CBE Birr, or Bank transaction confirmation screenshot (Max 5MB • JPG, PNG, WebP).
        </p>
      </div>

      {receiptFile ? (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
              <img
                src={receiptFile.previewUrl}
                alt="Receipt Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">
                {receiptFile.name}
              </p>
              <p className="text-[11px] text-gray-400">{receiptFile.size}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ready for order review</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
            title="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="hidden"
            id="receipt-upload-input"
          />
          <label
            htmlFor="receipt-upload-input"
            className="border-2 border-dashed border-gray-200 hover:border-[#103321] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-gray-50/50 hover:bg-gray-50 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-[#103321]/10 text-[#103321] flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#103321]">
                Click to browse payment screenshot
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Supported formats: JPEG, JPG, PNG, WebP up to 5MB
              </p>
            </div>
          </label>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-600 flex items-center gap-1.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <span>
          <strong>Backend Integration Notice:</strong> Attached receipts will be securely stored and reviewed by the IBTU finance administration team upon real backend payment gateway deployment.
        </span>
      </div>
    </div>
  )
}
