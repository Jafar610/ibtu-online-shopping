import { Smartphone, Building2, Banknote, AlertCircle, Info, ShieldCheck } from 'lucide-react'
import { useCheckout } from '../../context/CheckoutContext'
import ReceiptUpload from './ReceiptUpload'

export default function PaymentInstructions() {
  const { paymentMethod } = useCheckout()

  return (
    <div className="space-y-5">
      {/* Dynamic Payment Method Guidance */}
      {paymentMethod === 'cod' && (
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#103321] text-[#95C623] flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#103321]">
                Cash on Delivery (COD) Instructions
              </h4>
              <p className="text-[11px] text-gray-500">Pay cash upon package doorstep arrival</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-600 leading-relaxed pt-1">
            <p>
              • <strong>Inspection on Delivery:</strong> You may open and inspect your packaged cultural attire in the presence of our courier before handing over payment.
            </p>
            <p>
              • <strong>Exact Change Appreciated:</strong> To ensure speedy delivery, please prepare the exact Birr amount indicated in your final order invoice.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong>Availability Note:</strong> Cash on Delivery is currently supported for Addis Ababa delivery zones. Real-time courier zone checks will be verified during backend integration.
            </span>
          </div>
        </div>
      )}

      {paymentMethod === 'telebirr' && (
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#103321] text-[#95C623] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#103321]">
                Telebirr Payment Guidance
              </h4>
              <p className="text-[11px] text-gray-500">Ethio Telecom Telebirr Mobile Money</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5 text-xs text-gray-700">
            <p className="font-bold text-[#103321]">How to complete payment via Telebirr:</p>
            <ol className="list-decimal pl-4 space-y-1 text-gray-600 text-[11px]">
              <li>Open your <strong>Telebirr App</strong> or dial <strong>*127#</strong>.</li>
              <li>Select <strong>Pay Merchant / Send Money</strong>.</li>
              <li>
                Official merchant account identifier:
                <span className="font-mono font-bold text-[#103321] ml-1 bg-white px-2 py-0.5 rounded border border-gray-200">
                  [IBTU-OFFICIAL-MERCHANT-CONFIG]
                </span>
              </li>
              <li>Enter your order total in ETB and your Order Number as the payment reference.</li>
              <li>Take a screenshot of the confirmed SMS or in-app receipt.</li>
            </ol>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong>Notice:</strong> Actual Telebirr Direct API payment gateway integration is awaiting backend connection. Please upload your transaction screenshot below for order review.
            </span>
          </div>

          <ReceiptUpload />
        </div>
      )}

      {paymentMethod === 'cbe_birr' && (
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#103321] text-[#95C623] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#103321]">
                CBE Birr Payment Guidance
              </h4>
              <p className="text-[11px] text-gray-500">Commercial Bank of Ethiopia Mobile Wallet</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5 text-xs text-gray-700">
            <p className="font-bold text-[#103321]">How to complete payment via CBE Birr:</p>
            <ol className="list-decimal pl-4 space-y-1 text-gray-600 text-[11px]">
              <li>Dial <strong>*847#</strong> or open the <strong>CBE Birr App</strong>.</li>
              <li>Select <strong>Pay Bill / Buy Goods</strong>.</li>
              <li>
                Official CBE Birr Shortcode:
                <span className="font-mono font-bold text-[#103321] ml-1 bg-white px-2 py-0.5 rounded border border-gray-200">
                  [CBE-BIRR-SHORTCODE-CONFIG]
                </span>
              </li>
              <li>Enter the order amount in ETB and confirm with your PIN.</li>
              <li>Save the CBE transaction confirmation SMS or receipt screenshot.</li>
            </ol>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong>Notice:</strong> Real CBE Birr merchant webhook integration is pending backend payment connectivity. Attach your payment screenshot below.
            </span>
          </div>

          <ReceiptUpload />
        </div>
      )}

      {paymentMethod === 'bank_transfer' && (
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#103321] text-[#95C623] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#103321]">
                Direct Bank Transfer Guidance
              </h4>
              <p className="text-[11px] text-gray-500">Commercial Bank of Ethiopia & Awash Bank</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5 text-xs text-gray-700">
            <p className="font-bold text-[#103321]">Bank Deposit / Mobile Banking Transfer:</p>
            <div className="space-y-1.5 text-[11px] text-gray-600">
              <p>
                <strong>Bank Name:</strong> Commercial Bank of Ethiopia (CBE) / Awash Bank
              </p>
              <p>
                <strong>Account Holder:</strong> IBTU Traditional & Modern Fashion Enterprise
              </p>
              <p>
                <strong>Account Details:</strong> Official verified business account details will be presented on your generated order invoice upon administrative review.
              </p>
              <p>
                <strong>Reference Note:</strong> Always include your customer name and order number as the transfer remark.
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong>Security Policy:</strong> Real bank account details must be configured by IBTU system administrators. Please attach your deposit slip or mobile banking receipt screenshot below.
            </span>
          </div>

          <ReceiptUpload />
        </div>
      )}
    </div>
  )
}
