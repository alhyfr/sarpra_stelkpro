'use client'

import { useState, useEffect } from 'react'
import { Printer, Download, Eye } from 'lucide-react'
import Button from '@/components/Button'
import Barcode from 'react-barcode'
import QRCode from 'react-qr-code'
import html2pdf from 'html2pdf.js'
import ReactDOM from 'react-dom/client'

const STICKERS_PER_PAGE = 21

const getBarcodeValue = (item) => {
  const value = String(item?.kode ?? item?.kode_ypt ?? item?.id ?? '').trim()
  return value.length > 0 ? value : null
}

const getQrValue = (item) => {
  const kode = String(item?.kode ?? '').trim()
  if (kode) return `https://inventaris.sistelk.id/${kode}`
  const id = String(item?.id ?? '').trim()
  return id ? `lab-inv-${id}` : 'lab-inv-unknown'
}

function StickerCard({ item, index, prefix = 'stiker' }) {
  const barcodeValue = getBarcodeValue(item)
  const qrValue = getQrValue(item)

  return (
    <div
      key={`${prefix}-${item.id ?? index}`}
      className="border border-black rounded overflow-hidden"
      style={{ breakInside: 'avoid' }}
    >
      <div className="flex flex-col">
        <div className="p-2 space-y-0.5">
          <p className="text-[9px] font-semibold uppercase truncate" style={{ color: '#000000' }}>
            {item.inventaris_desc || item.desc || '-'}
          </p>
          <p className="text-[9px]" style={{ color: '#000000' }}>
            Lab: {item.nama_lab || '-'}
          </p>
          <p className="text-[9px] uppercase" style={{ color: '#000000' }}>
            Ruang: {item.ruang || '-'}
          </p>
          <p className="text-[9px]" style={{ color: '#000000' }}>
            Kondisi: {item.kondisi || '-'}
          </p>
        </div>

        <div className="border-t border-black p-1 flex justify-center items-center" style={{ minHeight: 33 }}>
          {barcodeValue ? (
            <Barcode
              value={barcodeValue}
              width={1}
              fontSize={8}
              height={25}
              margin={0}
            />
          ) : (
            <span
              className="text-[10px] font-medium"
              style={{ color: '#000000', lineHeight: '25px' }}
            >
              -
            </span>
          )}
        </div>

        <div className="border-t border-black p-1 flex items-center justify-center bg-white">
          <QRCode
            size={256}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={qrValue}
            viewBox="0 0 256 256"
            level="M"
          />
        </div>
      </div>
    </div>
  )
}

export default function Stiker({
  selectedItems = [],
  data = [],
  onClose = null,
}) {
  const [filteredData, setFilteredData] = useState([])
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (selectedItems?.length > 0 && data?.length > 0) {
      const filtered = data
        .filter((item) => selectedItems.includes(item.id))
        .map((item) => ({ ...item }))

      setFilteredData(filtered)
    } else {
      setFilteredData([])
    }
  }, [selectedItems, data])

  const pdfJsx = () => {
    const pages = []
    const dataToProcess = [...filteredData]

    for (let i = 0; i < dataToProcess.length; i += STICKERS_PER_PAGE) {
      pages.push(dataToProcess.slice(i, i + STICKERS_PER_PAGE))
    }

    return (
      <div style={{ color: '#000000' }}>
        {pages.map((pageData, pageIndex) => (
          <div
            key={pageIndex}
            style={{ pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto' }}
          >
            <div className="p-4" style={{ color: '#000000' }}>
              <div className="grid grid-cols-3 gap-3">
                {pageData.map((item, index) => (
                  <StickerCard
                    key={`pdf-${pageIndex}-${item.id ?? index}`}
                    item={item}
                    index={index}
                    prefix={`pdf-${pageIndex}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const options = {
    filename: 'stiker-inventaris-lab.pdf',
    margin: [0.1, 0.1, 0.1, 0.1],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: {
      unit: 'in',
      format: 'A4',
      orientation: 'portrait',
    },
  }

  const handlePrint = () => {
    if (!filteredData || filteredData.length === 0) {
      alert('Tidak ada data untuk dicetak')
      return
    }

    try {
      const printContainer = document.createElement('div')
      const root = ReactDOM.createRoot(printContainer)
      root.render(pdfJsx())

      document.body.appendChild(printContainer)

      setTimeout(() => {
        html2pdf()
          .set(options)
          .from(printContainer)
          .save()
          .then(() => {
            root.unmount()
            document.body.removeChild(printContainer)
          })
          .catch((error) => {
            console.error('Error saat mencetak:', error)
            if (document.body.contains(printContainer)) {
              root.unmount()
              document.body.removeChild(printContainer)
            }
            alert('Terjadi kesalahan saat mencetak stiker: ' + error.message)
          })
      }, 500)
    } catch (error) {
      console.error('Error saat memproses data:', error)
      alert('Terjadi kesalahan saat memproses data stiker')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Cetak Stiker Inventaris Lab</h3>
            <p className="text-sm text-blue-700">
              {filteredData.length} item dipilih untuk dicetak
            </p>
          </div>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Tutup' : 'Preview'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{filteredData.length}</span> stiker
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Cetak
          </Button>
        </div>
      </div>

      {previewMode && (
        <div className="overflow-auto">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {filteredData.map((item, index) => (
                <StickerCard
                  key={`preview-${item.id ?? index}`}
                  item={item}
                  index={index}
                  prefix="preview"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
