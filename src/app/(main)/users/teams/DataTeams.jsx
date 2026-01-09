'use client'

import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal'
import DeleteModal from '@/components/Delete'
import ExportModal from '@/components/ExportModal'
import { Edit, Trash2 } from 'lucide-react'
import api from '@/app/utils/Api'
import TambahTeam from './TambahTeam'
import ImageView from '@/components/ImageView'

// Storage URL dari environment variable
const STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE || ''

export default function DataTeams() {
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
  const [editingTeam, setEditingTeam] = useState(null)        // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)     // Modal konfirmasi hapus
  const [deletingTeam, setDeletingTeam] = useState(null)           // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false) // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([])               // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImageView, setShowImageView] = useState(false)            // Image viewer modal
  const [selectedImage, setSelectedImage] = useState(null)             // Selected image data 

  // Helper function untuk get full image URL
  const getImageUrl = (filename) => {
    if (!filename) return null

    // Jika sudah full URL (http/https), return as is
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename
    }

    // Jika relative path, gabungkan dengan STORAGE_URL
    if (filename.startsWith('/')) {
      return `${STORAGE_URL}${filename}`
    }

    // Jika hanya filename, gabungkan dengan STORAGE_URL
    return `${STORAGE_URL}/${filename}`
  }

  // Handler untuk view image
  const handleViewImage = (item) => {
    const imageUrl = getImageUrl(item.foto)
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        title: item.nama,
        description: `${item.jabatan || ''} - NIP: ${item.nip || '-'}`
      })
      setShowImageView(true)
    }
  }

  const columns = [
    {
      key: 'foto',
      title: 'FOTO',
      sortable: false,
      render: (value, item) => {
        const imageUrl = getImageUrl(value)

        // Fallback component untuk menampilkan initial
        const FallbackAvatar = () => (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-xs text-gray-500 font-medium">
              {item.nama?.charAt(0).toUpperCase() || '?'}
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
              alt={item.nama || 'Foto'}
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
      key: 'nip',
      title: 'NIP',
      searchable: true,
      filterable: true,
    },
    {
      key: 'nik',
      title: 'NIK',
      searchable: true,
      filterable: true,
    },
    {
      key: 'nama',
      title: 'NAMA',
      searchable: true,
      filterable: true,
    },
    {
      key: 'nikname',
      title: 'NIKNAME',
      searchable: true,
      filterable: true,
    },
    {
      key: 'status',
      title: 'STATUS',
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: 'PEGTAP', label: 'PEGAWAI TETAP' },
        { value: 'FULL TIME', label: 'FULL TIME' },
      ],
    },
    {
      key: 'jabatan',
      title: 'JABATAN',
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: 'WAKASE', label: 'Wakil Kepala Sekolah' },
        { value: 'KAUR', label: 'Kepala Urusan' },
        { value: 'STAF', label: 'Staf' },
      ],
    },
    {
      key: 'actions',
      title: 'Aksi',
      type: 'actions',
      sortable: false,
      actions: [
        {
          icon: Edit,
          title: 'Edit',
          className: 'text-green-600 hover:text-green-900',
          onClick: (item) => handleEdit(item)
        },
        {
          icon: Trash2,
          title: 'Hapus',
          className: 'text-red-600 hover:text-red-900',
          onClick: (item) => handleDelete(item)
        }
      ]
    }
  ]

  const getTeams = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/teams?${queryParams}`),
        minLoadingTime
      ])

      if (response.data.status === 'success') {
        setData(response.data.data)
        setTotal(response.data.total)
        setCurrentPage(response.data.page)
        setItemsPerPage(response.data.per_page)
        // console.log(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setData([])
      setTotal(0)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }
  const postTeam = async (form) => {
    try {
      let response

      // Setup config untuk multipart/form-data jika upload file
      const config = form instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {}

      // Check if we have editingTeam to determine if it's update or create
      if (editingTeam && editingTeam.id) {
        // Update existing team


        // Untuk update dengan file, beberapa API perlu POST dengan _method=PUT
        if (form instanceof FormData) {
          form.append('_method', 'PUT')  // Laravel method spoofing
          response = await api.put(`/sp/teams/${editingTeam.id}`, form, config)
        } else {
          // Update tanpa file
          response = await api.put(`/sp/teams/${editingTeam.id}`, form, config)
        }
      } else {
        // Create new team

        response = await api.post('/sp/teams', form, config)
      }



      if (response.data.status === 'success') {
        // Refresh data setelah berhasil
        getTeams()
        setShowAddModal(false)
        setEditingTeam(null)
        setIsEditMode(false)
        return response.data
      }
    } catch (error) {
      console.error('❌ Error saving team:', error)
      // Re-throw error agar bisa ditangani di TambahTeam component
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
    setDeletingTeam(item)
    setShowDeleteModal(true)

  }
  const handleConfirmDelete = async () => {
    if (!deletingTeam) return

    setDeleteLoading(true)
    try {
      await api.delete(`/sp/teams/${deletingTeam.id}`)  // Fix: gunakan id dari object
      // Refresh data after delete
      getTeams()  // Fix: nama function yang benar
      setShowDeleteModal(false)
      setDeletingTeam(null)  // Fix: nama variable yang benar
    } catch (error) {
      console.error('Error deleting team:', error)  // Fix: pesan error
    } finally {
      setDeleteLoading(false)
    }
  }
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingTeam(null)
    setDeleteLoading(false)
  }
  // Bulk delete handlers
  const handleBulkDelete = (selectedIds) => {
    setBulkDeleteIds(selectedIds)
    setShowBulkDeleteModal(true)
  }
  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return

    setBulkDeleteLoading(true)
    try {
      // Delete multiple users
      const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/teams/${id}`))  // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises)


      getTeams()
      setShowBulkDeleteModal(false)
      setBulkDeleteIds([])
    } catch (error) {
      console.error('Error bulk deleting team :', error)
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingTeam(null)
    setIsEditMode(false)
    setShowAddModal(true)
  }

  const handleEdit = (item) => {
    setEditingTeam(item)
    setIsEditMode(true)
    setShowAddModal(true)
  }
  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setEditingTeam(null)
    setIsEditMode(false)
  }
  const handleAddSuccess = (newTeam) => {
    getTeams()
    setShowAddModal(false)
    setEditingTeam(null)
    setIsEditMode(false)
  }
  const handleExport = () => {
    setShowExportModal(true)
  }

  // ============================================
  // HANDLER: DATA CHANGE (Search, Filter, Sort, Pagination)
  // ============================================
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
    getTeams(params)
  }

  useEffect(() => {
    getTeams()  // 🔧 GANTI: sesuaikan nama function (contoh: getProducts, getCategories)
  }, [])

  return (
    <>
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
        title="Data Teams"
        subtitle="Kelola data Teams"

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
        title="Hapus Team"
        message={`Apakah Anda yakin ingin menghapus team "${deletingTeam?.nama}"?`}
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
        title="Hapus Multiple Teams"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} team?`}
        loading={bulkDeleteLoading}
        size="sm"
      />

      {/* Modal Add/Edit */}
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? 'Edit Team' : 'Tambah Team Baru'}
          size="fullscreen"
          closeOnOverlayClick={false}
        >
          <TambahTeam
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postTeam={postTeam}
            editingTeam={editingTeam}
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
        filename="data-teams"
        title="Export Data Teams"
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
        description={selectedImage?.description}
        alt={selectedImage?.title || 'Team Photo'}
      />
    </>
  )
}