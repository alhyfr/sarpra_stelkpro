'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ABreadcrumbs from '@/components/Abreadcrumbs';
import ATable from '@/components/Atable';
import dayjs from 'dayjs';
import { Download, Plus } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/app/utils/Api';
import DeleteModal from '@/components/Delete';
import DataPdf from './DataPdf';
import TambahList from './TambahList';
import ImageView from '@/components/ImageView'
const STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE || ''

export default function List() {
  const params = useParams();
  const id = params?.list;
  const [dataDetail, setDataDetail] = useState(null); // Data detail serah-terima
  const [dataTable, setDataTable] = useState([]); // Data untuk tabel (array)
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State untuk modal
  const [editingItem, setEditingItem] = useState(null); // State untuk data yang akan diedit
  const [isEditMode, setIsEditMode] = useState(false); // State untuk mode edit
  const [deletingItem, setDeletingItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageView, setShowImageView] = useState(false);

  const getImageUrl = (filename) => {
    if (!filename) return null
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename
    }
    if (filename.startsWith('/')) {
        return `${STORAGE_URL}${filename}`
    }
    return `${STORAGE_URL}/${filename}`
  }

  const handleViewImage = (item) => {
    const imageUrl = getImageUrl(item.foto)
    if (imageUrl) {
        setSelectedImage({
            url: imageUrl,
            title: item.nabar || 'Foto Barang',
            description: `${item.ruangan || ''} - ${item.kondisi || ''}`
        })
        setShowImageView(true)
    }
  }

  const getSertiDetail = async () => {
    try {
      const response = await api.get(`/sp/serti-detail/${id}`);
      if (response.data.status === 'success' || response.data.message === 'success') {
        // Berdasarkan log: response.data.data adalah array detail
        // response.data.detail adalah data utama
        const responseData = response.data.data;
        const responseDetail = response.data.detail;
        
        // response.data.data adalah array detail → set ke dataTable
        if (Array.isArray(responseData)) {
          setDataTable(responseData);
        }
        
        // response.data.detail adalah data utama → set ke dataDetail
        if (responseDetail && !Array.isArray(responseDetail)) {
          setDataDetail(responseDetail);
        }
        
        // Jika dataDetail masih null, coba ambil dari sessionStorage
        if (!responseDetail || Array.isArray(responseDetail)) {
          const storedData = sessionStorage.getItem(`serah_terima_${id}`);
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              setDataDetail(parsedData);
            } catch (error) {
              console.error('Error parsing stored data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
    }
  };

  const postSertiData = async (form) => {
    try {
      let response;
      
      // Jika form adalah FormData, jangan set Content-Type - biarkan axios otomatis set dengan boundary
      // Jika bukan FormData, gunakan application/json
      const config = form instanceof FormData 
        ? {
            // Jangan set Content-Type untuk FormData - axios akan otomatis set multipart/form-data dengan boundary
            // Hapus Content-Type default dari Api instance dengan set ke undefined
            headers: {
              'Content-Type': undefined,
            }
          }
        : {
            headers: {
              'Content-Type': 'application/json',
            }
          };
      
      // Check if we have editingItem to determine if it's update or create
      if (editingItem && editingItem.id) {
        // Update existing data
        response = await api.put(`/sp/serti-list/${editingItem.id}`, form, config);
      } else {
        // Create new data
        response = await api.post(`/sp/serti-list/`, form, config);
      }
      
      if (response.data.status === 'success' || response.data.message === 'success') {
        getSertiDetail();
        setShowModal(false);
        setEditingItem(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      console.error('Error posting data:', error);
      // Re-throw error agar bisa ditangani di component
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Terjadi kesalahan saat menyimpan data');
      }
    }
  };
  
  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sp/serti-list/${deletingItem.id}`);
      getSertiDetail();
      setShowDeleteModal(false);
      setDeletingItem(null);
    } catch (error) {
      console.error('Error deleting data:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingItem(null);
    setDeleteLoading(false);
  };

  useEffect(() => {
    if (id) {
      // Ambil data dari sessionStorage
      const storedData = sessionStorage.getItem(`serah_terima_${id}`);
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setDataDetail(parsedData);
          // Untuk sementara data tabel kosong, nanti akan diisi dari API
          setDataTable([]);
        } catch (error) {
          console.error('Error parsing data:', error);
        }
      }
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        await getSertiDetail();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Data Serah Terima</h1>
        <p>Memuat data...</p>
      </div>
    );
  }

  if (!dataDetail) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Data Serah Terima</h1>
        <p className="text-red-500">Data tidak ditemukan</p>
      </div>
    );
  }
 
  return (
    <div className="p-6">
      <ABreadcrumbs
        items={[
          { label: 'Serah Terima', href: '/serah-terima' },
          { label: 'Data Serah Terima', href: `/serah-terima/${dataDetail.id}` }
        ]}
        showHome={true}
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal
            </label>
            <p className="text-gray-900 dark:text-white">
              {dataDetail.tgl ? dayjs(dataDetail.tgl).format('DD-MM-YYYY') : '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Penerima
            </label>
            <p className="text-gray-900 dark:text-white">{dataDetail.penerima || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit
            </label>
            <p className="text-gray-900 dark:text-white">{dataDetail.unit || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jabatan
            </label>
            <p className="text-gray-900 dark:text-white">{dataDetail.jabatan || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Penyerah
            </label>
            <p className="text-gray-900 dark:text-white">{dataDetail.team_name || '-'}</p>
          </div>
        </div>
      </div>
      
      {/* Tabel Detail Serah Terima */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Detail Serah Terima
          </h2>
          <div className="flex items-center gap-2">
            {dataDetail && dataTable && dataTable.length > 0 && (
              <DataPdf data={dataTable} dataDetail={dataDetail} />
            )}
            <button 
              onClick={() => {
                setEditingItem(null);
                setIsEditMode(false);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Barang
            </button>
          </div>
        </div>
        <ATable
          columns={[
            { 
              key: 'id', 
              title: 'NO', 
              dataKey: 'id',
              align: 'center',
              width: '10%',
              render: (value, row, index) => index + 1
            },
            { 
              key: 'nabar', 
              title: 'Nama Barang', 
              dataKey: 'nabar',
              align: 'left',
              wrap: true
            },
            { 
              key: 'jml', 
              title: 'QTY', 
              dataKey: 'jml',
              align: 'center',
              width: '10%'
            },
            {
              key: 'foto',
              title: 'Foto',
              dataKey: 'foto',
              align: 'center',
              width: '10%',
              render: (value, row) => {
                const imageUrl = getImageUrl(value);
                
                // Fallback jika tidak ada foto
                if (!imageUrl) {
                  return (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {row.nabar?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  );
                }
                
                // Tampilkan thumbnail foto
                return (
                  <div
                    className="w-12 h-12 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                    onClick={() => handleViewImage(row)}
                    title="Klik untuk melihat gambar"
                  >
                    <img
                      src={imageUrl}
                      alt={row.nabar || 'Foto Barang'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide image dan tampilkan fallback
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.classList.add('flex', 'items-center', 'justify-center');
                        parent.innerHTML = `<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">${row.nabar?.charAt(0).toUpperCase() || '?'}</span>`;
                      }}
                    />
                  </div>
                );
              }
            },
            {
              key:'aksi',
              title: 'Aksi',
              dataKey: 'aksi',
              align: 'center',
              width: '15%',
              render: (value, row) => (
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={() => handleEdit(row)}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(row)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )
            }
          ]}
          data={dataTable}
          striped={true}
          hover={true}
          emptyText="Belum ada data barang"
        />
      </div>
      
      {/* Modal Tambah/Edit Data */}
      {showModal && (
        <Modal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
            setIsEditMode(false);
          }}
          title={isEditMode ? "Edit Barang" : "Tambah Barang"}
          size="lg"
          closeOnOverlayClick={true}
        >
          <div className="p-4">
            <TambahList
              dataDetail={dataDetail}
              editingItem={editingItem}
              isEditMode={isEditMode}
              onClose={() => {
                setShowModal(false);
                setEditingItem(null);
                setIsEditMode(false);
              }}
              onSuccess={() => {
                setShowModal(false);
                setEditingItem(null);
                setIsEditMode(false);
                getSertiDetail();
              }}
              postSertiData={postSertiData}
              stbar_id={dataDetail?.id}
            />
          </div>
        </Modal>
      )}

      {/* Modal Delete */}
      {showDeleteModal && (
        <DeleteModal
          show={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Konfirmasi Hapus"
          message={`Apakah Anda yakin ingin menghapus barang "${deletingItem?.nabar || ''}"?`}
          itemName={deletingItem?.nabar || ''}
          loading={deleteLoading}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          
        />
      )}
       <ImageView
                show={showImageView}
                onClose={() => {
                    setShowImageView(false)
                    setSelectedImage(null)
                }}
                images={selectedImage?.url}
                title={selectedImage?.title}
                description={selectedImage?.description}
                alt={selectedImage?.title || 'foto'}
            />
    </div>
  );
}
