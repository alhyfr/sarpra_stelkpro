'use client';
import { Download } from 'lucide-react';
import dayjs from 'dayjs';
import ReactDOM from 'react-dom/client';
import { useData } from '@/app/context/DataContext';
import { useEffect } from 'react';

export default function PrintPdf({ data = [], dataDetail = null }) {
  const { waka, getWaka } = useData();
  useEffect(() => {
    getWaka();
  }, []);
  const pdfJsx = () => {
    if (!dataDetail) return null;

    return (
      <div style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>
        <div style={{ 
          padding: '25px', 
          maxWidth: '210mm', 
          margin: '0 auto', 
          backgroundColor: '#ffffff', 
          color: '#000000',
          fontSize: '11px',
          lineHeight: '1.5'
        }}>
          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '25px', 
            borderBottom: '2px solid #333', 
            paddingBottom: '12px' 
          }}>
            <h1 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0', 
              color: '#000',
              letterSpacing: '0.5px'
            }}>
              FORMULIR PEMINJAMAN BARANG KEGIATAN EKSTERNAL<br/>
              SMK TELKOM MAKASSAR
            </h1>
          
          </div>

          {/* Data Peminjam */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', color: '#555' }}>
              saya yang bertanda tangan di bawah ini:
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '30%', padding: '6px 0',color: '#333' }}>Nama:</td>
                  <td style={{ padding: '6px 0', color: '#000' }}>{dataDetail.nama || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: '#333' }}>NIK:</td>
                  <td style={{ padding: '6px 0', color: '#000' }}>{dataDetail.nik || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: '#333' }}>Kegiatan:</td>
                  <td style={{ padding: '6px 0', color: '#000' }}>{dataDetail.kegiatan || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: '#333' }}>Tempat:</td>
                  <td style={{ padding: '6px 0', color: '#000' }}>{dataDetail.tempat || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: '#333' }}>Tanggal Pinjam:</td>
                  <td style={{ padding: '6px 0', color: '#000' }}>
                    {dataDetail.tgl_pinjam ? dayjs(dataDetail.tgl_pinjam).format('DD-MM-YYYY') : '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: '#333' }}>Tanggal Kembali:</td>
                  <td style={{ padding: '6px 0', color: '#000' }}>
                    {dataDetail.tgl_kembali 
                      ? dayjs(dataDetail.tgl_kembali).format('DD-MM-YYYY') 
                      : 'Belum kembali'}
                  </td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: '11px', color: '#555' }}>
                menyatakan bertanggung jawab sepenuhnya atas barang yang dipinjam dan akan mengembalikannya tepat waktu.apabila terjadi kerusakan atau kehilangan barang, saya bersedia mengikuti aturan yang berlaku.
                adapun list barang yang dipinjam adalah sebagai berikut:
            </p>
          </div>

          {/* Daftar Barang */}
          <div style={{ marginBottom: '10px' }}>

            {data && data.length > 0 ? (
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                border: '0.5px solid #666',
                fontSize: '11px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f8f8', verticalAlign: 'middle' }}>
                    <th style={{ 
                      border: '0.5px solid #666', 
                      padding: '8px 6px', 
                      textAlign: 'center', 
                      fontWeight: 'bold',
                      fontSize: '11px',
                      color: '#333',
                      verticalAlign: 'middle'
                    }}>No</th>
                    <th style={{ 
                      border: '0.5px solid #666', 
                      padding: '8px 6px', 
                      textAlign: 'left', 
                      fontWeight: 'bold',
                      fontSize: '11px',
                      color: '#333',
                      verticalAlign: 'middle'
                    }}>Nama Barang</th>
                    <th style={{ 
                      border: '0.5px solid #666', 
                      padding: '8px 6px', 
                      textAlign: 'center', 
                      fontWeight: 'bold',
                      fontSize: '11px',
                      color: '#333',
                      verticalAlign: 'middle'
                    }}>QTY</th>
                    <th style={{ 
                      border: '0.5px solid #666', 
                      padding: '8px 6px', 
                      textAlign: 'left', 
                      fontWeight: 'bold',
                      fontSize: '11px',
                      color: '#333',
                      verticalAlign: 'middle'
                    }}>Tujuan</th>
                    <th style={{ 
                      border: '0.5px solid #666', 
                      padding: '8px 6px', 
                      textAlign: 'left', 
                      fontWeight: 'bold',
                      fontSize: '11px',
                      color: '#333',
                      verticalAlign: 'middle'
                    }}>Kondisi Barang</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id || index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa', verticalAlign: 'middle' }}>
                      <td style={{ 
                        border: '0.5px solid #666', 
                        // padding: '8px 6px', 
                        paddingBottom: '15px',
                        paddingLeft: '8px',
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#000',
                        verticalAlign: 'middle'
                      }}>
                        {index + 1}
                      </td>
                      <td style={{ 
                        border: '0.5px solid #666', 
                        // padding: '8px 6px',
                        paddingBottom: '15px',
                        paddingLeft: '8px',
                        fontSize: '11px',
                        color: '#000',
                        verticalAlign: 'middle'
                      }}>
                        {item.nabar || '-'}
                      </td>
                      <td style={{ 
                        border: '0.5px solid #666', 
                        // padding: '8px 6px', 
                        paddingBottom: '15px',
                        paddingLeft: '8px',
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#000',
                        verticalAlign: 'middle'
                      }}>
                        {item.qty || '-'}
                      </td>
                      <td style={{ 
                        border: '0.5px solid #666', 
                        // padding: '8px 6px',
                        paddingBottom: '15px',
                        paddingLeft: '8px',
                        fontSize: '11px',
                        color: '#000',
                        verticalAlign: 'middle'
                      }}>
                        {item.tujuan || '-'}
                      </td>
                      <td style={{ 
                        border: '0.5px solid #666', 
                        // padding: '8px 6px',
                        paddingBottom: '15px',
                        paddingLeft: '8px',
                        fontSize: '11px',
                        color: '#000',
                        verticalAlign: 'middle'
                      }}>
                        {item.kondisi || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ 
                padding: '15px', 
                textAlign: 'center', 
                color: '#666', 
                fontStyle: 'italic',
                fontSize: '11px'
              }}>
                Belum ada data barang
              </p>
            )}
          </div>
          <p style={{ fontSize: '11px', color: '#555' }}>
            demikian surat ini saya dibuat dengan sebenarnya, mohon agar di tindak lanjuti.
          </p>

          {/* Footer */}
          <div style={{ 
            marginTop: '10px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            paddingTop: '15px', 
            // borderTop: '1px solid #ddd' 
          }}>
            <div style={{ width: '75%' }}>
              <p style={{ margin: '0 0 60px 0', fontSize: '11px', color: '#555' }}>Menyetujui,
                <br/>
                Wakase IT, Lab & Sarpra
              </p>
              <p style={{ margin: '0', fontWeight: 'normal', fontSize: '11px', color: '#000' }}>
                {waka.nama || '_________________'}
                <br/>
                {waka.nip || '_________________'}
              </p>
            </div>
            <div style={{ width: '25%', textAlign: 'left' }}>
              <p style={{ margin: '0 0 60px 0', fontSize: '11px', color: '#555' }}>
                Makassar, {dayjs().format('DD MMMM YYYY')}
              </p>
              <p style={{ margin: '0', fontWeight: 'normal', fontSize: '11px', color: '#000' }}>
                {dataDetail.nama || '_________________'}<br/>
              </p>
              <span style={{ fontSize: '11px', color: '#000', textAlign: 'left !important' }}>
                {dataDetail.nik || '_________________'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const options = {
    filename: `Peminjaman-Eksternal-${dataDetail?.id || 'unknown'}-${dayjs().format('YYYY-MM-DD')}.pdf`,
    margin: [0.5, 0.5, 0.5, 0.5],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      unit: 'in',
      format: 'A4',
      orientation: 'portrait',
    },
  };

  const handleDownload = async () => {
    // Pastikan hanya berjalan di client-side
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      alert('Fitur ini hanya tersedia di browser');
      return;
    }

    if (!dataDetail) {
      alert('Data tidak tersedia');
      return;
    }

    if (!data || data.length === 0) {
      alert('Tidak ada data untuk dicetak');
      return;
    }

    try {
      // Dynamic import html2pdf untuk menghindari error "self is not defined"
      const html2pdf = (await import('html2pdf.js')).default;

      const printContainer = document.createElement('div');
      const root = ReactDOM.createRoot(printContainer);
      root.render(pdfJsx());

      document.body.appendChild(printContainer);

      // Tunggu rendering selesai
      setTimeout(() => {
        try {
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
              if (document.body.contains(printContainer)) {
                root.unmount();
                document.body.removeChild(printContainer);
              }
              alert('Terjadi kesalahan saat membuat PDF: ' + (error.message || 'Unknown error'));
            });
        } catch (error) {
          console.error('Error saat memanggil html2pdf:', error);
          if (document.body.contains(printContainer)) {
            root.unmount();
            document.body.removeChild(printContainer);
          }
          alert('Terjadi kesalahan saat membuat PDF: ' + (error.message || 'Unknown error'));
        }
      }, 500);
    } catch (error) {
      console.error('Error saat memproses data:', error);
      alert('Terjadi kesalahan saat memproses data PDF');
    }
  };

  if (!dataDetail) {
    return null;
  }

  return (
    <button 
      onClick={handleDownload}
      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Download
    </button>
  );
}