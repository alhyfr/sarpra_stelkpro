'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ABreadcrumbs from '@/components/Abreadcrumbs';
import ATable from '@/components/Atable';
import dayjs from 'dayjs';
import { Download, Plus } from 'lucide-react';
import TambahData from './tambahData';
import Modal from '@/components/Modal';
import api from '@/app/utils/Api';
import DeleteModal from '@/components/Delete';
import PrintPdf from './PrintPdf';
export default function DataEks() {
  const params = useParams();
  const id = params?.id;
  const [dataDetail, setDataDetail] = useState(null); // Data detail peminjaman
  const [dataTable, setDataTable] = useState([]); // Data untuk tabel (array)
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State untuk modal
  const [editingPinBarEks, setEditingPinBarEks] = useState(null); // State untuk data yang akan diedit
  const [isEditMode, setIsEditMode] = useState(false); // State untuk mode edit
  const [deletingPinBarEks, setDeletingPinBarEks] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getPinBarEks = async () => {
    try {
      const response = await api.get(`/sp/data-pineks/${id}`);
      if (response.data.message === 'success') {
        setDataTable(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }
  const postPinBarEks = async (form) => {
    try {
      let response;
      
      // Check if we have editingPinBarEks to determine if it's update or create
      if (editingPinBarEks && editingPinBarEks.id) {
        // Update existing data
        response = await api.put(`/sp/data-pineks/${editingPinBarEks.id}`, form);
      } else {
        // Create new data
        response = await api.post(`/sp/data-pineks/`, form);
      }
      
      if (response.data.message === 'success') {
        getPinBarEks();
        setShowModal(false);
        setEditingPinBarEks(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      console.error('Error posting data:', error);
      // Re-throw error agar bisa ditangani di TambahData component
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Terjadi kesalahan saat menyimpan data');
      }
    }
  }
  
  const handleEdit = (item) => {
    setEditingPinBarEks(item);
    setIsEditMode(true);
    setShowModal(true);
  }

  const handleDelete = (item) => {
    setDeletingPinBarEks(item);
    setShowDeleteModal(true);
  }
  const handleConfirmDelete = async () => {
    if (!deletingPinBarEks) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sp/data-pineks/${deletingPinBarEks.id}`);
      getPinBarEks();
      setShowDeleteModal(false);
      setDeletingPinBarEks(null);
    } catch (error) {
      console.error('Error deleting data:', error);
    } finally {
      setDeleteLoading(false);
    }
  }
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingPinBarEks(null);
    setDeleteLoading(false);
  }

  useEffect(() => {
    if (id) {
      // Ambil data dari sessionStorage
      const storedData = sessionStorage.getItem(`peminjaman_eksternal_${id}`);
      
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
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
   
    getPinBarEks();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Data Peminjaman Eksternal</h1>
        <p>Memuat data...</p>
      </div>
    );
  }

  if (!dataDetail) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Data Peminjaman Eksternal</h1>
        <p className="text-red-500">Data tidak ditemukan</p>
      </div>
    );
  }
 
  
  return (
    <div className="p-6">
      <ABreadcrumbs
        items={[
          { label: 'Peminjaman Eksternal', href: '/peminjaman/eksternal' },
          { label: 'Data Peminjaman Eksternal', href: `/peminjaman/eksternal/${dataDetail.id}` }
        ]}
        showHome={true}
      />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">{dataDetail.nama || '-'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">NIK: {dataDetail.nik || '-'}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kegiatan
            </label>
            <p className="text-gray-900 dark:text-white">{dataDetail.kegiatan || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tempat
            </label>
            <p className="text-gray-900 dark:text-white">{dataDetail.tempat || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Pinjam
            </label>
            <p className="text-gray-900 dark:text-white">
              {dataDetail.tgl_pinjam ? dayjs(dataDetail.tgl_pinjam).format('DD-MM-YYYY') : '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Kembali
            </label>
            <p className="text-gray-900 dark:text-white">
              {dataDetail.tgl_kembali ? dayjs(dataDetail.tgl_kembali).format('DD-MM-YYYY') : 'Belum kembali'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabel Peminjam Eksternal */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Detail Peminjaman
          </h2>
          <div className="flex items-center gap-2">
            <PrintPdf data={dataTable} dataDetail={dataDetail} />
            <button 
              onClick={() => {
                setEditingPinBarEks(null);
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
              key: 'qty', 
              title: 'QTY', 
              dataKey: 'qty',
              align: 'center',
              width: '10%'
            },
            { 
              key: 'tujuan', 
              title: 'Tujuan', 
              dataKey: 'tujuan',
              align: 'left',
              wrap: true
            },
            {
              key: 'kondisi',
              title: 'Kondisi Barang',
              dataKey: 'kondisi',
              align: 'left',
              wrap: true
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
            setEditingPinBarEks(null);
            setIsEditMode(false);
          }}
          title={isEditMode ? "Edit Barang" : "Tambah Barang"}
          size="lg"
          closeOnOverlayClick={true}
        >
          <TambahData 
            dataDetail={dataDetail}
            editingPinBarEks={editingPinBarEks}
            isEditMode={isEditMode}
            onClose={() => {
              setShowModal(false);
              setEditingPinBarEks(null);
              setIsEditMode(false);
            }}
            onSuccess={() => {
              setShowModal(false);
              setEditingPinBarEks(null);
              setIsEditMode(false);
              getPinBarEks(); // Refresh data tabel
            }}
            postPinBarEks={postPinBarEks}
          />
        </Modal>
      )}

      {/* Modal Delete */}
      {showDeleteModal && (
        <DeleteModal
          show={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Konfirmasi Hapus"
          message={`Apakah Anda yakin ingin menghapus barang "${deletingPinBarEks?.nabar || ''}"?`}
          itemName={deletingPinBarEks?.nabar || ''}
          loading={deleteLoading}
          confirmText="Ya, Hapus"
          cancelText="Batal"
        />
      )}
    </div>
  );
}