import dayjs from 'dayjs'
import Logo from '@/assets/stelk_mks.png'

const logoSrc = typeof Logo === 'string' ? Logo : (Logo?.src || '')

const DOC = {
  sekolah: 'SMK TELKOM MAKASSAR',
  alamat: 'Jl. AP. Pettarani No. 4, Gunung Sari, Makassar 90221',
  judul: 'KARTU INVENTARIS RUANGAN',
}

const PAGE_WIDTH = 734

const COLS = [
  { key: 'no', title: 'No', width: 28, align: 'center' },
  { key: 'nama', title: 'Nama/Jenis Barang', width: 126, align: 'left' },
  { key: 'merk', title: 'Merk/Model', width: 70, align: 'left' },
  { key: 'seri', title: 'No. Seri Pabrik', width: 68, align: 'left' },
  { key: 'spec', title: 'Spesifikasi', width: 104, align: 'left' },
  { key: 'tahun', title: 'Tahun Perolehan', width: 50, align: 'center' },
  { key: 'kode', title: 'Kode Barang', width: 76, align: 'left' },
  { key: 'satuan', title: 'Satuan', width: 40, align: 'center' },
  { key: 'kondisi', title: 'Kondisi Barang', width: 70, align: 'center' },
  { key: 'asal', title: 'Asal-Usul', width: 52, align: 'left' },
  { key: 'ket', title: 'Keterangan', width: 50, align: 'left' },
]

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function tahunPerolehan(value) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY') : '-'
}

function kondisiLabel(value) {
  const text = String(value || 'baik').trim()
  if (!text) return 'Baik'
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function joinParts(parts) {
  return parts.map((part) => String(part ?? '').trim()).filter(Boolean).join(' / ')
}

function cellStyle(width, align, extra = '') {
  return [
    'box-sizing:border-box',
    `width:${width}px`,
    `max-width:${width}px`,
    `text-align:${align}`,
    'border:0.5px solid #B0B0B0',
    'padding:6px 6px',
    'vertical-align:top',
    'word-wrap:break-word',
    'word-break:break-word',
    'white-space:normal',
    'line-height:1.25',
    'font-family:Calibri,Arial,sans-serif',
    extra,
  ].join(';')
}

function rowValues(item, index) {
  return {
    no: String(index + 1),
    nama: item.desc || '-',
    merk: joinParts([item.merk, item.type]) || '-',
    seri: item.noseri || '-',
    spec: item.spec || '-',
    tahun: tahunPerolehan(item.tgl),
    kode: item.kode_ypt ? `${item.kode || '-'}\nYPT: ${item.kode_ypt}` : (item.kode || '-'),
    satuan: item.satuan || '-',
    kondisi: kondisiLabel(item.kondisi),
    asal: item.sumber || '-',
    ket: joinParts([item.kategori, item.color]) || '-',
  }
}

function headerHtml() {
  return COLS.map((col) => (
    `<th style="${cellStyle(col.width, 'center', 'background:#D9D9D9;font-weight:700;font-size:8px;')}">${esc(col.title)}</th>`
  )).join('')
}

function bodyRowsHtml(items) {
  if (!items.length) {
    return `<tr data-kir-row="1"><td colspan="11" style="${cellStyle(PAGE_WIDTH, 'center', 'background:#FFFFFF;font-size:9px;')}">Tidak ada barang pada ruangan ini</td></tr>`
  }
  return items.map((item, index) => {
    const values = rowValues(item, index)
    const bg = index % 2 === 1 ? 'background:#F2F2F2;' : 'background:#FFFFFF;'
    const cells = COLS.map((col) => (
      `<td style="${cellStyle(col.width, col.align, `${bg}font-size:8px;font-weight:400;`)}">${esc(values[col.key]).replace(/\n/g, '<br>')}</td>`
    )).join('')
    return `<tr data-kir-row="1">${cells}</tr>`
  }).join('')
}

function introHtml(ruangan, count) {
  const meta = 'border:none;background:transparent;padding:2px 8px 2px 0;font-size:11px;font-family:Calibri,Arial,sans-serif;vertical-align:top;'
  return `
    <div data-kir-intro="1">
      <div style="display:flex;align-items:center;margin:0 0 8px;">
        <img src="${logoSrc}" alt="SMK Telkom Makassar" width="78" style="width:78px;height:auto;display:block;" />
        <div style="flex:1;text-align:center;padding-right:78px;">
          <div style="font-weight:700;font-size:16px;margin:0 0 2px;">${DOC.judul}</div>
          <div style="font-size:11px;margin:0;">${DOC.sekolah}</div>
          <div style="font-size:10px;margin:0;">${DOC.alamat}</div>
        </div>
      </div>
      <table style="width:${PAGE_WIDTH}px;border-collapse:collapse;margin:0 0 10px;">
        <tr>
          <td style="${meta}"><b>Gedung</b> : ${esc(ruangan.gedung)}</td>
          <td style="${meta}"><b>Tanggal cetak</b> : ${dayjs().format('DD-MM-YYYY')}</td>
        </tr>
        <tr>
          <td style="${meta}"><b>Ruangan</b> : ${esc(ruangan.ruangan)}</td>
          <td style="${meta}"><b>Jumlah barang</b> : ${count}</td>
        </tr>
      </table>
    </div>
  `
}

function tableHtml(head, rows) {
  return `
    <table data-kir-table="1" style="width:${PAGE_WIDTH}px;border-collapse:collapse;table-layout:fixed;">
      <thead><tr>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

function buildHtml(ruangan, items) {
  return `
    <div style="width:${PAGE_WIDTH}px;background:#ffffff;color:#000000;font-family:Calibri,Arial,sans-serif;">
      ${introHtml(ruangan, items.length)}
      ${tableHtml(headerHtml(), bodyRowsHtml(items))}
    </div>
  `
}

// Tinggi isi A4 portrait setelah margin, dalam piksel layout tabel.
const PAGE_CONTENT_PX = Math.floor(PAGE_WIDTH * ((297 - 16) / (210 - 12))) - 24

function paginateHost(host, ruangan, items) {
  const intro = host.querySelector('[data-kir-intro]')
  const head = host.querySelector('thead tr')
  const rows = [...host.querySelectorAll('[data-kir-row]')]
  if (!intro || !head || rows.length === 0) return

  const introHeight = intro.getBoundingClientRect().height
  const headHeight = head.getBoundingClientRect().height
  const pages = []
  let bucket = []
  let used = introHeight + headHeight

  rows.forEach((row) => {
    const height = row.getBoundingClientRect().height
    if (bucket.length > 0 && used + height > PAGE_CONTENT_PX) {
      pages.push(bucket)
      bucket = []
      used = headHeight
    }
    bucket.push(row.outerHTML)
    used += height
  })
  if (bucket.length) pages.push(bucket)
  if (pages.length <= 1) return

  const headHtml = headerHtml()
  host.innerHTML = pages.map((pageRows, index) => `
    <div style="width:${PAGE_WIDTH}px;background:#ffffff;color:#000000;font-family:Calibri,Arial,sans-serif;${index > 0 ? 'break-before:page;page-break-before:always;' : ''}">
      ${index === 0 ? introHtml(ruangan, items.length) : ''}
      ${tableHtml(headHtml, pageRows.join(''))}
    </div>
  `).join('')
}

/**
 * Unduh Kartu Inventaris Ruangan (PDF) ukuran A4 portrait.
 * @param {{ ruangan: object, items: Array }} payload
 */
export async function downloadKirPdf({ ruangan, items = [] }) {
  const html2pdf = (await import('html2pdf.js')).default
  const safeName = String(ruangan?.ruangan || 'ruangan')
    .replace(/[^\w\-]+/g, '_')
    .slice(0, 40)
  const filename = `KIR_${safeName}_${dayjs().format('YYYYMMDD')}.pdf`
  const host = document.createElement('div')
  host.style.width = `${PAGE_WIDTH}px`
  host.style.background = '#ffffff'
  host.style.color = '#000000'
  host.innerHTML = buildHtml(ruangan, items)
  document.body.appendChild(host)

  try {
    const image = host.querySelector('img')
    if (image && !image.complete) {
      await new Promise((resolve) => {
        image.onload = resolve
        image.onerror = resolve
      })
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
    paginateHost(host, ruangan, items)
    await html2pdf()
      .set({
        filename,
        margin: [8, 6, 8, 6],
        pagebreak: { mode: ['css', 'legacy'], avoid: ['tr'] },
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
          logging: false,
          backgroundColor: '#ffffff',
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(host)
      .save()
  } finally {
    if (host.parentNode) host.remove()
  }
}
