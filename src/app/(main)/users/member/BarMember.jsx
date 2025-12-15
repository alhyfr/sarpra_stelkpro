"use client";

import { useState, useEffect } from "react";
import { Printer, Download, Eye } from "lucide-react";
import Button from "@/components/Button";
import Barcode from "react-barcode";
import html2pdf from "html2pdf.js";
import ReactDOM from "react-dom/client";
import dayjs from "dayjs";

export default function BarMember({
    selectedItems = [],
    data = [],
    onClose = null,
}) {
    const [filteredData, setFilteredData] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);

    // Filter data berdasarkan selectedItems - DENGAN PROPER COPY
    useEffect(() => {
        if (selectedItems?.length > 0 && data?.length > 0) {
            // Buat copy data dulu, jangan modify langsung
            const filtered = data
                .filter((item) => selectedItems.includes(item.id))
                .map((item) => ({ ...item })); // ← SHALLOW COPY setiap item

            setFilteredData(filtered);
        }
    }, [selectedItems, data]);

    const pdfJsx = () => {
        const stickersPerPage = 21; // Adjust per page count if needed
        const pages = [];

        // Buat copy data untuk manipulasi
        const dataToProcess = [...filteredData];

        for (let i = 0; i < dataToProcess.length; i += stickersPerPage) {
            pages.push(dataToProcess.slice(i, i + stickersPerPage));
        }

        return (
            <div style={{ color: "#000000" }}>
                {pages.map((pageData, pageIndex) => (
                    <div
                        key={pageIndex}
                        style={{
                            pageBreakAfter: pageIndex < pages.length - 1 ? "always" : "auto",
                        }}
                    >
                        <div className="p-4" style={{ color: "#000000" }}>
                            <div className="grid grid-cols-3 gap-3">
                                {pageData.map((item, index) => {
                                    return (
                                        <div
                                            key={`stiker-${pageIndex}-${index}`}
                                            className="border border-black rounded overflow-hidden"
                                            style={{ breakInside: "avoid" }}
                                        >
                                            <div className="flex justify-center items-center p-2">
                                                <Barcode
                                                    value={`${item.mid ?? ""}`}
                                                    width={1.5}
                                                    fontSize={12}
                                                    height={40}
                                                    margin={0}
                                                    displayValue={true}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const options = {
        filename: "barcode-member.pdf",
        margin: [0.1, 0.1, 0.1, 0.1],
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            letterRendering: true,
            logging: false,
        },
        jsPDF: {
            unit: "in",
            format: "A4",
            orientation: "portrait",
        },
    };

    const handlePrint = () => {
        if (!filteredData || filteredData.length === 0) {
            alert("Tidak ada data untuk dicetak");
            return;
        }

        try {
            const printContainer = document.createElement("div");
            const root = ReactDOM.createRoot(printContainer);
            root.render(pdfJsx());

            document.body.appendChild(printContainer);

            // Tunggu rendering selesai
            setTimeout(() => {
                html2pdf()
                    .set(options)
                    .from(printContainer)
                    .save()
                    .then(() => {
                        root.unmount();
                        document.body.removeChild(printContainer);
                    })
                    .catch((error) => {
                        console.error("Error saat mencetak:", error);
                        if (document.body.contains(printContainer)) {
                            root.unmount();
                            document.body.removeChild(printContainer);
                        }
                        alert("Terjadi kesalahan saat mencetak stiker: " + error.message);
                    });
            }, 500);
        } catch (error) {
            console.error("Error saat memproses data:", error);
            alert("Terjadi kesalahan saat memproses data stiker");
        }
    };

    const handleDownload = () => {
        handlePrint();
    };

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900">
                            Cetak Barcode Member
                        </h3>
                        <p className="text-sm text-blue-700">
                            {filteredData.length} member dipilih untuk dicetak
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            {previewMode ? "Tutup" : "Preview"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold">{filteredData.length}</span>{" "}
                    barcode
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
                    <Button onClick={handlePrint} className="flex items-center gap-2">
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
                                return (
                                    <div
                                        key={`preview-${item.id ?? index}`}
                                        className="border border-black rounded overflow-hidden"
                                    >
                                        <div className="flex justify-center items-center p-2">
                                            <Barcode
                                                value={`${item.mid ?? ""}`}
                                                width={1.5}
                                                fontSize={12}
                                                height={40}
                                                margin={0}
                                                displayValue={true}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
