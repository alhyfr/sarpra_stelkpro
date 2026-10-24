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

function tanggalPanjang(value = dayjs()) {
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const date = dayjs(value)
  return `${date.date()} ${bulan[date.month()]} ${date.year()}`
}

function signSlot(person = {}) {
  const nama = esc(String(person.nama || '').trim())
  const nip = esc(String(person.nip || '').trim())
  const nameBlock = nama
    ? `<div style="min-height:52px;padding-top:28px;"><div style="width:220px;margin:0 auto;text-align:center;line-height:1.2;">${nama}</div></div>`
    : '<div style="height:52px;"></div>'
  return `
    ${nameBlock}
    <div style="width:220px;margin:0 auto;text-align:left;line-height:1;">
      <div style="height:1px;background:#000000;font-size:0;line-height:0;"></div>
      <div style="margin:0;padding:1px 0 0;line-height:1.15;text-align:left;">NIP.${nip ? ` ${nip}` : ''}</div>
    </div>
  `
}

function signatureHtml(signers = {}) {
  const line = 'border:none;padding:0;font-size:11px;font-family:Calibri,Arial,sans-serif;line-height:1.35;background:transparent;vertical-align:top;text-align:center;'
  return `
    <div data-kir-sign="1" style="width:${PAGE_WIDTH}px;margin-top:18px;padding-bottom:16px;color:#000000;">
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <tr>
          <td style="${line}width:50%;">
            Mengetahui,<br>Kepala Sekolah<br>${DOC.sekolah}
            ${signSlot(signers.kepala)}
          </td>
          <td style="${line}width:50%;">
            Makassar, ${tanggalPanjang()}<br>Penanggung Jawab Ruangan
            ${signSlot(signers.pj)}
          </td>
        </tr>
      </table>
      <div style="${line}margin-top:22px;">
        Menyetujui,<br>Wakasek IT, LAB dan Sarpra
        ${signSlot(signers.wakasek)}
      </div>
    </div>
  `
}

function buildHtml(ruangan, items, signers) {
  return `
    <div style="width:${PAGE_WIDTH}px;background:#ffffff;color:#000000;font-family:Calibri,Arial,sans-serif;">
      ${introHtml(ruangan, items.length)}
      ${tableHtml(headerHtml(), bodyRowsHtml(items))}
      ${signatureHtml(signers)}
    </div>
  `
}

// Tinggi isi A4 portrait setelah margin, dalam piksel layout tabel.
const PAGE_CONTENT_PX = Math.floor(PAGE_WIDTH * ((297 - 16) / (210 - 12))) - 24

function paginateHost(host, ruangan, items, signers) {
  const intro = host.querySelector('[data-kir-intro]')
  const head = host.querySelector('thead tr')
  const rows = [...host.querySelectorAll('[data-kir-row]')]
  if (!intro || !head || rows.length === 0) return

  const introHeight = intro.getBoundingClientRect().height
  const headHeight = head.getBoundingClientRect().height
  const sign = host.querySelector('[data-kir-sign]')
  const signStyle = sign ? window.getComputedStyle(sign) : null
  const signMargin = signStyle ? (parseFloat(signStyle.marginTop) || 0) + (parseFloat(signStyle.marginBottom) || 0) : 0
  const signHeight = sign ? sign.getBoundingClientRect().height + signMargin + 20 : 0
  const rowHeights = rows.map((row) => row.getBoundingClientRect().height)
  const pages = []
  let bucket = []
  let used = introHeight + headHeight

  rowHeights.forEach((height, index) => {
    if (bucket.length > 0 && used + height > PAGE_CONTENT_PX) {
      pages.push(bucket)
      bucket = []
      used = headHeight
    }
    bucket.push(rows[index].outerHTML)
    used += height
  })
  if (bucket.length) pages.push(bucket)

  const pageUsed = (pageRows, isFirst) => {
    const rowsHeight = pageRows.reduce((total, html) => {
      const index = rows.findIndex((row) => row.outerHTML === html)
      return total + (rowHeights[index] || 0)
    }, 0)
    return (isFirst ? introHeight : 0) + headHeight + rowsHeight
  }

  while (pages.length > 0 && signHeight > 0 && signHeight < PAGE_CONTENT_PX) {
    const last = pages[pages.length - 1]
    const isFirst = pages.length === 1
    if (pageUsed(last, isFirst) + signHeight <= PAGE_CONTENT_PX) break
    if (last.length <= 1) {
      pages.push([])
      break
    }
    const moved = last.pop()
    pages.push([moved])
  }

  if (pages.length <= 1 && pageUsed(pages[0] || [], true) + signHeight <= PAGE_CONTENT_PX) return

  const headHtml = headerHtml()
  const signBlock = signatureHtml(signers)
  host.innerHTML = pages.map((pageRows, index) => `
    <div style="width:${PAGE_WIDTH}px;background:#ffffff;color:#000000;font-family:Calibri,Arial,sans-serif;${index > 0 ? 'break-before:page;page-break-before:always;' : ''}">
      ${index === 0 ? introHtml(ruangan, items.length) : ''}
      ${pageRows.length ? tableHtml(headHtml, pageRows.join('')) : ''}
      ${index === pages.length - 1 ? signBlock : ''}
    </div>
  `).join('')
}

/**
 * Unduh Kartu Inventaris Ruangan (PDF) ukuran A4 portrait.
 * @param {{ ruangan: object, items: Array, signers?: object }} payload
 */
export async function downloadKirPdf({ ruangan, items = [], signers = {} }) {
  const html2pdf = (await import('html2pdf.js')).default
  const safeName = String(ruangan?.ruangan || 'ruangan')
    .replace(/[^\w\-]+/g, '_')
    .slice(0, 40)
  const filename = `KIR_${safeName}_${dayjs().format('YYYYMMDD')}.pdf`
  const host = document.createElement('div')
  host.style.width = `${PAGE_WIDTH}px`
  host.style.background = '#ffffff'
  host.style.color = '#000000'
  host.innerHTML = buildHtml(ruangan, items, signers)
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
    paginateHost(host, ruangan, items, signers)
    await html2pdf()
      .set({
        filename,
        margin: [8, 6, 8, 6],
        pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '[data-kir-sign]'] },
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
