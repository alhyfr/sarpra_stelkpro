'use client'
import { Printer } from "lucide-react"
import Button from "@/components/Button"
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import dayjs from "dayjs";

export default function Struk({ data }) {
    const contentRef = useRef(null);
    
    const handlePrint = useReactToPrint({
        contentRef: contentRef,
        pageStyle: `
            @page {
                size: 55mm auto;
                margin: 0;
                padding: 0;
            }
            @media print {
                * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                html, body {
                    width: 55mm !important;
                    min-width: 55mm !important;
                    max-width: 55mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                }
                body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `,
        onBeforeGetContent: () => {
            // Memastikan ref sudah terpasang sebelum print
            if (!contentRef.current) {
                console.warn('Content ref not available');
                return Promise.resolve();
            }
            return Promise.resolve();
        },
        onAfterPrint: () => {
            // Callback setelah print selesai - memastikan print berhenti
            console.log('Print completed');
        }
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
                ref={contentRef}
                className="bg-white border border-gray-300 mx-auto my-10 print:border-none print:shadow-none"
                style={{ 
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    width: '55mm',
                    minWidth: '55mm',
                    maxWidth: '55mm',
                    padding: '8px',
                    margin: '0 auto',
                    boxSizing: 'border-box',
                    marginTop: '10px',
                    marginBottom: '100px'

                }}
            >
                {/* Header */}
                <div className="text-center mb-3">
                    <h1 className="text-base font-bold mb-1">{data.ruangan}</h1>
                    <div className="border-t border-b border-gray-400 py-1">
                        <p className="font-semibold text-sm">IT,LAB & SARPRA</p>
                        <p className="font-semibold text-xs">SMK Telkom Makassar</p>
                    </div>
                </div>

                {/* Detail Transaksi */}
                <div className="mb-2">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm">No. Transaksi:</span>
                        <span className="font-semibold text-sm">#{data.id}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm">Tanggal Pinjam:</span>
                        <span className="text-sm">{dayjs(data.tgl).format('DD-MM-YYYY')}</span>
                    </div>
                    {data.tgl_end && (
                        <div className="flex justify-between mb-1">
                            <span className="text-sm">Tanggal Selesai:</span>
                            <span className="text-sm">{dayjs(data.tgl_end).format('DD-MM-YYYY')}</span>
                        </div>
                    )}
                </div>

                {/* Garis Pemisah */}
                <div className="border-t border-gray-400 my-2"></div>

                {/* Detail Peminjaman */}
                <div className="mb-2">
                    <h3 className="font-semibold mb-1 text-sm">DETAIL PEMINJAMAN:</h3>
                    <div className="bg-gray-50 p-2 rounded">
                        <div className="mb-1">
                            <span className="font-semibold text-sm">Peminjam:</span>
                            <p className="ml-0 mt-0 text-sm break-words">{data.peminjam}</p>
                        </div>
                        <div className="mb-1">
                            <span className="font-semibold text-sm">Ruangan:</span>
                            <p className="ml-0 mt-0 text-sm break-words">{data.ruangan}</p>
                        </div>
                        <div className="mb-1">
                            <span className="font-semibold text-sm">Kegiatan:</span>
                            <p className="ml-0 mt-0 text-sm break-words">{data.kegiatan}</p>
                        </div>
                        <div className="mb-1">
                            <span className="font-semibold text-sm">Jam:</span>
                            <p className="ml-0 mt-0 text-sm">
                                {data.jam_mulai} - {data.jam_selesai}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Garis Pemisah */}
                <div className="border-t border-gray-400 my-2"></div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">
                        Struk ini adalah bukti peminjaman ruangan yang sah
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
                    @page {
                        size: 55mm auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    html, body {
                        width: 55mm !important;
                        min-width: 55mm !important;
                        max-width: 55mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    body * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    )
}
