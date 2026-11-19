import { Check, ShoppingBag, MapPin, CreditCard, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const STEPS = [
  { id: 'cart', label: 'Cart', path: '/cart', icon: ShoppingBag, stepNum: 1 },
  { id: 'shipping', label: 'Shipping', path: '/checkout', icon: MapPin, stepNum: 2 },
  { id: 'payment', label: 'Payment', path: '/checkout/payment', icon: CreditCard, stepNum: 3 },
  { id: 'confirmation', label: 'Confirmation', icon: CheckCircle2, stepNum: 4 },
]

export default function CheckoutProgress({ currentStep = 'shipping' }) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="w-full bg-white border-b border-gray-100 py-4 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-0" />
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#95C623] transition-all duration-300 -z-0"
            style={{
              width: `${(currentIdx / (STEPS.length - 1)) * 100}%`,
            }}
          />

          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIdx
            const isCurrent = idx === currentIdx
            const isUpcoming = idx > currentIdx
            const Icon = step.icon

            const stepNode = (
              <div className="flex flex-col items-center group relative z-10">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xs ring-4 ring-white ${
                    isCompleted
                      ? 'bg-[#103321] text-[#95C623]'
                      : isCurrent
                      ? 'bg-[#95C623] text-[#103321] ring-[#95C623]/30 font-bold scale-105'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  )}
                </div>

                <span
                  className={`mt-1.5 text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap ${
                    isCompleted
                      ? 'text-[#103321]'
                      : isCurrent
                      ? 'text-[#103321] font-extrabold'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )

            // Make completed steps clickable links if path exists and not confirmation
            if (isCompleted && step.path) {
              return (
                <Link
                  key={step.id}
                  to={step.path}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  title={`Return to ${step.label}`}
                >
                  {stepNode}
                </Link>
              )
            }

            return <div key={step.id}>{stepNode}</div>
          })}
        </div>
      </div>
    </div>
  )
}
