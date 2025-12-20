'use client';
import { Download } from 'lucide-react';
import dayjs from 'dayjs';
import ReactDOM from 'react-dom/client';
import { useData } from '@/app/context/DataContext';
import { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import Logo from '@/assets/ts.png';

export default function DataPdf({ data = [], dataDetail = null }) {
  const { waka, getWaka, teams } = useData();
  const [kasar, setKasar] = useState(null);

  useEffect(() => {
    getWaka();
  }, []);

  useEffect(() => {
    // Ambil data kasar (penyerah) dari teams jika team_name tersedia
    if (dataDetail?.team_name) {
      if (teams && teams.length > 0) {
        const team = teams.find(t => t.nama === dataDetail.team_name || t.jabatan === dataDetail.team_name);
        if (team) {
          setKasar({
            nama: team.nama || dataDetail.team_name,
            jabatan: team.jabatan || 'IT,LAB dan Sarpra',
            kode: team.kode || team.nip || ''
          });
        } else {
          // Jika tidak ditemukan, gunakan data yang tersedia
          setKasar({
            nama: dataDetail.team_name,
            jabatan: 'IT,LAB dan Sarpra',
            kode: ''
          });
        }
      } else {
        // Fallback jika teams belum ter-load
        setKasar({
          nama: dataDetail.team_name,
          jabatan: 'IT,LAB dan Sarpra',
          kode: ''
        });
      }
    }
  }, [dataDetail, teams]);

  const pdfJsx = () => {
    if (!dataDetail) return null;

    return (
      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#000000', padding: '20px' }}>
        <table
          style={{ 
            width: "95%", 
            borderCollapse: "collapse", 
            margin: "0 auto", 
            fontSize: "10px",
            border: "0.5px solid #666666"
          }}
        >
          <tr>
            <td
              width="15%"
              valign="center"
              rowSpan={3}
              style={{ border: "0.5px solid #666666", padding: "8px" }}
            >
              <div style={{ margin: "0 auto", textAlign: "center" }}>
                <img
                  src={typeof Logo === 'string' ? Logo : (Logo?.src || '/ts.png')}
                  style={{ margin: "0 auto", height: "80px", width: "60px", display: "block" }}
                  alt="Logo"
                />
              </div>
            </td>
            <td
              rowSpan={2}
              style={{ border: "0.5px solid #666666", padding: "8px" }}
            >
              <div style={{ margin: "0 auto", textAlign: "center" }}>
                <p style={{ margin: "0", fontWeight: "bold" }}>SMK TELKOM MAKASSAR</p>
                <p style={{ margin: "0" }}>Jl. A.P. Pettarani &nbsp;No. 4, Gunung Sari, Makassar &nbsp;90221</p>
              </div>
            </td>
            <td
              width="20%"
              style={{ border: "0.5px solid #666666", padding: "8px" }}
            >
              No. Dokumen
            </td>
            <td
              width="20%"
              style={{ border: "0.5px solid #666666", padding: "8px" }}
            >
              STM-SARPRA-FM-005
            </td>
          </tr>
          <tr>
            <td style={{ border: "0.5px solid #666666", padding: "8px" }}>No. Revisi</td>
            <td style={{ border: "0.5px solid #666666", padding: "8px" }}>01</td>
          </tr>
          <tr>
            <td style={{ border: "0.5px solid #666666", padding: "8px" }}>
              <div style={{ margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <p style={{ margin: "0 auto", fontWeight: "bold", textTransform: "uppercase" }}>formulir &nbsp; serah &nbsp;terima &nbsp;barang</p>
              </div>
            </td>
            <td style={{ border: "0.5px solid #666666", padding: "8px" }}>Tanggal &nbsp; Berlaku</td>
            <td style={{ border: "0.5px solid #666666", padding: "8px" }}>7 Maret &nbsp; 2025</td>
          </tr>
        </table>
        <div style={{ marginTop: "12px", marginBottom: "12px", textAlign: "center" }}>
          <p style={{ margin: "0", fontWeight: "bold" }}>FORMULIR SERAH TERIMA ASET</p>
          <p style={{ margin: "0" }}>SMK TELKOM MAKASSAR</p>
        </div>
        <div style={{ marginLeft: "40px", marginRight: "40px", marginTop: "8px", marginBottom: "8px" }}>
          <p style={{ fontSize: "12px", margin: "0 0 8px 0" }}>
            Pada hari ini {dataDetail.tgl ? dayjs(dataDetail.tgl).locale("id").format("DD, MMMM YYYY") : dayjs().locale("id").format("DD, MMMM YYYY")} kami yang bertanda tangan di bawah ini :
          </p>
          <table style={{ fontSize: "12px", fontWeight: "normal", width: "100%", borderCollapse: "collapse" }}>
            <tr>
              <td style={{ width: "50%", fontWeight: "normal" }}>Nama</td>
              <td>:</td>
              <td>{kasar?.nama || dataDetail.team_name || '-'}</td>
            </tr>
            <tr>
              <td style={{ width: "50%", fontWeight: "normal" }}>Unit Kerja</td>
              <td>:</td>
              <td>IT,LAB dan Sarpra</td>
            </tr>
            <tr>
              <td style={{ width: "50%", fontWeight: "normal" }}>Jabatan</td>
              <td>:</td>
              <td>{kasar?.jabatan || 'IT,LAB dan Sarpra'}</td>
            </tr>
          </table>
          <p style={{ fontSize: "12px", margin: "8px 0" }}>Untuk selanjutnya disebut sebagai "PIHAK PERTAMA"</p>
          <table style={{ marginTop: "20px", fontSize: "12px", fontWeight: "normal", width: "100%", borderCollapse: "collapse" }}>
            <tr>
              <td style={{ width: "50%", fontWeight: "normal" }}>Nama</td>
              <td>:</td>
              <td>{dataDetail.penerima || '-'}</td>
            </tr>
            <tr>
              <td style={{ width: "50%", fontWeight: "normal" }}>Unit Kerja</td>
              <td>:</td>
              <td>{dataDetail.unit || '-'}</td>
            </tr>
            <tr>
              <td style={{ width: "50%", fontWeight: "normal" }}>Jabatan</td>
              <td>:</td>
              <td>{dataDetail.jabatan || '-'}</td>
            </tr>
          </table>
          <p style={{ fontSize: "12px", margin: "8px 0" }}>Untuk selanjutnya disebut sebagai "PIHAK KEDUA"</p>
          <p style={{ marginTop: "40px", fontSize: "12px", marginBottom: "8px" }}>
            Dalam Formulir ini "PIHAK PERTAMA" menyerahkan barang kepada "PIHAK KEDUA" dan "PIHAK KEDUA" menerima barang dari "PIHAK
            PERTAMA" berupa:
          </p>
          <table
            style={{ 
              width: "95%", 
              borderCollapse: "collapse", 
              marginTop: "40px", 
              fontSize: "10px",
              border: "0.5px solid #666666"
            }}
          >
            <thead>
              <tr>
                <td style={{ 
                  border: "0.5px solid #666666", 
                  padding: "8px 10px", 
                  textAlign: "center",
                  backgroundColor: "#d9d9d9",
                  fontWeight: "bold",
                  verticalAlign: "middle"
                }}>NO</td>
                <td style={{ 
                  border: "0.5px solid #666666", 
                  padding: "8px 10px", 
                  textAlign: "center",
                  backgroundColor: "#d9d9d9",
                  fontWeight: "bold",
                  verticalAlign: "middle"
                }}>NAMA BARANG</td>
                <td style={{ 
                  border: "0.5px solid #666666", 
                  padding: "8px 10px", 
                  textAlign: "center",
                  backgroundColor: "#d9d9d9",
                  fontWeight: "bold",
                  verticalAlign: "middle"
                }}>JUMLAH</td>
                <td style={{ 
                  border: "0.5px solid #666666", 
                  padding: "8px 10px", 
                  textAlign: "center",
                  backgroundColor: "#d9d9d9",
                  fontWeight: "bold",
                  verticalAlign: "middle"
                }}>KONDISI</td>
                <td style={{ 
                  border: "0.5px solid #666666", 
                  padding: "8px 10px", 
                  textAlign: "center",
                  backgroundColor: "#d9d9d9",
                  fontWeight: "bold",
                  verticalAlign: "middle"
                }}>RUANGAN</td>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={row.id || index}>
                    <td style={{ 
                      border: "0.5px solid #666666", 
                      padding: "8px 10px", 
                      textAlign: "center",
                      verticalAlign: "middle",
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9"
                    }}>{index + 1}</td>
                    <td style={{ 
                      border: "0.5px solid #666666", 
                      padding: "8px 10px", 
                      textAlign: "left",
                      verticalAlign: "middle",
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9"
                    }}>{row.nabar || '-'}</td>
                    <td style={{ 
                      border: "0.5px solid #666666", 
                      padding: "8px 10px", 
                      textAlign: "center",
                      verticalAlign: "middle",
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9"
                    }}>{row.qty || row.jml || '-'}</td>
                    <td style={{ 
                      border: "0.5px solid #666666", 
                      padding: "8px 10px", 
                      textAlign: "center",
                      verticalAlign: "middle",
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9"
                    }}>{row.kondisi || '-'}</td>
                    <td style={{ 
                      border: "0.5px solid #666666", 
                      padding: "8px 10px", 
                      textAlign: "center",
                      verticalAlign: "middle",
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9"
                    }}>{row.ruangan || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ 
                    border: "0.5px solid #666666", 
                    padding: "8px 10px", 
                    textAlign: "center",
                    verticalAlign: "middle"
                  }}>Belum ada data barang</td>
                </tr>
              )}
            </tbody>
          </table>
          <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
            <tr>
              <td style={{ fontSize: "10px" }}>
                <p style={{ margin: "0" }}>Pihak Pertama,</p>
                <p style={{ margin: "0" }}></p>
                <br/>
                <br/>
                <br/>
                <p style={{ margin: "0" }}>{kasar?.nama || dataDetail.team_name || '_________________'}</p>
                <p style={{ margin: "0" }}>Nip. {kasar?.kode || ''}</p>
              </td>
              <td style={{ width: "50%" }}></td>
              <td style={{ fontSize: "10px" }}>
                <p style={{ margin: "0" }}>Makassar, {dayjs(dataDetail.tgl).locale("id").format("D MMMM YYYY")}</p>
                <p style={{ margin: "0" }}>Pihak Kedua</p>
                <br/>
                <br/>
                <br/>
                <p style={{ margin: "0" }}>{dataDetail.penerima || '_________________'}</p>
                <p style={{ margin: "0", marginBottom: "4px" }}>Nip. {dataDetail.nip || ''}</p>
              </td>
            </tr>
            <tr>
              <td></td>
              <td style={{ textAlign: "center", fontSize: "10px" }}>
                Mengetahui,
                <br/>
                WAKA IT,LAB & SARPRA 
                <br/>
                <br/>
                <br/>
                <br/>
                <p style={{ margin: "0" }}>{waka?.nama || '_________________'}</p>
                <p style={{ margin: "0", marginBottom: "4px", marginRight: "48px" }}>Nip.{waka?.kode || waka?.nip || ''}</p>
              </td>
              <td></td>
            </tr>
          </table>
        </div>
      </div>
    );
  };

  const options = {
    filename: `iso_serah_terimah_barang_${dataDetail?.tgl ? dayjs(dataDetail.tgl).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')}.pdf`,
    margin: 0.1,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    },
    jsPDF: {
      unit: "in",
      format: "A4",
      orientation: "portrait",
    },
  };

  const handlePrint = () => {
    if (!dataDetail) {
      alert('Data tidak tersedia');
      return;
    }

    const printContainer = document.createElement("div");
    const root = ReactDOM.createRoot(printContainer);
    root.render(pdfJsx());
    document.body.appendChild(printContainer);
    html2pdf()
      .set(options)
      .from(printContainer)
      .save()
      .then(() => {
        root.unmount();
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
        root.unmount();
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
        alert('Terjadi kesalahan saat membuat PDF: ' + (error.message || 'Unknown error'));
      });
  };

  if (!dataDetail) {
    return null;
  }

  return (
    <>
      <button
        onClick={handlePrint}
        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download
      </button>
    </>
  );
}
