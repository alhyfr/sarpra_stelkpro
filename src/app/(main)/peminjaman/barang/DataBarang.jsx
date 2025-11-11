'use client';
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import AddPinbar from "./addPinbar";
import ImageView from '@/components/ImageView'
import dayjs from "dayjs";
import Aswitch from "@/components/Aswitch";
import { useData } from "@/app/context/DataContext";

export default function DataBarang() {
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
  const [editingPinbar, setEditingPinbar] = useState(null); // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingPinbar, setDeletingPinbar] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageView, setShowImageView] = useState(false);
  const getImageUrl = (filename) => {
    if (!filename) return null    
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename
    }    
    const baseURL = process.env.NEXT_PUBLIC_API_STORAGE || 'http://localhost:3002/api/storage/'
    
    if (filename.startsWith('/')) {
      return `${baseURL}${filename}`
    }    
    return `${baseURL}/${filename}`
  } 
  // Handler untuk view image
  const handleViewImage = (item) => {
    const imageUrl = getImageUrl(item.foto)
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        title: item.nabar || 'Foto Peminjaman Barang',
      })
      setShowImageView(true)
    }
  }

  const columns = [
    {
      key: "tgl_pinjam",
      title: "Tanggal Pinjam",
      sortable: true,
      searchable: true,
      filterable: true,
      type: "dateRange",
      format: "DD-MM-YYYY",
      render: (value) => dayjs(value).format("DD-MM-YYYY"),
      filterOptions: [
        { value: "last3Months", label: "3 Bulan Terakhir" },
        { value: "custom", label: "Custom Range" },
      ],
    },
    {
      key:"nabar",
      title: "Nama Barang",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key:"jml",
      title: "jml",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key:"name",
      title: "Nama Peminjam",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key:"kondisi_pinjam",
      title: "Kondisi Pinjam",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key:"peruntukan",
      title: "Peruntukan",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key:"status",
      title: "Status",
      sortable: true,
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: "proses", label: "Pinjam" },
        { value: "selesai", label: "Kembali" },
      ],
      render: (value, item) => (
        <Aswitch
          value={value}
          onChange={(newStatus) => handleStatusChange(item, newStatus)}
          size="sm"
          onValue="proses"
          offValue="selesai"
          showIcons={true}
          labels={{
            on: 'Proses',
            off: 'Selesai'
          }}
        />
      ),

    },
    {
      key:"tgl_kembali",
      title: "Tanggal Kembali",
      sortable: true,
      searchable: true,
      filterable: true,
      type: "dateRange",
      format: "DD-MM-YYYY",
      render: (value) => {
        if (!value || value === "" || value === null) {
          return <span className="text-gray-500 italic">Belum kembali</span>;
        }
        return dayjs(value).format("DD-MM-YYYY");
      },
      
    },
    {
      key:"kondisi_kembali",
      title: "Kondisi Kembali",
      sortable: true,
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: "baik", label: "Baik" },
        { value: "rusak ringan", label: "Rusak Ringan" },
        { value: "rusak berat", label: "Rusak Berat" },
      ],
    },
    {
      key:"ket",
      title: "Keterangan",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key:"foto",
      title: "Foto",
      render: (value, item) => {
        const imageUrl = getImageUrl(value)
        
        if (!imageUrl) {
          return (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {item.nabar?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )
        }
        
        return (
          <div 
            className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
            onClick={() => handleViewImage(item)}
            title="Klik untuk melihat gambar"
          >
            <img
              src={imageUrl}
              alt={item.nabar || 'Foto Peminjaman Barang'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                const parent = e.target.parentElement
                parent.classList.add('flex', 'items-center', 'justify-center', 'dark:bg-gray-700')
                parent.innerHTML = `<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">${item.nabar?.charAt(0).toUpperCase() || '?'}</span>`
              }}
            />
          </div>
        )
      }
    },
    {
      key:"actions",
      title: "Actions",
      sortable: true,
      searchable: true,
      filterable: true,
      type: "actions",
      actions: [
        {
          icon: Edit,
          title: "Edit",
          onClick: (item) => handleEdit(item),
        },
        {
          icon: Trash2,
          title: "Delete",
          onClick: (item) => handleDelete(item),
        },
      ],
    }
  ]
  const getPinbar = async (params = {}, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800))
      const queryParams = new URLSearchParams({
        page: params.page || currentPage,
        per_page: params.per_page || itemsPerPage
      })
      const searchValue = params.search !== undefined ? params.search : searchTerm
      if (searchValue && searchValue.trim() !== '') {
        queryParams.append('search', searchValue)
      }
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value)
          }
        })
      }

      const [response] = await Promise.all([
        api.get(`/sp/pinbar?${queryParams}`),  
        minLoadingTime
      ])
      
      if (response.data.message === 'success') {
        setData(response.data.data)              
        setTotal(response.data.pagination?.total || response.data.data.length)            
        setCurrentPage(response.data.pagination?.current_page || 1)       
        setItemsPerPage(response.data.pagination?.per_page || 10)  
      }
    } catch (error) {
      setData([])
      setTotal(0)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }
  const postPinbar = async (form) => {
    try {
      let response
    
      // Setup config untuk multipart/form-data jika upload file
      const config = form instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {}
      
      // Check if we have editingAtk to determine if it's update or create
      if (editingPinbar && editingPinbar.id) {    
        if (form instanceof FormData) {
          form.append('_method', 'PUT')  // Laravel method spoofing
          response = await api.put(`/sp/pinbar/${editingPinbar.id}`, form, config)
        } else {
          response = await api.put(`/sp/pinbar/${editingPinbar.id}`, form, config)
        }
      } else {
        response = await api.post('/sp/pinbar', form, config)
      }      
      if (response.data.message === 'success') {
        // Refresh data setelah berhasil
        getPinbar()
        setShowAddModal(false)
        setEditingPinbar(null)
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
    setDeletingPinbar(item)
    setShowDeleteModal(true)
  }
  const handleConfirmDelete = async () => {
    if (!deletingPinbar) return

    setDeleteLoading(true)
    try {
      await api.delete(`/sp/pinbar/${deletingPinbar.id}`)  // Fix: gunakan id dari object
      getPinbar()  // Fix: nama function yang benar
      setShowDeleteModal(false)
      setDeletingPinbar(null)  // Fix: nama variable yang benar
    } catch (error) {
      // Error handling untuk delete
    } finally {
      setDeleteLoading(false)
    }
  }
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingPinbar(null)  
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
      const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/pinbar/${id}`))  // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises)
      getPinbar()  
      setShowBulkDeleteModal(false)
      setBulkDeleteIds([])
    } catch (error) {
      // Error handling untuk bulk delete
    } finally {
      setBulkDeleteLoading(false)
    }
  }
  const handleAdd = () => {
    setEditingPinbar(null)  
    setIsEditMode(false)
    setShowAddModal(true)
  }
  const handleEdit = (item) => {
    setEditingPinbar(item)  
    setIsEditMode(true)
    setShowAddModal(true)
  }
  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setEditingPinbar(null)  
    setIsEditMode(false)
  }
  const handleAddSuccess = (newAtk) => {
    getPinbar()  
    setShowAddModal(false)
    setEditingPinbar(null)  
    setIsEditMode(false)
  }
  const handleExport = () => {
    setShowExportModal(true)
  }
  const handleStatusChange = async (item, newStatus) => {
    try {
      await api.put(`/sp/pinbar-status/${item.id}`, {
        status: newStatus,
      });
      getPinbar();
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

    // Fetch data dengan params baru
    getPinbar(params)
  }
  useEffect(() => {
    getPinbar()
  }, [])
  // Subscribe to WebSocket updates
  useEffect(() => {
    const unsubscribe = subscribeWebSocket('pinbarUpdated', () => {
      getPinbar(); // Trigger refresh when pinbar is updated
    });

    return unsubscribe; // Cleanup on unmount
  }, [subscribeWebSocket, getPinbar]);
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
        title="Data Peminjaman Barang"
        subtitle="Kelola data peminjaman barang"
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
        title="Hapus Peminjaman Barang"
        message={`Apakah Anda yakin ingin menghapus "${deletingPinbar?.nabar}"?`}
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
        title="Hapus Multiple Peminjaman Barang"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} Peminjaman Barang?`}
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
        title="Hapus Multiple Peminjaman Barang"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} Peminjaman Barang?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={
            isEditMode ? "Edit Peminjaman Barang" : "Tambah Peminjaman Barang Baru"
          }
          size="xl"
          closeOnOverlayClick={false}
        >
          <AddPinbar
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postPinbar={postPinbar}
            editingPinbar={editingPinbar}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
        <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-Peminjaman-Barang"
        title="Export Data Peminjaman Barang"
      />
      <ImageView
        show={showImageView && selectedImage !== null}
        onClose={() => {
          setShowImageView(false)
          setSelectedImage(null)
        }}
        images={selectedImage?.url}
        title={selectedImage?.title}
        alt={selectedImage?.title || 'Foto Peminjaman Barang'}
      />
    </div>
  )
}