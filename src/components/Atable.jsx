'use client';

/**
 * Reusable Modern Table Component
 * 
 * @param {Array} columns - Array of column definitions
 * @param {string} columns[].key - Unique key for column
 * @param {string} columns[].title - Column header title
 * @param {string} columns[].dataKey - Key to access data in row object (default: same as key)
 * @param {function} columns[].render - Custom render function (value, row) => ReactNode
 * @param {string} columns[].align - Text alignment: 'left', 'center', 'right' (default: 'left')
 * @param {boolean} columns[].wrap - Allow text wrapping (default: false)
 * @param {string} columns[].width - Column width (e.g., '200px', '20%')
 * 
 * @param {Array} data - Array of row data objects
 * @param {string} keyField - Field name to use as unique key for rows (default: 'id')
 * @param {boolean} striped - Alternate row colors (default: true)
 * @param {boolean} hover - Show hover effect on rows (default: true)
 * @param {string} className - Additional CSS classes for table wrapper
 * @param {string} emptyText - Text to show when data is empty (default: 'Tidak ada data')
 * 
 * @example
 * <ATable
 *   columns={[
 *     { key: 'name', title: 'Nama', dataKey: 'name' },
 *     { key: 'email', title: 'Email', dataKey: 'email' },
 *     { key: 'status', title: 'Status', render: (value) => <Badge>{value}</Badge> }
 *   ]}
 *   data={users}
 * />
 */
export default function ATable({
  columns = [],
  data = [],
  keyField = 'id',
  striped = true,
  hover = true,
  className = '',
  emptyText = 'Tidak ada data'
}) {
  // Pastikan data selalu array
  const tableData = Array.isArray(data) ? data : [];
  const hasData = tableData && tableData.length > 0;

  if (!columns || columns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Kolom tabel belum didefinisikan
      </div>
    );
  }

  const getCellValue = (row, column) => {
    const dataKey = column.dataKey || column.key;
    return row[dataKey];
  };

  const getAlignment = (align) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b-2 border-gray-300 dark:border-gray-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider
                    border-r border-gray-200 dark:border-gray-600 last:border-r-0
                    ${getAlignment(column.align)}
                  `}
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {hasData ? (
              tableData.map((row, rowIndex) => {
                const rowKey = row[keyField] || rowIndex;
                const isEven = striped && rowIndex % 2 === 0;
                
                return (
                  <tr
                    key={rowKey}
                    className={`
                      transition-colors duration-150
                      ${isEven ? 'bg-gray-50/50 dark:bg-gray-700/30' : 'bg-white dark:bg-gray-800'}
                      ${hover ? 'hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer' : ''}
                    `}
                  >
                    {columns.map((column) => {
                      const value = getCellValue(row, column);
                      const cellContent = column.render 
                        ? column.render(value, row, rowIndex)
                        : (value !== null && value !== undefined ? String(value) : '-');
                      
                      return (
                        <td
                          key={column.key}
                          className={`
                            px-6 py-2 text-sm text-gray-900 dark:text-gray-100
                            border-r border-gray-200 dark:border-gray-700 last:border-r-0
                            ${getAlignment(column.align)}
                            ${column.wrap ? 'whitespace-normal break-words' : 'whitespace-nowrap'}
                          `}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td 
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 border-r-0"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

