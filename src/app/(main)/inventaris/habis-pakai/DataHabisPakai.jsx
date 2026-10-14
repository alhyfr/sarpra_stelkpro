"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import TambahHabis from "./TambahHabis";
import { useData } from "@/app/context/DataContext";
import ImageView from "@/components/ImageView";
import dayjs from "dayjs";
import { getStorageUrl } from '@/helper/storageUrl'

// Storage URL dari environment variable
const STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE || "";
export default function DataHabisPakai() {
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
  const [editingHabis, setEditingHabis] = useState(null); // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingHabis, setDeletingHabis] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImageView, setShowImageView] = useState(false); // Image viewer modal
  const [selectedImage, setSelectedImage] = useState(null);
  const{satuan, getOpsi,kategoriAset} = useData();

  // Helper function untuk get full image URL
  const getImageUrl = (filename) => getStorageUrl(filename)
  const postHabisPakai = async (form) => {
    try {
      let response
    
      // Setup config untuk multipart/form-data jika upload file
      const config = form instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {}
      
      // Check if we have editingHabis to determine if it's update or create
      if (editingHabis && editingHabis.id) {    
        if (form instanceof FormData) {
          form.append('_method', 'PUT')  // Laravel method spoofing
          response = await api.put(`/sp/habis-pakai/${editingHabis.id}`, form, config)
        } else {
          response = await api.put(`/sp/habis-pakai/${editingHabis.id}`, form, config)
        }
      } else {
        response = await api.post('/sp/habis-pakai', form, config)
      }      
      if (response.data.message === 'success') {
        // Refresh data setelah berhasil
        getHabisPakai()
        setShowAddModal(false)
        setEditingHabis(null)
        setIsEditMode(false)
        return response.data
      }
    } catch (error) {
      // Re-throw error agar bisa ditangani di TambahHabis component
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
    setDeletingHabis(item)
    setShowDeleteModal(true)
  }
  const handleConfirmDelete = async () => {
    if (!deletingHabis) return

    setDeleteLoading(true)
    try {
      await api.delete(`/sp/habis-pakai/${deletingHabis.id}`)  // Fix: gunakan id dari object
      // Refresh data after delete
      getHabisPakai()  // Fix: nama function yang benar
      setShowDeleteModal(false)
      setDeletingHabis(null)  // Fix: nama variable yang benar
    } catch (error) {
      console.error('Error deleting Habis Pakai:', error)  // Fix: pesan error
    } finally {
      setDeleteLoading(false)
    }
  }
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingHabis(null)  
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
      const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/habis-pakai/${id}`))  // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises)
      getHabisPakai()  
      setShowBulkDeleteModal(false)
      setBulkDeleteIds([])
    } catch (error) {
      console.error('Error bulk deleting Habis Pakai :', error)  
    } finally {
      setBulkDeleteLoading(false)
    }
  }
  const handleAdd = () => {
    setEditingHabis(null)  
    setIsEditMode(false)
    setShowAddModal(true)
  }
  const handleEdit = (item) => {
    setEditingHabis(item)  
    setIsEditMode(true)
    setShowAddModal(true)
  }
  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setEditingHabis(null)  
    setIsEditMode(false)
  }
  const handleAddSuccess = (newHabis) => {
    getHabisPakai()  
    setShowAddModal(false)
    setEditingHabis(null)  
    setIsEditMode(false)
  }
  const handleExport = () => {
    setShowExportModal(true)
  }
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

    // Fetch data dengan params baru
    getHabisPakai(params)
  }
  useEffect(() => {
    getHabisPakai()
    getOpsi()
  }, [])
 
  return <>
  <DataTable
        // Data & Loading
        data={data}
        total={total}
        loading={loading}
        
        // Columns Configuration
        columns={columns}
        
        // Search & Filter
        searchable={true}
        filterable={true}
        sortable={true}
        
        // Selection & Actions
        selectable={true}
        onAdd={handleAdd}
        onExport={handleExport}
        onBulkDelete={handleBulkDelete}
        
        // Pagination
        pagination={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        
        // Title
        title="Data Barang Habis Pakai"
        subtitle="Kelola data barang habis pakai"
        
        // Server-side Mode (PENTING!)
        serverSide={true}
        onDataChange={handleDataChange}  // ⚡ INI YANG PENTING - menghubungkan search/filter dengan API
        
        // Controlled State (sync dengan parent)
        currentPage={currentPage}
        currentItemsPerPage={itemsPerPage}
        currentSearch={searchTerm}
        currentFilters={filters}
        currentSortField={sortField}
        currentSortDirection={sortDirection}
      />
      {/* Modal Delete Single */}
      <DeleteModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Barang Habis Pakai"
        message={`Apakah Anda yakin ingin menghapus  "${deletingHabis?.nabar}"?`}
        loading={deleteLoading}
        size="sm"
      />
       {/* Modal Delete Multiple */}
       <DeleteModal
        show={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false)
          setBulkDeleteIds([])
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Multiple Barang Habis Pakai"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} barang habis pakai?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
       {/* Modal Add/Edit */}
       {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? 'Edit Barang Habis Pakai' : 'Tambah Barang Habis Pakai Baru'}
          size="lg"
          closeOnOverlayClick={false}
        >
          <TambahHabis
          onClose={handleCloseAddModal}
          onSuccess={handleAddSuccess}
          postHabisPakai={postHabisPakai}
          editingHabis={editingHabis}
          isEditMode={isEditMode}
          />
        </Modal>
        
      )}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-habis-pakai"
        title="Export Data Barang Habis Pakai"
      />
      <ImageView
        show={showImageView}
        onClose={() => {
          setShowImageView(false)
          setSelectedImage(null)
        }}
        images={selectedImage?.url}
        title={selectedImage?.title}
        description={selectedImage?.description}
        alt={selectedImage?.title || 'Barang Habis Pakai Photo'}
      />
  </>;
}
