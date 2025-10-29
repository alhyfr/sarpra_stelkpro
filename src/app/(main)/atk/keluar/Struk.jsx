'use client'
import { Printer } from "lucide-react"
import Button from "@/components/Button"
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import dayjs from "dayjs";

export default function Struk({ data }) {
    const componentRef = useRef();
    
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Struk-ATK-Keluar-${data?.id || 'unknown'}`,
        pageStyle: `
            @page {
                size: 50mm 100%;
                margin: 0.5in;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                    width: 50mm;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
            }
        `
    });

    if (!data) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p>Data tidak tersedia</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Print Button */}
            <div className="mb-4 flex justify-end no-print">
                <Button 
                    icon={Printer} 
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Cetak Struk
                </Button>
            </div>

            {/* Struk Content */}
            <div 
                ref={componentRef}
                className="bg-white border border-gray-300 mx-auto print:border-none print:shadow-none"
                style={{ 
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    lineHeight: '1.2',
                    width: '50mm',
                    padding: '8px',
                    margin: '0 auto'
                }}
            >
                {/* Header */}
                <div className="text-center mb-3">
                    <h1 className="text-sm font-bold mb-1">STRUK PENGAMBILAN ATK</h1>
                    <div className="border-t border-b border-gray-400 py-1">
                        <p className="font-medium text-xs">SISTEM INFORMASI PENGELOLAAN</p>
                        <p className="font-semibold text-xs">IT,LAB & SARPRA</p>
                        <p className="font-semibold text-[10px]">SMK Telkom Makassar</p>
                    </div>
                </div>

                {/* Detail Transaksi */}
                <div className="mb-2">
                    <div className="flex justify-between mb-1">
                        <span className="text-xs">No. Transaksi:</span>
                        <span className="font-semibold text-xs">#{data.id}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="text-xs">Tanggal:</span>
                        <span className="text-xs">{dayjs(data.tgl).format('DD-MM-YYYY HH:mm')}</span>
                    </div>
                    
                </div>

                {/* Garis Pemisah */}
                <div className="border-t border-gray-400 my-2"></div>

                {/* Detail Item */}
                <div className="mb-2">
                    <h3 className="font-semibold mb-1 text-xs">DETAIL BARANG:</h3>
                    <div className="bg-gray-50 p-2 rounded">
                        <div className="mb-1">
                            <span className="font-semibold text-xs">Nama Barang:</span>
                            <p className="ml-0 mt-0 text-xs break-words">{data.nabar}</p>
                        </div>
                        <div className="mb-1">
                            <span className="font-semibold text-xs">Volume:</span>
                            <p className="ml-0 mt-0 text-xs">{data.vol} unit</p>
                        </div>
                        <div className="mb-1">
                            <span className="font-semibold text-xs">Unit:</span>
                            <p className="ml-0 mt-0 text-xs">{data.unit?.toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Detail Pengambil */}
                <div className="mb-2">
                    <h3 className="font-semibold mb-1 text-xs">DETAIL PENGAMBIL:</h3>
                    <div className="bg-gray-50 p-2 rounded">
                        <div className="mb-1">
                            <span className="font-semibold text-xs">Nama Pengambil:</span>
                            <p className="ml-0 mt-0 text-xs break-words">{data.pengambil}</p>
                        </div>
                    </div>
                </div>

                {/* Garis Pemisah */}
                <div className="border-t border-gray-400 my-2"></div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">
                        Struk ini adalah bukti pengambilan ATK yang sah
                    </p>
                    <div className="border-t border-gray-400 pt-1">
                        <p className="text-xs">
                            Dicetak: {dayjs().format('DD-MM-YYYY HH:mm')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .print-content {
                        font-family: monospace !important;
                        font-size: 10px !important;
                        line-height: 1.2 !important;
                        width: 50mm !important;
                        margin: 0 !important;
                        padding: 8px !important;
                    }
                }
            `}</style>
        </div>
    )
}