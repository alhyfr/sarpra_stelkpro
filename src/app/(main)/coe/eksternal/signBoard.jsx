'use client'
import { useRef } from "react";
import { Signpost } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale('id');

export default function SignBoard({ item }) {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `SignBoard-${item?.kegiatan || 'Event'}-${item?.id || 'unknown'}`,
        pageStyle: `
            @page {
                size: A4 landscape;
                margin: 0 !important;
                padding: 0 !important;
            }
            html, body {
                width: 100%;
                height: 100%;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: #fff !important;
            }
            .no-print { display: none !important; }
        `
    });

    if (!item) {
        return (
            <div className="p-2 text-center text-gray-500 text-sm">
                <p>Data tidak tersedia</p>
            </div>
        );
    }

    // Format tanggal
    const formatDate = (date) =>
        date ? dayjs(date).format('dddd, DD MMMM YYYY') : '-';
    const formatDateShort = (date) =>
        date ? dayjs(date).format('DD/MM/YYYY') : '-';
    const formatDateRange = (mulai, selesai) => {
        if (!mulai && !selesai) return '-';
        if (!mulai) return formatDate(selesai);
        if (!selesai) return formatDate(mulai);
        if (dayjs(mulai).isSame(dayjs(selesai), 'day'))
            return formatDate(mulai);
        return `${formatDate(mulai)} s/d ${formatDate(selesai)}`;
    };
    const formatDateRangeShort = (mulai, selesai) => {
        if (!mulai && !selesai) return '-';
        if (!mulai) return formatDateShort(selesai);
        if (!selesai) return formatDateShort(mulai);
        if (dayjs(mulai).isSame(dayjs(selesai), 'day'))
            return formatDateShort(mulai);
        return `${formatDateShort(mulai)} - ${formatDateShort(selesai)}`;
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handlePrint}
                className="no-print p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Cetak Sign Board"
            >
                <Signpost className="w-5 h-5" />
            </button>
            {/* Printable area, full-paper, horizontal, middle */}
            <div style={{ position: 'absolute', left: '-9999px', width: 'auto', height: 'auto' }}>
                <div
                    ref={componentRef}
                    style={{
                        width: '297mm',
                        height: '210mm',
                        minWidth: '297mm',
                        minHeight: '210mm',
                        position: 'relative',
                        overflow: 'hidden',
                        fontFamily: 'Inter, Arial, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {/* background in ancestor, absolute, full-paper */}
                    <div style={{
                        position: 'absolute',
                        zIndex: 0,
                        top: 0, left: 0, width: '100%', height: '100%',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        overflow: "hidden"
                    }}>
                        <svg
                            viewBox="0 0 1200 850"
                            width="100%"
                            height="100%"
                            preserveAspectRatio="none"
                            style={{
                                position: 'absolute',
                                top: 0, left: 0,
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            <polygon points="0,0 400,0 200,300" fill="#B91C1C" opacity="0.48" />
                            <polygon points="400,0 650,170 200,300" fill="#EF4444" opacity="0.33" />
                            <polygon points="650,170 900,0 400,0" fill="#D1D5DB" opacity="0.68" />
                            <polygon points="900,0 1200,0 1150,200 650,170" fill="#9CA3AF" opacity="0.68" />
                            <polygon points="200,300 650,170 1150,200 900,700" fill="#EF4444" opacity="0.27" />
                            <polygon points="200,300 900,700 400,850" fill="#B91C1C" opacity="0.48" />
                            <polygon points="1150,200 1200,850 900,700" fill="#B91C1C" opacity="0.26" />
                            <polygon points="400,850 900,700 1200,850" fill="#D1D5DB" opacity="0.37" />
                            <polygon points="0,0 200,300 400,850 0,850" fill="#9CA3AF" opacity="0.33" />
                            {/* Extra overlays */}
                            <polygon points="1000,0 1200,0 1200,300" fill="#EF4444" opacity="0.10" />
                            <polygon points="900,700 950,650 1000,850" fill="#9CA3AF" opacity="0.11" />
                            <polygon points="800,300 1100,150 1000,400" fill="#D1D5DB" opacity="0.18" />
                            <polygon points="1200,850 1150,800 1100,850" fill="#EF4444" opacity="0.10" />
                        </svg>
                    </div>
                    {/* main content absolutely centered in paper */}
                    <div style={{
                        zIndex: 10,
                        width: '90%',
                        maxWidth: 1000,
                        margin: '0 auto',
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "70%", // agar tetap proporsional tiap device print
                        padding: 0
                    }}>
                        <h1 style={{
                            fontSize: 48,
                            fontWeight: 900,
                            color: "#B91C1C",
                            letterSpacing: '1.5px',
                            textShadow: '0 4px 30px #fff8, 0 2px 8px #D1D5DB88',
                            marginBottom: "2px",
                            marginTop: 0,
                            textAlign: 'center'
                        }}>
                            {/* {item.ket} */}
                            SMK TELKOM MAKASSAR
                        </h1>
                        <div style={{
                            fontSize: 25,
                            fontWeight: 500,
                            color: "#71717A",
                            textShadow: '0 0 12px #fff 95%',
                            letterSpacing: '1.1px',
                            textTransform: "uppercase",
                            marginBottom: 14,
                            textAlign: 'center'
                        }}>
                            {/* IT,LAB, & SARPRA */}
                            {item.ruangan}
                        </div>
                        <div style={{
                            height: 5, width: 130,
                            borderRadius: 3,
                            background: "linear-gradient(90deg,#B91C1C 0%,#EF4444 100%)",
                            margin: "8px auto 16px auto"
                        }} />
                        <div style={{
                            fontSize: 34,
                            fontWeight: 800,
                            color: "#B91C1C",
                            textShadow: '0 1px 14px #fff6, 0 0 22px #EF444420',
                            marginTop: 0,
                            marginBottom: 9,
                            textAlign: 'center',
                            letterSpacing: "0.6px",
                            textTransform: "uppercase"
                        }}>
                            {item.kegiatan || '-'}
                        </div>
                        <div style={{
                            width: 62, height: 3.5, borderRadius: 4,
                            background: "linear-gradient(90deg,#EF4444 60%,#B91C1C 100%)",
                            marginBottom: 15
                        }} />
                        <div style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#2B2B2B",
                            letterSpacing: 0.6,
                            marginBottom: 4,
                            textAlign: 'center',
                            textShadow: '0 2px 10px #fff9'
                        }}>
                            {formatDateRange(item.tgl_mulai, item.tgl_selesai)}
                        </div>
                        <div style={{
                            fontSize: 16.5,
                            color: "#8D8D8D",
                            marginBottom: "10px",
                            textAlign: 'center',
                            letterSpacing: "0.3px",
                            textShadow: '0 1px 7px #fff8'
                        }}>
                            {formatDateRangeShort(item.tgl_mulai, item.tgl_selesai)}
                        </div>
                        <div style={{
                            fontSize: 23,
                            fontWeight: 700,
                            color: "#EF4444",
                            letterSpacing: 0.4,
                            marginTop: 5,
                            textAlign: 'center',
                            textShadow: "0 3px 16px #fff7"
                        }}>
                            {item.ket || item.penyelenggara || '-'}
                        </div>

                        {/* Footer: posisi mutlak paling bawah
                        <div style={{
                            textAlign: 'center',
                            color: '#A1A1AA',
                            fontSize: 13,
                            letterSpacing: '.7px',
                            marginTop: 25,
                            textShadow: '0 1px 5px #fffbe'
                        }}>
                            {`Dicetak pada: ${dayjs().locale('id').format('dddd, DD MMMM YYYY HH:mm')}`}
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}