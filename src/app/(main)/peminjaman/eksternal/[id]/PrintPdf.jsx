'use client';
import { Download } from 'lucide-react';
import dayjs from 'dayjs';
import ReactDOM from 'react-dom/client';
import { useData } from '@/app/context/DataContext';
import { useEffect } from 'react';
import Logo from '@/assets/logo/logo.png'

export default function PrintPdf({ data = [], dataDetail = null }) {
  const { waka, getWaka } = useData();
  useEffect(() => {
    getWaka();
  }, []);
  const pdfJsx = () => {
    if (!dataDetail) return null;

    return (
      <div style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.5' }}>
        <div style={{
          padding: '30px',
          maxWidth: '210mm',
          margin: '0 auto',
          backgroundColor: '#ffffff'
        }}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '2px solid #e1251b',
            paddingBottom: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img
                src={Logo.src}
                alt="Logo SMK Telkom"
                style={{ width: '100px', height: 'auto', display: 'block' }}
              />
              <div>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#e1251b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  SMK Telkom Makassar
                </h1>
                <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#555', lineHeight: '1.4' }}>
                  Jl. A. P. Pettarani No. 4, Gn. Sari, Kec. Rappocini<br />
                  Kota Makassar, Sulawesi Selatan 90222
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333', textTransform: 'uppercase' }}>
                Formulir Peminjaman
              </h2>
              <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#777', lineHeight: '1.4' }}>
                No. Dok: {dataDetail?.id ? String(dataDetail.id).padStart(6, '0') : '______'}<br />
                Tgl Cetak: {dayjs().format('DD/MM/YYYY')}
              </p>
            </div>
          </div>

          {/* Title Context */}
          <div style={{ marginBottom: '25px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textDecoration: 'underline', margin: '0 0 5px', color: '#000' }}>
              BERITA ACARA PEMINJAMAN BARANG
            </h3>
            {/* <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>
              KEGIATAN EKSTERNAL
            </p> */}
          </div>

          {/* Data Peminjam */}
          <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '11px', color: '#333', marginBottom: '10px', fontWeight: 'bold' }}>
              Detail Peminjam:
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '25%', padding: '4px 0', color: '#555' }}>Nama Lengkap</td>
                  <td style={{ width: '2%', padding: '4px 0', color: '#555' }}>:</td>
                  <td style={{ padding: '4px 0', color: '#000', fontWeight: 'bold' }}>{dataDetail.nama || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: '#555' }}>Nomor Induk Pegawai</td>
                  <td style={{ padding: '4px 0', color: '#555' }}>:</td>
                  <td style={{ padding: '4px 0', color: '#000' }}>{dataDetail.nik || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: '#555' }}>Kegiatan</td>
                  <td style={{ padding: '4px 0', color: '#555' }}>:</td>
                  <td style={{ padding: '4px 0', color: '#000' }}>{dataDetail.kegiatan || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: '#555' }}>Tempat Pelaksanaan</td>
                  <td style={{ padding: '4px 0', color: '#555' }}>:</td>
                  <td style={{ padding: '4px 0', color: '#000' }}>{dataDetail.tempat || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: '#555' }}>Durasi Peminjaman</td>
                  <td style={{ padding: '4px 0', color: '#555' }}>:</td>
                  <td style={{ padding: '4px 0', color: '#000' }}>
                    {dataDetail.tgl_pinjam ? dayjs(dataDetail.tgl_pinjam).format('DD MMM YYYY') : '-'}
                    <span style={{ margin: '0 5px' }}>s/d</span>
                    {dataDetail.tgl_kembali ? dayjs(dataDetail.tgl_kembali).format('DD MMM YYYY') : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '11px', color: '#333', marginBottom: '10px', lineHeight: '1.6' }}>
            Dengan ini saya menyatakan bertanggung jawab sepenuhnya atas barang-barang yang dipinjam di bawah ini.
            Apabila terjadi kerusakan atau kehilangan, saya bersedia mengganti sesuai dengan ketentuan yang berlaku di SMK Telkom Makassar.
          </p>

          {/* Daftar Barang */}
          <div style={{ marginBottom: '30px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '11px',
              border: '1px solid #ddd'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f0f0ff', color: '#6a6767ff' }}>
                  <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '5%', textAlign: 'center' }}>No</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #ddd', textAlign: 'left' }}>Nama Barang</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '10%', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '25%', textAlign: 'left' }}>Tujuan</th>
                  <th style={{ padding: '10px 8px', border: '1px solid #ddd', width: '20%', textAlign: 'left' }}>Kondisi Awal</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={item.id || index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.nabar || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{item.qty || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.tujuan || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.kondisi || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                      Tidak ada data barang yang dipinjam.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginTop: '40px'
          }}>
            <div style={{ textAlign: 'center', width: '40%' }}>
              <p style={{ margin: '0 0 60px 0', color: '#555' }}>Menyetujui,<br /><strong>Wakase IT, Lab & Sarpra</strong></p>
              <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', color: '#000' }}>
                {waka.nama || '(....................................)'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#555' }}>
                NIP. {waka.nip || '....................................'}
              </p>
            </div>

            <div style={{ textAlign: 'center', width: '40%' }}>
              <p style={{ margin: '0 0 60px 0', color: '#555' }}>
                Makassar, {dayjs().format('DD MMMM YYYY')}<br />
                <strong>Peminjam</strong>
              </p>
              <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', color: '#000' }}>
                {dataDetail.nama || '(....................................)'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#555' }}>
                {dataDetail.nik ? `NIK/NIS. ${dataDetail.nik}` : '(....................................)'}
              </p>
            </div>
          </div>
        </div>

        {/* Page Break */}
        <div style={{ pageBreakAfter: 'always' }}></div>

        {/* Page 2 - Checklist Kondisi Barang */}
        <div style={{
          padding: '30px',
          maxWidth: '210mm',
          margin: '0 auto',
          backgroundColor: '#ffffff'
        }}>
          {/* Header Section - Page 2 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '2px solid #e1251b',
            paddingBottom: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img
                src={Logo.src}
                alt="Logo SMK Telkom"
                style={{ width: '100px', height: 'auto', display: 'block' }}
              />
              <div>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#e1251b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  SMK Telkom Makassar
                </h1>
                <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#555', lineHeight: '1.4' }}>
                  Jl. A. P. Pettarani No. 4, Gn. Sari, Kec. Rappocini<br />
                  Kota Makassar, Sulawesi Selatan 90222
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333', textTransform: 'uppercase' }}>
                Checklist Kondisi Barang
              </h2>
              <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#777', lineHeight: '1.4' }}>
                No. Dok: {dataDetail?.id ? String(dataDetail.id).padStart(6, '0') : '______'}<br />
                Halaman: 2
              </p>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textDecoration: 'underline', margin: '0 0 5px', color: '#000' }}>
              CHECKLIST KONDISI BARANG
            </h3>
            <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>
              Peminjaman - {dataDetail.kegiatan || '-'}
            </p>
          </div>

          {/* Checklist Table */}
          <div style={{ marginBottom: '30px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '10px',
              fontFamily: 'Arial, sans-serif',
              border: '0.5px solid #888'
            }}>
              <thead>
                <tr style={{ color: '#000' }}>
                  <th rowSpan="2" style={{ padding: '8px', border: '0.5px solid #888', width: '5%', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>No</th>
                  <th rowSpan="2" style={{ padding: '8px', border: '0.5px solid #888', width: '25%', textAlign: 'left', verticalAlign: 'middle', fontWeight: 'bold' }}>Nama Barang</th>
                  <th rowSpan="2" style={{ padding: '8px', border: '0.5px solid #888', width: '5%', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>Qty</th>
                  <th colSpan="4" style={{ padding: '8px', border: '0.5px solid #888', textAlign: 'center', fontWeight: 'bold' }}>Kondisi Saat Dipinjam</th>
                  <th colSpan="4" style={{ padding: '8px', border: '0.5px solid #888', textAlign: 'center', fontWeight: 'bold' }}>Kondisi Saat Dikembalikan</th>
                  <th rowSpan="2" style={{ padding: '8px', border: '0.5px solid #888', width: '15%', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>Keterangan</th>
                </tr>
                <tr style={{ color: '#000' }}>
                  <th style={{ padding: '6px 2px', border: '0.5px solid #888', width: '6%', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>Baik</th>
                  <th style={{ padding: '6px 2px', border: '0.5px solid #888', width: '6%', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>Rusak<br />Ringan</th>
                  <th style={{ padding: '6px 2px', border: '0.5px solid #888', width: '6%', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>Rusak<br />Berat</th>
                  <th style={{ padding: '6px 2px', border: '0.5px solid #888', width: '6%', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>Hilang</th>
                  <th style={{ padding: '6px 2px', border: '0.5px solid #888', width: '6%', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>Baik</th>
                  <th style={{ padding: '6px 2px', border: '0.5px solid #888', width: '6%', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>Rusak<br />Ringan</th>
                  <th style={{ padding: '6px 2px', border: '0.5px solid #888', width: '6%', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>Rusak<br />Berat</th>
                  <th style={{ padding: '6px 2px', border: '0.5px solid #888', width: '6%', textAlign: 'center', fontSize: '9px', fontWeight: 'bold' }}>Hilang</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={item.id || index}>
                      <td style={{ padding: '10px', border: '0.5px solid #888', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ padding: '10px', border: '0.5px solid #888' }}>{item.nabar || '-'}</td>
                      <td style={{ padding: '10px', border: '0.5px solid #888', textAlign: 'center' }}>{item.qty || '-'}</td>

                      {/* Checkboxes - Dipinjam */}
                      {[...Array(4)].map((_, i) => (
                        <td key={`pinjam-${i}`} style={{ padding: '8px', border: '0.5px solid #888', textAlign: 'center' }}>
                          <div style={{ width: '12px', height: '12px', border: '0.5px solid #888', margin: '0 auto' }}></div>
                        </td>
                      ))}

                      {/* Checkboxes - Dikembalikan */}
                      {[...Array(4)].map((_, i) => (
                        <td key={`kembali-${i}`} style={{ padding: '8px', border: '0.5px solid #888', textAlign: 'center' }}>
                          <div style={{ width: '12px', height: '12px', border: '0.5px solid #888', margin: '0 auto' }}></div>
                        </td>
                      ))}

                      <td style={{ padding: '10px', border: '0.5px solid #888' }}></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" style={{ padding: '20px', textAlign: 'center', color: '#000', fontStyle: 'italic', border: '0.5px solid #888' }}>
                      Tidak ada data barang yang dipinjam.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: '25px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #ddd' }}>
            <p style={{ fontSize: '10px', color: '#333', margin: '0 0 8px', fontWeight: 'bold' }}>Petunjuk Pengisian:</p>
            <ul style={{ fontSize: '10px', color: '#555', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Beri tanda centang (✓) pada kolom kondisi yang sesuai</li>
              <li>Kolom "Kondisi Saat Dipinjam" diisi oleh petugas saat penyerahan barang</li>
              <li>Kolom "Kondisi Saat Dikembalikan" diisi oleh petugas saat penerimaan barang kembali</li>
              <li>Kolom "Keterangan" diisi jika ada catatan khusus terkait kondisi barang</li>
            </ul>
          </div>

          {/* Signatures - Page 2 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '30px'
          }}>
            <div style={{ textAlign: 'center', width: '30%' }}>
              <p style={{ margin: '0 0 60px 0', fontSize: '10px', color: '#555' }}>
                Petugas Penyerahan<br />
                <strong>({dayjs(dataDetail.tgl_pinjam).format('DD/MM/YYYY')})</strong>
              </p>
              <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', color: '#000', fontSize: '11px' }}>
                (...................................)
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '9px', color: '#555' }}>
                NIP. ............................
              </p>
            </div>

            <div style={{ textAlign: 'center', width: '30%' }}>
              <p style={{ margin: '0 0 60px 0', fontSize: '10px', color: '#555' }}>
                Peminjam<br />
                <strong>({dayjs(dataDetail.tgl_pinjam).format('DD/MM/YYYY')})</strong>
              </p>
              <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', color: '#000', fontSize: '11px' }}>
                {dataDetail.nama || '(...................................)'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '9px', color: '#555' }}>
                {dataDetail.nik ? `NIK/NIS. ${dataDetail.nik}` : 'NIK/NIS. ............................'}
              </p>
            </div>

            <div style={{ textAlign: 'center', width: '30%' }}>
              <p style={{ margin: '0 0 60px 0', fontSize: '10px', color: '#555' }}>
                Petugas Penerimaan<br />
                <strong>({dataDetail.tgl_kembali ? dayjs(dataDetail.tgl_kembali).format('DD/MM/YYYY') : '....../....../......'})</strong>
              </p>
              <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', color: '#000', fontSize: '11px' }}>
                (...................................)
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '9px', color: '#555' }}>
                NIP. ............................
              </p>
            </div>
          </div>

          {/* Footer Note */}
          {/* <div style={{
            marginTop: '40px',
            borderTop: '1px solid #eee',
            paddingTop: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            color: '#aaa',
            fontSize: '9px',
            fontStyle: 'italic'
          }}>
            <span>Dicetak melalui Sistem Informasi Peminjaman (SIP)</span>
            <span>SMK Telkom Makassar - {dayjs().format('YYYY')}</span>
          </div> */}
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