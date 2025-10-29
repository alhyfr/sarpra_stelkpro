'use client'

import { useState, useEffect } from 'react'
import { Printer, Download, Eye, Sticker } from 'lucide-react'
import Button from '@/components/Button'
import { Kemdikbud, Ts2 } from "@/assets/index"
import QRCode from 'react-qr-code'
import Barcode from 'react-barcode'
import html2pdf from 'html2pdf.js'
import ReactDOM from 'react-dom/client'
import dayjs from 'dayjs'

export default function Stiker({ 
  selectedItems = [], 
  data = [], 
  onClose = null 
}) {
  const [filteredData, setFilteredData] = useState([])
  const [previewMode, setPreviewMode] = useState(false)

  // Filter data berdasarkan selectedItems - DENGAN PROPER COPY
  useEffect(() => {
    if (selectedItems?.length > 0 && data?.length > 0) {
      // Buat copy data dulu, jangan modify langsung
      const filtered = data
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({ ...item })) // ← SHALLOW COPY setiap item
      
      setFilteredData(filtered)
    }
  }, [selectedItems, data])

  // Function untuk get image source yang benar
  const getImageSrc = (imageImport) => {
    if (typeof imageImport === 'string') {
      return imageImport
    } else if (imageImport?.src) {
      return imageImport.src
    } else if (imageImport?.default) {
      return imageImport.default
    }
    return imageImport
  }

  const pdfJsx = () => {
    const stickersPerPage = 21
    const pages = []
    
    // Buat copy data untuk manipulasi
    const dataToProcess = [...filteredData]
    
    for (let i = 0; i < dataToProcess.length; i += stickersPerPage) {
      pages.push(dataToProcess.slice(i, i + stickersPerPage))
    }

    // Get proper image sources
    const kemdikbudSrc = getImageSrc(Kemdikbud)
    const ts2Src = getImageSrc(Ts2)

    return (
      <div>
        {pages.map((pageData, pageIndex) => (
          <div key={pageIndex} style={{ pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto' }}>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {pageData.map((item, index) => {
                  // Safely extract properties dengan nullish coalescing
                  const gedungText = (typeof item.gedung === 'object' && item.gedung !== null) ? 
                    (item.gedung?.gedung ?? '') : 
                    (item.gedung ?? '')

                  const sumberText = (typeof item.sumber_dana === 'object' && item.sumber_dana !== null) ? 
                    (item.sumber_dana?.sumber ?? '') : 
                    (item.sumber ?? '')

                  const imageSrc = sumberText === "BOS" ? kemdikbudSrc : ts2Src

                  return (
                    <div key={`stiker-${pageIndex}-${index}`} className="border border-black rounded overflow-hidden" style={{ breakInside: 'avoid' }}>
                      <div className="flex">
                        {/* Logo and Info Section */}
                        <div className="flex flex-col w-[70%]">
                          <div className="flex p-1 items-center">
                            <div className="w-[30%]">
                              <img
                                src={imageSrc}
                                alt={sumberText || 'Logo'}
                                className="w-[40px] h-[40px] object-contain"
                                crossOrigin="anonymous"
                              />
                            </div>
                            <div className="w-[70%]">
                              <p className="text-[9px] font-medium">NS: {item.kode_sim ?? ''}</p>
                              <p className="text-[9px]">Tgl: {dayjs(item.tgl).format('DD-MM-YYYY')}</p>
                              <p className="text-[9px] uppercase font-semibold">
                                {gedungText} {item.ruang ?? ''}
                              </p>
                            </div>
                          </div>
                          {/* Barcode Section */}
                          <div className="border-t border-black p-1 flex justify-center">
                            <Barcode
                              value={`${item.kode ?? ''}`}
                              width={1}
                              fontSize={8}
                              height={25}
                              margin={0}
                            />
                          </div>
                        </div>
                        {/* QR Code Section */}
                        <div className="w-[30%] border-l border-black p-1 flex items-center justify-center bg-white">
                          <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={`https://inventaris.sistelk.id/${item.kode ?? ''}`}
                            viewBox={`0 0 256 256`}
                            level="M"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const options = {
    filename: "stiker-aset.pdf",
    margin: [0.1, 0.1, 0.1, 0.1],
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: false
    },
    jsPDF: {
      unit: "in",
      format: "A4",
      orientation: "portrait",
    },
  }

  const handlePrint = () => {
    if (!filteredData || filteredData.length === 0) {
      alert('Tidak ada data untuk dicetak')
      return
    }

    try {
      const printContainer = document.createElement("div")
      const root = ReactDOM.createRoot(printContainer)
      root.render(pdfJsx())

      document.body.appendChild(printContainer)

      // Tunggu rendering selesai
      setTimeout(() => {
        html2pdf()
          .set(options)
          .from(printContainer)
          .save()
          .then(() => {
            root.unmount()
            document.body.removeChild(printContainer)
          })
          .catch(error => {
            console.error("Error saat mencetak:", error)
            if (document.body.contains(printContainer)) {
              root.unmount()
              document.body.removeChild(printContainer)
            }
            alert('Terjadi kesalahan saat mencetak stiker: ' + error.message)
          })
      }, 500)
    } catch (error) {
      console.error("Error saat memproses data:", error)
      alert('Terjadi kesalahan saat memproses data stiker')
    }
  }

  const handleDownload = () => {
    handlePrint()
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Cetak Stiker Aset
            </h3>
            <p className="text-sm text-blue-700">
              {filteredData.length} item dipilih untuk dicetak
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Tutup' : 'Preview'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{filteredData.length}</span> stiker
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </Button>
        </div>
      </div>

      {/* Stiker Preview */}
      {previewMode && (
        <div className="overflow-auto">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {filteredData.map((item, index) => {
                const gedungText = (typeof item.gedung === 'object' && item.gedung !== null) ? 
                  (item.gedung?.gedung ?? '') : 
                  (item.gedung ?? '')

                const sumberText = (typeof item.sumber_dana === 'object' && item.sumber_dana !== null) ? 
                  (item.sumber_dana?.sumber ?? '') : 
                  (item.sumber ?? '')

                const imageSrc = sumberText === "BOS" ? getImageSrc(Kemdikbud) : getImageSrc(Ts2)

                return (
                  <div key={`preview-${item.id ?? index}`} className="border border-black rounded overflow-hidden">
                    <div className="flex">
                      <div className="flex flex-col w-[70%]">
                        <div className="flex p-1 items-center">
                          <div className="w-[30%]">
                            <img
                              src={imageSrc}
                              alt={sumberText || 'Logo'}
                              className="w-[40px] h-[40px] object-contain"
                            />
                          </div>
                          <div className="w-[70%]">
                            <p className="text-[9px] font-medium">NS: {item.kode_sim ?? ''}</p>
                            <p className="text-[9px]">Tgl: {dayjs(item.tgl).format('DD-MM-YYYY')}</p>
                            <p className="text-[9px] uppercase font-semibold">
                              {gedungText} {item.ruang ?? ''}
                            </p>
                          </div>
                        </div>
                        <div className="border-t border-black p-1 flex justify-center">
                          <Barcode
                            value={`${item.kode ?? ''}`}
                            width={1}
                            fontSize={8}
                            height={25}
                            margin={0}
                          />
                        </div>
                      </div>
                      <div className="w-[30%] border-l border-black p-1 flex items-center justify-center bg-white">
                        <QRCode
                          size={256}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          value={`https://inventaris.sistelk.id/${item.kode ?? ''}`}
                          viewBox={`0 0 256 256`}
                          level="M"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      
    </div>
  )
}