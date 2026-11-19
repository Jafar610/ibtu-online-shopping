import { Smartphone, Building2, Banknote, CreditCard, Check, Lock } from 'lucide-react'
import { useCheckout } from '../../context/CheckoutContext'

const PAYMENT_METHODS = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    amharicName: 'ቴሌብር',
    badge: 'Popular Mobile Money',
    description: 'Instant mobile payment via Ethio Telecom Telebirr SuperApp or USSD *127#.',
    icon: Smartphone,
    enabled: true,
  },
  {
    id: 'cbe_birr',
    name: 'CBE Birr',
    amharicName: 'ሲቢኢ ብር',
    badge: 'Commercial Bank of Ethiopia',
    description: 'Pay quickly using CBE Birr mobile wallet or CBE Mobile Banking app.',
    icon: Building2,
    enabled: true,
  },
  {
    id: 'bank_transfer',
    name: 'Direct Bank Transfer',
    amharicName: 'የባንክ ሂሳብ ዝውውር',
    badge: 'Account Transfer',
    description: 'Direct transfer to IBTU official business accounts via CBE or Awash Bank.',
    icon: Building2,
    enabled: true,
  },
  {
    id: 'cod',
    name: 'Cash on Delivery (COD)',
    amharicName: 'እቃው ሲደርስ የሚከፈል',
    badge: 'Addis Ababa Deliveries',
    description: 'Pay cash directly to the courier upon doorstep receipt and product check.',
    icon: Banknote,
    enabled: true,
  },
  {
    id: 'card',
    name: 'Credit / Debit Card (Visa / Mastercard)',
    badge: 'Coming Soon',
    description: 'International card gateway integration will be available in future releases.',
    icon: CreditCard,
    enabled: false,
  },
]

export default function PaymentMethodSelector() {
  const { paymentMethod, setPaymentMethod } = useCheckout()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-base text-[#103321]">
          Select Payment Method
        </h3>
        <span className="text-xs text-gray-400">All transactions in ETB</span>
      </div>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = paymentMethod === method.id
          const isDisabled = !method.enabled
          const Icon = method.icon

          return (
            <div
              key={method.id}
              onClick={() => {
                if (!isDisabled) {
                  setPaymentMethod(method.id)
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all relative ${
                isDisabled
                  ? 'border-gray-200 bg-gray-50/70 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'border-[#95C623] bg-white ring-2 ring-[#95C623]/30 shadow-xs cursor-pointer'
                  : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isDisabled
                      ? 'border-gray-300 bg-gray-100'
                      : isSelected
                      ? 'border-[#103321] bg-[#103321] text-[#95C623]'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#95C623]" />}
                </div>

                {/* Method Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#103321]/10 text-[#103321] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-serif font-bold text-sm text-[#103321]">
                        {method.name}
                      </span>
                      {method.amharicName && (
                        <span className="text-xs text-gray-500 font-serif">
                          ({method.amharicName})
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDisabled
                          ? 'bg-gray-200 text-gray-600'
                          : isSelected
                          ? 'bg-[#103321] text-[#95C623]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {method.badge}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1 pl-9">
                    {method.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
