import { CheckCircle2, Clock, Truck, Package, XCircle, MapPin, AlertCircle } from 'lucide-react'

export default function ShipmentTimeline({ stages = [], shipmentStatus }) {
  if (!stages || stages.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-2xl text-center text-xs text-gray-500">
        No tracking stages recorded for this shipment.
      </div>
    )
  }

  const getStageIcon = (key, completed, isCancelled) => {
    if (isCancelled) return <XCircle className="w-4 h-4 text-rose-600" />
    if (completed) return <CheckCircle2 className="w-4 h-4 text-[#95C623]" />
    switch (key) {
      case 'processing':
        return <Package className="w-4 h-4 text-amber-500" />
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="w-4 h-4 text-blue-500" />
      case 'delivered':
        return <MapPin className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
      {stages.map((stage, idx) => {
        const isCurrent = Boolean(stage.current)
        const isCompleted = Boolean(stage.completed)
        const isCancelled = Boolean(stage.isCancelled)

        return (
          <div key={stage.key || idx} className="relative flex items-start gap-4 group">
            {/* Stage Icon Dot */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isCancelled
                  ? 'bg-rose-100 ring-4 ring-rose-50 text-rose-600'
                  : isCompleted
                  ? 'bg-[#103321] ring-4 ring-[#95C623]/20 text-[#95C623]'
                  : isCurrent
                  ? 'bg-amber-100 ring-4 ring-amber-50 text-amber-600 animate-pulse'
                  : 'bg-gray-100 text-gray-400 ring-4 ring-white'
              }`}
            >
              {getStageIcon(stage.key, isCompleted, isCancelled)}
            </div>

            {/* Stage Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-bold ${
                    isCancelled
                      ? 'text-rose-600'
                      : isCompleted || isCurrent
                      ? 'text-[#103321]'
                      : 'text-gray-400'
                  }`}
                >
                  {stage.label}
                </span>

                {isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                    Current Milestone
                  </span>
                )}
              </div>

              <span className="text-[11px] text-gray-500 block mt-0.5">
                {stage.time || 'Pending update'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
