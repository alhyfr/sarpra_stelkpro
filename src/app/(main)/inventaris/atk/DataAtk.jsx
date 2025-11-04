'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal'
import DeleteModal from '@/components/Delete'
import ExportModal from '@/components/ExportModal'
import { Edit, Trash2 } from 'lucide-react'
import api from '@/app/utils/Api'
import TambahAtk from './TambahAtk'
import ImageView from '@/components/ImageView'
import { useData } from '@/app/context/DataContext'

export default function DataAtk() {
  const [data, setData] = useState([])           // Data yang ditampilkan di table
  const [total, setTotal] = useState(0)         // Total data dari server (untuk pagination)
  const [loading, setLoading] = useState(false) // Loading state saat fetch data
  const [currentPage, setCurrentPage] = useState(1)     // Halaman aktif
  const [itemsPerPage, setItemsPerPage] = useState(10) // Jumlah item per halaman
  const [searchTerm, setSearchTerm] = useState('')      // Kata kunci pencarian
  const [sortField, setSortField] = useState('')       // Field yang di-sort
  const [sortDirection, setSortDirection] = useState('asc') // Arah sorting (asc/desc)
  const [filters, setFilters] = useState({}) 
  const [showAddModal, setShowAddModal] = useState(false)     // Modal tambah/edit data
  const [editingAtk, setEditingAtk] = useState(null)        // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false) 
  const [showDeleteModal, setShowDeleteModal] = useState(false)     // Modal konfirmasi hapus
  const [deletingAtk, setDeletingAtk] = useState(null)           // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false)        
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false) // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([])               // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false) 
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImageView, setShowImageView] = useState(false)            // Image viewer modal
  const [selectedImage, setSelectedImage] = useState(null) 
  const {
    satuan,
    getOpsi,
  } = useData();
  const getImageUrl = (filename) => {
    if (!filename) return null
    
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename
    }
    
    const baseURL = process.env.NEXT_PUBLIC_API_STORAGE || 'http://localhost:8000/api'
    
    if (filename.startsWith('/')) {
      return `${baseURL}${filename}`
    }
    
    return `${baseURL}/${filename}`
  } 
  // Handler untuk view image
  const handleViewImage = (item) => {
    const imageUrl = getImageUrl(item.ket)
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        title: item.nabar,
      })
      setShowImageView(true)
    }
  }
  const columns = [
    {
      key: 'kode',
      title: 'Kode',
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: 'nabar',
      title: 'Nama Barang',
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
        key:'spec',
        title: 'Spesifikasi',
        sortable: true,
        searchable: true,
        filterable: true,
    },
    {
        key:'kategori_atk',
        title: 'Kategori ATK',
        sortable: true,
        searchable: true,
        filterable: true,
    },
    {
        key:'satuan',
        title: 'Satuan',
        sortable: true,
        searchable: true,
        filterable: true,
        render: (value) => {
          if (typeof value === 'object' && value !== null) {
            return value.satuan || '-'
          }
          return value || '-'
        },
        filter: (value) => {
          if (typeof value === 'object' && value !== null) {
            return value.satuan
          }
          return value
        },
        filterOptions: satuan.map((item) => ({
          value: item.satuan,
          label: item.satuan,
        })),
    },
    {
        key:'stok_awal',
        title: 'Stok Awal',
        sortable: true,
        searchable: true,
        filterable: true,
    },
    {
        key:'ket',
        title: 'Foto',
        sortable: false,
        searchable: false,
        filterable: false,
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
                  alt={item.nabar || 'Foto ATK'}
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
        key:'actions',
        title: 'Actions',
        sortable: true,
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
  const getAtk = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/atk?${queryParams}`),  
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
  const postAtk = async (form) => {
    try {
      let response
    
      // Setup config untuk multipart/form-data jika upload file
      const config = form instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {}
      
      // Check if we have editingAtk to determine if it's update or create
      if (editingAtk && editingAtk.id) {    
        if (form instanceof FormData) {
          form.append('_method', 'PUT')  // Laravel method spoofing
          response = await api.put(`/sp/atk/${editingAtk.id}`, form, config)
        } else {
          response = await api.put(`/sp/atk/${editingAtk.id}`, form, config)
        }
      } else {
        response = await api.post('/sp/atk', form, config)
      }      
      if (response.data.message === 'success') {
        // Refresh data setelah berhasil
        getAtk()
        setShowAddModal(false)
        setEditingAtk(null)
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
    setDeletingAtk(item)
    setShowDeleteModal(true)
  }
  const handleConfirmDelete = async () => {
    if (!deletingAtk) return

    setDeleteLoading(true)
    try {
      await api.delete(`/sp/atk/${deletingAtk.id}`)  // Fix: gunakan id dari object
      getAtk()  // Fix: nama function yang benar
      setShowDeleteModal(false)
      setDeletingAtk(null)  // Fix: nama variable yang benar
    } catch (error) {
      // Error handling untuk delete
    } finally {
      setDeleteLoading(false)
    }
  }
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingAtk(null)  
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
      const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/atk/${id}`))  // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises)
      getAtk()  
      setShowBulkDeleteModal(false)
      setBulkDeleteIds([])
    } catch (error) {
      // Error handling untuk bulk delete
    } finally {
      setBulkDeleteLoading(false)
    }
  }
  const handleAdd = () => {
    setEditingAtk(null)  
    setIsEditMode(false)
    setShowAddModal(true)
  }
  const handleEdit = (item) => {
    setEditingAtk(item)  
    setIsEditMode(true)
    setShowAddModal(true)
  }
  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setEditingAtk(null)  
    setIsEditMode(false)
  }
  const handleAddSuccess = (newAtk) => {
    getAtk()  
    setShowAddModal(false)
    setEditingAtk(null)  
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
    getAtk(params)
  }
  useEffect(() => {
    getAtk()  
    getOpsi()
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
        title="Data ATK"
        subtitle="Kelola data Alat Tulis Kantor"
        serverSide={true}
        onDataChange={handleDataChange}
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
        title="Hapus Master ATK"
        message={`Apakah Anda yakin ingin menghapus ATK "${deletingAtk?.nabar}"?`}
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
        title="Hapus Multiple ATK"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} ATK?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
       {/* Modal Add/Edit */}
       {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? 'Edit Atk' : 'Tambah Atk Baru'}
          size="lg"
          closeOnOverlayClick={false}
        >
          <TambahAtk
          onClose={handleCloseAddModal}
          onSuccess={handleAddSuccess}
          postAtk={postAtk}
          editingAtk={editingAtk}
          isEditMode={isEditMode}
          />
        </Modal>
      )}
       {/* Modal Export */}
       <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-Atk"
        title="Export Data ATK"
      />

      {/* Image Viewer */}
      <ImageView
        show={showImageView}
        onClose={() => {
          setShowImageView(false)
          setSelectedImage(null)
        }}
        images={selectedImage?.url}
        title={selectedImage?.title}
        alt={selectedImage?.title || 'ATK Photo'}
      />
        </div>
    )
}