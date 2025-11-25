// Export utility functions
export const convertToCSV = (data) => {
  if (!data || data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = []
  
  // Add headers
  csvRows.push(headers.join(','))
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csvRows.push(values.join(','))
  })
  
  return csvRows.join('\n')
}

// Excel export with proper formatting
export const convertToExcel = async (data) => {
  try {
    // Dynamic import untuk xlsx library
    const XLSX = await import('xlsx')
    
    if (!data || data.length === 0) return null
    
    // Create workbook
    const workbook = XLSX.utils.book_new()
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)
    
    // Set column widths
    const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(key.length, 15) // Minimum width 15
    }))
    worksheet['!cols'] = colWidths
    
    // Add borders and styling
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    
    // Style for headers (first row)
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellAddress]) continue
      
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "F0F0F0" } },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" }
        },
        alignment: { horizontal: "center", vertical: "center" }
      }
    }
    
    // Style for data rows
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        if (!worksheet[cellAddress]) continue
        
        worksheet[cellAddress].s = {
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
          },
          alignment: { vertical: "center" }
        }
      }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    
    return excelBuffer
  } catch (error) {
    console.error('Error creating Excel file:', error)
    throw error
  }
}

// Fallback Excel export (CSV with Excel extension)
export const convertToExcelFallback = (data) => {
  console.warn('xlsx library not available, using CSV fallback for Excel export')
  return convertToCSV(data)
}

export const downloadFile = (content, mimeType, filename) => {
  const blob = new Blob([content], { type: mimeType })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Download Excel file with proper formatting
export const downloadExcelFile = (excelBuffer, filename) => {
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const prepareExportData = (data, columns, selectedColumns) => {
  return data.map(item => {
    const row = {}
    selectedColumns.forEach(colKey => {
      const column = columns.find(c => c.key === colKey)
      if (column) {
        let value = item[colKey]
        let handled = false

        // Try to use render function first if available and returns primitive
        if (column.render) {
          try {
            const rendered = column.render(value, item)
            // Check if rendered is primitive (string, number, boolean)
            if (rendered !== null && typeof rendered !== 'object' && typeof rendered !== 'function') {
              value = rendered
              handled = true
            }
          } catch (e) {
            // ignore error, fallback to default
          }
        }
        
        if (!handled) {
          // Format data based on column type
          if (column.type === 'date' || column.type === 'dateRange') {
            if (!value) {
              value = '-'
            } else {
              // Format tanggal untuk Excel: DD/MM/YYYY
              const date = new Date(value)
              if (!isNaN(date.getTime())) {
                // Format: DD/MM/YYYY untuk Excel
                const day = String(date.getDate()).padStart(2, '0')
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const year = date.getFullYear()
                value = `${day}/${month}/${year}`
              }
            }
          } else if (column.type === 'badge') {
            value = value // Keep original value for badges
          }
        }
        
        row[column.title] = value
      }
    })
    return row
  })
}

export const exportData = async (data, columns, selectedColumns, format, filename) => {
  try {
    // Prepare data based on selected columns
    const preparedData = prepareExportData(data, columns, selectedColumns)
    
    if (format === 'csv') {
      const csvContent = convertToCSV(preparedData)
      downloadFile(csvContent, 'text/csv', `${filename}.csv`)
    } else if (format === 'excel') {
      try {
        // Try to use proper Excel export with formatting
        const excelBuffer = await convertToExcel(preparedData)
        if (excelBuffer) {
          downloadExcelFile(excelBuffer, `${filename}.xlsx`)
        } else {
          throw new Error('Failed to create Excel file')
        }
      } catch (excelError) {
        console.warn('Excel library not available, falling back to CSV format')
        // Fallback to CSV with Excel extension
        const csvContent = convertToExcelFallback(preparedData)
        downloadFile(csvContent, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', `${filename}.xls`)
      }
    }
    
    return true
  } catch (error) {
    console.error('Error exporting data:', error)
    throw error
  }
}
