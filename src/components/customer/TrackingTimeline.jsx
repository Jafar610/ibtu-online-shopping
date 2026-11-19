import { CheckCircle2, Circle, Clock, Truck, Package, XCircle, AlertCircle } from 'lucide-react'

export default function TrackingTimeline({ shipment, orderStatus }) {
  if (!shipment || !shipment.stages || shipment.stages.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-base text-[#103321]">
            Tracking Information Pending
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Your order is being carefully prepared by our Ethiopian artisans. Detailed courier tracking events will become available once the package is handed over to the courier.
          </p>
        </div>
      </div>
    )
  }

  const isCancelled = orderStatus?.toLowerCase() === 'cancelled' || shipment.shipmentStatus?.toLowerCase() === 'cancelled'

  if (isCancelled) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <XCircle className="w-6 h-6" />
        </div>
        <h4 className="font-serif font-bold text-base text-red-800">
          Order Cancelled
        </h4>
        <p className="text-xs text-red-600 max-w-sm mx-auto">
          This order was cancelled. Any authorized payments have been queued for refund to the original payment method.
        </p>
      </div>
    )
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
      {shipment.stages.map((stage, idx) => {
        const isCompleted = Boolean(stage.completed)
        const isCurrent = Boolean(stage.current)

        return (
          <div key={idx} className="relative flex items-start gap-4 group">
            {/* Stage Icon Node */}
            <div
              className={`absolute -left-[24px] sm:-left-[32px] w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ring-4 ring-white ${
                isCompleted
                  ? 'bg-[#103321] text-[#95C623]'
                  : isCurrent
                  ? 'bg-[#95C623] text-[#103321] animate-pulse ring-[#95C623]/30'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : isCurrent ? (
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Circle className="w-2.5 h-2.5 fill-current" />
              )}
            </div>

            {/* Stage Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4
                  className={`text-sm font-bold leading-tight ${
                    isCompleted || isCurrent ? 'text-[#103321]' : 'text-gray-400'
                  }`}
                >
                  {stage.label}
                  {isCurrent && (
                    <span className="ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#95C623] text-[#103321]">
                      Current Status
                    </span>
                  )}
                </h4>

                {stage.time && stage.time !== 'Pending' && (
                  <span className="text-[11px] text-gray-500 font-mono">
                    {stage.time}
                  </span>
                )}
              </div>

              {stage.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {stage.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
