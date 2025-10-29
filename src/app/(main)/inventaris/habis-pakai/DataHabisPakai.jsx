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
  const getImageUrl = (filename) => {
    if (!filename) return null;
    // Jika sudah full URL (http/https), return as is
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
      return filename;
    }
    // Jika relative path, gabungkan dengan STORAGE_URL
    if (filename.startsWith("/")) {
      return `${STORAGE_URL}${filename}`;
    }
    // Jika hanya filename, gabungkan dengan STORAGE_URL
    return `${STORAGE_URL}/${filename}`;
  };
  // Handler untuk view image
  const handleViewImage = (item) => {
    const imageUrl = getImageUrl(item.foto);
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        title: item.nabar,
      });
      setShowImageView(true);
    }
  };
  const columns = [
    {
        key: 'kode',
        title: 'KODE',
        searchable: true,
        filterable: true,
    },
    {
        key: 'nabar',
        title: 'NAMA BARANG',
        searchable: true,
        filterable: true,
    },
    {
        key: 'deskripsi',
        title: 'DESKRIPSI',
        searchable: true,
        filterable: true,
    },
    {
        key:'tgl',
        title: 'TANGGAL MASUK',
        searchable: true,
        filterable: true,
        type: 'dateRange',
        format: 'DD-MM-YYYY',
        render: (value) => dayjs(value).format('DD-MM-YYYY'),
        filterOptions: [
          { 
            value: "last3Months", 
            label: "3 Bulan Terakhir",
            getValue: () => {
              const threeMonthsAgo = dayjs().subtract(3, 'month').startOf('month').format("YYYY-MM-DD");
              const today = dayjs().format("YYYY-MM-DD");
              return `${threeMonthsAgo},${today}`;
            }
          },
          { 
            value: "custom", 
            label: "Custom Range",
            isCustomRange: true
          }
        ],
    },
    {
        key: 'stok',
        title: 'STOK',
        searchable: true,
        filterable: true,
    },
    {
        key: 'lokasi_penyimpanan',
        title: 'LOKASI PENYIMPANAN',
        searchable: true,
        filterable: true,
    },
    {
        key: 'harga',
        title: 'HARGA',
        searchable: true,
        filterable: true,
    },
    {
        key: 'satuan',
        title: 'SATUAN',
        searchable: true,
        filterable: true,
        filter: (value) => value.satuan,
        filterOptions: satuan.map((item) => ({
            value: item.satuan,
            label: item.satuan,
        })),
    },
    {
        key: 'kategori',
        title: 'KATEGORI',
        searchable: true,
        filterable: true,
        filter: (value) => value.kategori,
        filterOptions: kategoriAset.map((item) => ({
            value: item.kategori,
            label: item.kategori,
        })),
    },
    {
        key: 'foto',
        title: 'FOTO',
        searchable: true,
        filterable: true,
        render: (value, item) => {
          const imageUrl = getImageUrl(value)
          
          // Fallback component untuk menampilkan initial
          const FallbackAvatar = () => (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-500 font-medium">
                {item.nabar?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )
          
          if (!imageUrl) {
            return <FallbackAvatar />
          }
          
          // Gunakan img tag biasa dengan error handling yang lebih baik
          return (
            <div 
              className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 cursor-pointer hover:ring-2 hover:ring-red-700 transition-all"
              onClick={() => handleViewImage(item)}
              title="Klik untuk melihat gambar"
            >
              <img
                src={imageUrl}
                alt={item.nabar || 'Foto'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide image dan tampilkan fallback
                  e.target.style.display = 'none'
                  const parent = e.target.parentElement
                  parent.classList.add('flex', 'items-center', 'justify-center', 'dark:bg-gray-700')
                  parent.innerHTML = `<span class="text-xs text-gray-500 font-medium">${item.nama?.charAt(0).toUpperCase() || '?'}</span>`
                }}
              />
            </div>
          )
        }
    },
    {
        key: 'actions',
        title: 'ACTIONS',
        searchable: true,
        filterable: true,
        type: 'actions',
        actions: [
            {
                icon: Edit,
                title: 'Edit',
                onClick: (item) => handleEdit(item),
            },
            {
                icon: Trash2,
                title: 'Delete',
                onClick: (item) => handleDelete(item),
            },
        ],
    }
  ]
  const getHabisPakai = async (params = {}, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
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

      const response = await api.get(`/sp/habis-pakai?${queryParams}`)
      
      if (response.data.status === 'success') {
        setData(response.data.data)              
        setTotal(response.data.total)            
        setCurrentPage(response.data.page)       
        setItemsPerPage(response.data.per_page)  
      }
    } catch (error) {
      console.error('Error fetching Habis Pakai:', error)
      setData([])
      setTotal(0)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }
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
