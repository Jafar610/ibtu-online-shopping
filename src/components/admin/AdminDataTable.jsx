import AdminEmptyState from './AdminEmptyState'

export default function AdminDataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'No records match the current criteria.',
  rowKey = 'id',
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-100 rounded-md w-1/4" />
          <div className="h-10 bg-gray-50 rounded-md w-full" />
          <div className="h-10 bg-gray-50 rounded-md w-full" />
          <div className="h-10 bg-gray-50 rounded-md w-full" />
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <AdminEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#103321]/5 text-[#103321] border-b border-gray-100 uppercase font-bold text-[10px] tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-5 py-3.5 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {data.map((row, rIdx) => {
              const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey] || rIdx

              return (
                <tr
                  key={key}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-5 py-3.5 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(row, rIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
