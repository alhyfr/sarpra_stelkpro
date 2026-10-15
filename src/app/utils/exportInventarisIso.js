'use client'

import dayjs from 'dayjs'

const DOC = {
  noDokumen: 'STM-SARPRA-FM-006',
  noRevisi: '00',
  tanggalBerlaku: '1 Oktober 2021',
  lembaga: 'SMK Telkom Makassar',
  sekolah: 'SMK TELKOM MAKASSAR',
  alamat: 'Jl. AP. Pettarani No. 4, Gunung Sari, Makassar 90221',
  judul: 'FORMULIR DATA INVENTARIS BARANG',
}

const HEADERS = [
  'No',
  'Kode Barang',
  'Deskripsi Barang',
  'Spesifikasi',
  'Gedung',
  'Ruang',
  'No Seri',
  'Merk',
  'Type',
  'Warna',
  'Jumlah Barang',
  'Satuan',
  'Harga Satuan',
  'Harga Total',
  'Tanggal Perolehan',
  'Sumber Dana',
]

const thinBorder = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } },
}

const mediumBorder = {
  top: { style: 'medium', color: { argb: 'FF000000' } },
  left: { style: 'medium', color: { argb: 'FF000000' } },
  bottom: { style: 'medium', color: { argb: 'FF000000' } },
  right: { style: 'medium', color: { argb: 'FF000000' } },
}

function applyBorderRange(ws, startRow, endRow, startCol, endCol, border = thinBorder) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      ws.getCell(r, c).border = border
    }
  }
}

/**
 * Export inventaris ke Excel format ISO (STM-SARPRA-FM-006)
 * @param {Array} rows
 * @param {{ tahun?: string|number, filename?: string, logoUrl?: string }} options
 */
export async function exportInventarisIso(rows = [], options = {}) {
  // Build browser-friendly (hindari modul Node fs/stream)
  const ExcelJSMod = await import('exceljs/dist/exceljs.min.js')
  const ExcelJS = ExcelJSMod.default || ExcelJSMod
  const tahun = options.tahun || dayjs().format('YYYY')
  const filename =
    options.filename ||
    `formulir_inventaris_iso_${tahun}_${dayjs().format('YYYYMMDD')}`

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SIP Stelkpro'
  workbook.created = new Date()

  const ws = workbook.addWorksheet('Formulir Inventaris', {
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
    },
    views: [{ showGridLines: false }],
  })

  const widths = [5, 14, 22, 18, 12, 12, 14, 12, 12, 10, 10, 8, 14, 14, 14, 14]
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w
  })

  // ===== HEADER (rows 1-3) =====
  ws.mergeCells('A1:B3')
  ws.mergeCells('C1:L1')
  ws.mergeCells('C2:L2')
  ws.mergeCells('C3:L3')
  ws.mergeCells('M1:N1')
  ws.mergeCells('O1:P1')
  ws.mergeCells('M2:N2')
  ws.mergeCells('O2:P2')
  ws.mergeCells('M3:N3')
  ws.mergeCells('O3:P3')

  ws.getCell('C1').value = DOC.sekolah
  ws.getCell('C1').font = { bold: true, size: 14, name: 'Arial' }
  ws.getCell('C1').alignment = { horizontal: 'center', vertical: 'middle' }

  ws.getCell('C2').value = DOC.alamat
  ws.getCell('C2').font = { size: 9, name: 'Arial' }
  ws.getCell('C2').alignment = { horizontal: 'center', vertical: 'middle' }

  ws.getCell('C3').value = DOC.judul
  ws.getCell('C3').font = { bold: true, size: 12, name: 'Arial' }
  ws.getCell('C3').alignment = { horizontal: 'center', vertical: 'middle' }

  ws.getCell('M1').value = 'No. Dokumen'
  ws.getCell('O1').value = DOC.noDokumen
  ws.getCell('M2').value = 'No. Revisi'
  ws.getCell('O2').value = DOC.noRevisi
  ws.getCell('M3').value = 'Tanggal Berlaku'
  ws.getCell('O3').value = DOC.tanggalBerlaku

  ;['M1', 'M2', 'M3', 'O1', 'O2', 'O3'].forEach((addr) => {
    const cell = ws.getCell(addr)
    cell.font = { size: 9, name: 'Arial' }
    cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  })

  ws.getRow(1).height = 18
  ws.getRow(2).height = 18
  ws.getRow(3).height = 22
  applyBorderRange(ws, 1, 3, 1, 16, mediumBorder)

  // Logo
  try {
    const candidates = [options.logoUrl, '/ts.png'].filter(Boolean)
    let logoBuffer = null
    for (const url of candidates) {
      try {
        const res = await fetch(url)
        if (res.ok) {
          logoBuffer = await res.arrayBuffer()
          break
        }
      } catch {
        /* next */
      }
    }
    if (logoBuffer) {
      const imageId = workbook.addImage({
        buffer: logoBuffer,
        extension: 'png',
      })
      ws.addImage(imageId, {
        tl: { col: 0.25, row: 0.25 },
        ext: { width: 72, height: 50 },
      })
    }
  } catch (e) {
    console.warn('Logo ISO export tidak dimuat:', e)
  }

  // ===== META =====
  ws.getRow(4).height = 8
  ws.getCell('A5').value = 'LEMBAGA'
  ws.getCell('B5').value = ':'
  ws.mergeCells('C5:F5')
  ws.getCell('C5').value = DOC.lembaga

  ws.getCell('A6').value = 'TAHUN'
  ws.getCell('B6').value = ':'
  ws.mergeCells('C6:F6')
  ws.getCell('C6').value = String(tahun)

  ;['A5', 'A6'].forEach((addr) => {
    ws.getCell(addr).font = { size: 10, name: 'Arial', bold: true }
  })
  ;['B5', 'B6', 'C5', 'C6'].forEach((addr) => {
    ws.getCell(addr).font = { size: 10, name: 'Arial' }
  })

  // ===== TABLE HEADER =====
  const headerRow = 8
  HEADERS.forEach((title, i) => {
    const cell = ws.getCell(headerRow, i + 1)
    cell.value = title
    cell.font = { bold: true, size: 9, name: 'Arial' }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    }
    cell.border = thinBorder
  })
  ws.getRow(headerRow).height = 32

  // ===== DATA =====
  const list = Array.isArray(rows) ? rows : []
  list.forEach((item, index) => {
    const r = headerRow + 1 + index
    const qty = Number(item.jml) || 0
    const harga = Number(item.harga) || 0
    const total = qty * harga

    const values = [
      index + 1,
      item.kode || '',
      item.desc || '',
      item.spec || '',
      item.gedung || '',
      item.ruang || '',
      item.noseri || '',
      item.merk || '',
      item.type || '',
      item.color || '',
      qty,
      item.satuan || '',
      harga,
      total,
      item.tgl ? dayjs(item.tgl).format('DD-MM-YYYY') : '',
      item.sumber || '',
    ]

    values.forEach((val, i) => {
      const cell = ws.getCell(r, i + 1)
      cell.value = val
      cell.font = { size: 8, name: 'Arial' }
      cell.border = thinBorder
      cell.alignment = {
        vertical: 'middle',
        wrapText: true,
        horizontal:
          i === 0 || i === 10 || i === 11
            ? 'center'
            : i === 12 || i === 13
              ? 'right'
              : 'left',
      }
      if (i === 12 || i === 13) cell.numFmt = '#,##0'
    })
  })

  const lastDataRow = headerRow + Math.max(list.length, 1)
  if (list.length === 0) {
    for (let c = 1; c <= 16; c++) {
      ws.getCell(headerRow + 1, c).border = thinBorder
    }
  }

  // ===== FOOTER =====
  const footerStart = lastDataRow + 3
  ws.mergeCells(`L${footerStart}:P${footerStart}`)
  ws.getCell(`L${footerStart}`).value = 'Makassar, .....................'
  ws.getCell(`L${footerStart}`).font = { size: 10, name: 'Arial' }
  ws.getCell(`L${footerStart}`).alignment = { horizontal: 'center' }

  const signRow = footerStart + 1
  ws.mergeCells(`A${signRow}:D${signRow}`)
  ws.getCell(`A${signRow}`).value = 'Mengetahui'
  ws.getCell(`A${signRow}`).font = { size: 10, name: 'Arial' }
  ws.getCell(`A${signRow}`).alignment = { horizontal: 'center' }

  ws.mergeCells(`L${signRow}:P${signRow}`)
  ws.getCell(`L${signRow}`).value = 'Pelapor'
  ws.getCell(`L${signRow}`).font = { size: 10, name: 'Arial' }
  ws.getCell(`L${signRow}`).alignment = { horizontal: 'center' }

  const nameRow = signRow + 5
  ws.mergeCells(`A${nameRow}:D${nameRow}`)
  ws.getCell(`A${nameRow}`).value = 'Kepala SMK Telkom Makassar'
  ws.getCell(`A${nameRow}`).font = { size: 10, name: 'Arial', bold: true }
  ws.getCell(`A${nameRow}`).alignment = { horizontal: 'center' }

  ws.mergeCells(`L${nameRow}:P${nameRow}`)
  ws.getCell(`L${nameRow}`).value = 'Waka Sarpra'
  ws.getCell(`L${nameRow}`).font = { size: 10, name: 'Arial', bold: true }
  ws.getCell(`L${nameRow}`).alignment = { horizontal: 'center' }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return true
}

export default exportInventarisIso
