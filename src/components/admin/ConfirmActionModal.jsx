import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ConfirmActionModal({
  isOpen,
  title = 'Confirm Action',
  description,
  warning,
  note,
  actionType = 'primary', // 'primary' | 'danger' | 'warning' | 'success'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireInput = false,
  inputLabel = 'Reason / Note',
  inputPlaceholder = 'Please enter a reason...',
  inputRequired = false,
  onConfirm,
  onCancel,
}) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (requireInput && inputRequired && !inputValue.trim()) {
      setError('This field is required before proceeding.')
      return
    }
    onConfirm?.(inputValue.trim())
  }

  const iconVariants = {
    danger: {
      icon: AlertTriangle,
      wrapClass: 'bg-rose-50 text-rose-600',
      btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
      icon: AlertTriangle,
      wrapClass: 'bg-amber-50 text-amber-600',
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    success: {
      icon: CheckCircle,
      wrapClass: 'bg-emerald-50 text-emerald-600',
      btnClass: 'bg-[#103321] hover:bg-[#103321]/90 text-white',
    },
    primary: {
      icon: Info,
      wrapClass: 'bg-blue-50 text-blue-600',
      btnClass: 'bg-[#103321] hover:bg-[#103321]/90 text-white',
    },
  }

  const currentVariant = iconVariants[actionType] || iconVariants.primary
  const IconComponent = currentVariant.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 p-6 sm:p-7 space-y-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${currentVariant.wrapClass}`}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="font-serif font-bold text-lg text-[#103321]">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-gray-600 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {warning && (
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold">Important Notice: </strong>
            <span>{warning}</span>
          </div>
        )}

        {requireInput && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              {inputLabel}{' '}
              {inputRequired && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              rows={3}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                if (error) setError('')
              }}
              placeholder={inputPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#95C623] focus:ring-2 focus:ring-[#95C623]/20 text-xs text-[#1A1A1A] outline-none resize-none transition-all"
            />
            {error && (
              <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>
        )}

        {note && (
          <p className="text-[11px] text-gray-400 italic">
            {note}
          </p>
        )}

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${currentVariant.btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
