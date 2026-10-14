"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import ImageView from "@/components/ImageView";
import dayjs from "dayjs";
import Aswitch from "@/components/Aswitch";
import { useData } from "@/app/context/DataContext";
import AddPaset from "./AddPaset";
import { getStorageUrl } from '@/helper/storageUrl'
export default function DataAset() {
  const { subscribeWebSocket } = useData();
  const [data, setData] = useState([]); // Data yang ditampilkan di table
  const [total, setTotal] = useState(0); // Total data dari server (untuk pagination)
  const [loading, setLoading] = useState(false); // Loading state saat fetch data
  const [currentPage, setCurrentPage] = useState(1); // Halaman aktif
  const [itemsPerPage, setItemsPerPage] = useState(10); // Jumlah item per halaman
  const [searchTerm, setSearchTerm] = useState(""); // Kata kunci pencarian
  const [sortField, setSortField] = useState(""); // Field yang di-sort
  const [sortDirection, setSortDirection] = useState("asc"); // Arah sorting (asc/desc)
  const [filters, setFilters] = useState({});
  const [showAddModal, setShowAddModal] = useState(false); // Modal tambah/edit data
  const [editingPaset, setEditingPaset] = useState(null); // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingPaset, setDeletingPaset] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageView, setShowImageView] = useState(false);
  const getImageUrl = (filename) => getStorageUrl(filename)
  const postPaset = async (form) => {
    try {
      let response

      // Setup config untuk multipart/form-data jika upload file
      const config = form instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {}

      // Check if we have editingAtk to determine if it's update or create
      if (editingPaset && editingPaset.id) {
        if (form instanceof FormData) {
          form.append('_method', 'PUT')  // Laravel method spoofing
          response = await api.put(`/sp/perbaikan-aset/${editingPaset.id}`, form, config)
        } else {
          response = await api.put(`/sp/perbaikan-aset/${editingPaset.id}`, form, config)
        }
      } else {
        response = await api.post('/sp/perbaikan-aset', form, config)
      }
      if (response.data.status === 'success') {
        // Refresh data setelah berhasil
        getPaset()
        setShowAddModal(false)
        setEditingPaset(null)
        setIsEditMode(false)
        return response.data
      }
    } catch (error) {
      // Re-throw error agar bisa ditangani di TambahAtk component
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.message) {
        throw error
      } else {
        throw new Error('Terjadi kesalahan saat menyimpan data')
      }
    }
  }
  const handleDelete = (item) => {
    setDeletingPaset(item)
    setShowDeleteModal(true)
  }
  const handleConfirmDelete = async () => {
    if (!deletingPaset) return

    setDeleteLoading(true)
    try {
      await api.delete(`/sp/perbaikan-aset/${deletingPaset.id}`)  // Fix: gunakan id dari object
      getPaset()  // Fix: nama function yang benar
      setShowDeleteModal(false)
      setDeletingPaset(null)  // Fix: nama variable yang benar
    } catch (error) {
      // Error handling untuk delete
    } finally {
      setDeleteLoading(false)
    }
  }
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingPaset(null)
    setDeleteLoading(false)
  }
  const handleBulkDelete = (selectedIds) => {
    setBulkDeleteIds(selectedIds)
    setShowBulkDeleteModal(true)
  }
  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return
    setBulkDeleteLoading(true)
    try {
      // Delete multiple users
      const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/perbaikan-aset/${id}`))  // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises)
      getPaset()
      setShowBulkDeleteModal(false)
      setBulkDeleteIds([])
    } catch (error) {
      // Error handling untuk bulk delete
    } finally {
      setBulkDeleteLoading(false)
    }
  }
  const handleAdd = () => {
    setEditingPaset(null)
    setIsEditMode(false)
    setShowAddModal(true)
  }
  const handleEdit = (item) => {
    setEditingPaset(item)
    setIsEditMode(true)
    setShowAddModal(true)
  }
  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setEditingPaset(null)
    setIsEditMode(false)
  }
  const handleAddSuccess = (newPaset) => {
    getPaset()
    setShowAddModal(false)
    setEditingPaset(null)
    setIsEditMode(false)
  }
  const handleExport = () => {
    setShowExportModal(true)
  }
  const handleStatusChange = async (item, newStatus) => {
    try {
      await api.put(`/sp/perbaikan-barang-status/${item.id}`, {
        status: newStatus,
      });
      getPaset();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const handleDataChange = (params) => {
    // Update state berdasarkan perubahan dari DataTable
    if (params.page !== undefined) {
      setCurrentPage(params.page)
    }
    if (params.per_page !== undefined) {
      setItemsPerPage(params.per_page)
    }
    if (params.search !== undefined) {
      setSearchTerm(params.search)
    }
    if (params.filters !== undefined) {
      setFilters(params.filters)
    }
    if (params.sortField !== undefined) {
      setSortField(params.sortField)
    }
    if (params.sortDirection !== undefined) {
      setSortDirection(params.sortDirection)
    }

    // Fetch data dengan params yang dikirimkan dari DataTable
    // getPaset will use params if provided, otherwise fallback to current state
    getPaset(params)
  }
  useEffect(() => {
    getPaset()
  }, [])

  return (
    <div>
      <DataTable
        data={data}
        total={total}
        loading={loading}
        columns={columns}
        searchable={true}
        filterable={true}
        sortable={true}
        selectable={true}
        onAdd={handleAdd}
        onExport={handleExport}
        onBulkDelete={handleBulkDelete}
        pagination={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        title="Data Perbaikan Aset"
        subtitle="Kelola data perbaikan aset"
        serverSide={true}
        onDataChange={handleDataChange}
        currentPage={currentPage}
        currentItemsPerPage={itemsPerPage}
        currentSearch={searchTerm}
        currentFilters={filters}
        currentSortField={sortField}
        currentSortDirection={sortDirection}
      />
      <DeleteModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Perbaikan Aset"
        message={`Apakah Anda yakin ingin menghapus "${deletingPaset?.kode}"?`}
        loading={deleteLoading}
        size="sm"
      />
      <DeleteModal
        show={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Multiple Perbaikan Aset"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} Perbaikan Aset?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      <DeleteModal
        show={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Multiple Perbaikan Aset"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} Perbaikan Aset?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={
            isEditMode ? "Edit Perbaikan Aset" : "Tambah Perbaikan Aset Baru"
          }
          size="xl"
          closeOnOverlayClick={false}
        >
          <AddPaset
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postPaset={postPaset}
            editingPaset={editingPaset}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-perbaikan-aset"
        title="Export Data Perbaikan Aset"
      />
      <ImageView
        show={showImageView && selectedImage !== null}
        onClose={() => {
          setShowImageView(false)
          setSelectedImage(null)
        }}
        images={selectedImage?.url}
        title={selectedImage?.title}
        alt={selectedImage?.title || 'Foto Perbaikan Aset'}
      />

    </div>
  );
}
