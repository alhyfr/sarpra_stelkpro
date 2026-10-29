import dayjs from 'dayjs'
import { createRoot } from 'react-dom/client'
import QRCode from 'react-qr-code'
import Logo from '@/assets/stelk_mks.png'

const logoSrc = typeof Logo === 'string' ? Logo : (Logo?.src || '')

export function kirDigitalUrl(namaRuangan) {
  const name = String(namaRuangan || '').trim()
  return `https://inventaris.sistelk.id/kir/${encodeURIComponent(name)}`
}

function QrSheet({ ruangan, url }) {
  return (
    <div style={{ width: '420px', margin: '0 auto', padding: '28px 24px 32px', background: '#ffffff', color: '#000000', fontFamily: 'Calibri, Arial, sans-serif', textAlign: 'center' }}>
      {/* html2pdf butuh <img> native; next/image tidak ikut ke capture PDF */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoSrc} alt="SMK Telkom Makassar" width="78" style={{ width: '78px', height: 'auto', display: 'block', margin: '0 auto 12px' }} />
      <div style={{ fontWeight: 700, fontSize: '16px' }}>KARTU INVENTARIS RUANGAN</div>
      <div style={{ fontSize: '12px', marginTop: '2px' }}>SMK TELKOM MAKASSAR</div>
      <div style={{ fontWeight: 700, fontSize: '18px', marginTop: '22px' }}>{ruangan.ruangan}</div>
      <div style={{ fontSize: '13px', marginTop: '4px' }}>{ruangan.gedung || ''}</div>
      <div style={{ width: '240px', height: '240px', margin: '22px auto', background: '#ffffff' }}>
        <QRCode
          value={url}
          size={240}
          level="M"
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          viewBox="0 0 256 256"
        />
      </div>
      <div style={{ fontSize: '13px' }}>Scan untuk membuka KIR digital</div>
    </div>
  )
}

/**
 * Unduh QR KIR digital. URL: https://inventaris.sistelk.id/kir/{nama ruangan}
 * @param {{ ruangan: object }} payload
 */
export async function downloadKirQrPdf({ ruangan }) {
  const name = String(ruangan?.ruangan || '').trim()
  if (!name) return
  const url = kirDigitalUrl(name)
  const safeName = name.replace(/[^\w\-]+/g, '_').slice(0, 40)
  const filename = `KIR_QR_${safeName}_${dayjs().format('YYYYMMDD')}.pdf`
  const host = document.createElement('div')
  host.style.width = '420px'
  host.style.background = '#ffffff'
  host.style.color = '#000000'
  document.body.appendChild(host)
  const root = createRoot(host)
  root.render(<QrSheet ruangan={{ ...ruangan, ruangan: name }} url={url} />)

  try {
    const html2pdf = (await import('html2pdf.js')).default
    await new Promise((resolve) => setTimeout(resolve, 50))
    const image = host.querySelector('img')
    if (image && !image.complete) {
      await new Promise((resolve) => {
        image.onload = resolve
        image.onerror = resolve
      })
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
    await html2pdf()
      .set({
        filename,
        margin: [12, 12, 12, 12],
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
    root.unmount()
    if (host.parentNode) host.remove()
  }
}
