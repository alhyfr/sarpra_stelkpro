'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal'
import DeleteModal from '@/components/Delete'
import ExportModal from '@/components/ExportModal'
import { Edit, Trash2 } from 'lucide-react'
import api from '@/app/utils/Api'
import TambahAkun from './TambahAkun'
import { useData } from '@/app/context/DataContext'

export default function DataAkun() {
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
  const [editingAkun, setEditingAkun] = useState(null)        // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false) 
  const [showDeleteModal, setShowDeleteModal] = useState(false)     // Modal konfirmasi hapus
  const [deletingAkun, setDeletingAkun] = useState(null)           // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false)        
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false) // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([])               // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false) 
  const [showExportModal, setShowExportModal] = useState(false)
  const { roles, getOpsi, positions } = useData()
  const columns = [
    {
      key: 'uid',
      title: 'KODE',
      searchable: true,
    },
    {
      key: 'name',
      title: 'NAME',
      searchable: true,
    },
    {
      key: 'role',
      title: 'LEVEL',
      searchable: true,
      filterOptions: roles.map(role => ({ value: role.role_id, label: role.codename })),
    },
    {
      key: 'posisi',
      title: 'POSITION',
      searchable: true,
    },
    {
      key: 'status',
      title: 'STATUS',
      searchable: true,
      filterOptions: [
        { value: 'on', label: 'on' },
        { value: 'off', label: 'off' },
      ],
    },
    {
      key: 'actions',
      title: 'ACTIONS',
      type: 'actions',
      sortable: false,
      actions: [
        {
          icon: Edit,
          title: 'Edit',
          onClick: (item) => handleEdit(item)
        },
        {
          icon: Trash2,
          title: 'Delete',
          onClick: (item) => handleDelete(item)
        }
      ]
    }
  ]
  const getUsers = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/users?${queryParams}`),  
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
  const postUser = async (form) => {
    try {
      let response
    
      // Setup config untuk multipart/form-data jika upload file
      const config = form instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {}
      
      // Check if we have editingTeam to determine if it's update or create
      if (editingAkun && editingAkun.id) {
        // Update existing team
       
        
        // Untuk update dengan file, beberapa API perlu POST dengan _method=PUT
        if (form instanceof FormData) {
          form.append('_method', 'PUT')  // Laravel method spoofing
          response = await api.put(`/sp/users/${editingAkun.id}`, form, config)
        } else {
          // Update tanpa file
          response = await api.put(`/sp/users/${editingAkun.id}`, form, config)
        }
      } else {
        // Create new team
        response = await api.post('/sp/users', form, config)
      }
      
      
      if (response.data.status === 'success') {
        // Refresh data setelah berhasil
        getUsers()
        setShowAddModal(false)
        setEditingAkun(null)
        setIsEditMode(false)
        return response.data
      }
    } catch (error) {
      console.error('Error saving team:', error)
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
    setDeletingAkun(item)
    setShowDeleteModal(true)
  }
  const handleConfirmDelete = async () => {
    if (!deletingAkun) return

    setDeleteLoading(true)
    try {
      await api.delete(`/sp/users/${deletingAkun.id}`)  // Fix: gunakan id dari object
      // Refresh data after delete
      getUsers()  // Fix: nama function yang benar
      setShowDeleteModal(false)
      setDeletingAkun(null)  // Fix: nama variable yang benar
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
  const handleBulkDelete = (selectedIds) => {
    setBulkDeleteIds(selectedIds)
    setShowBulkDeleteModal(true)
  }
  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return

    setBulkDeleteLoading(true)
    try {
      // Delete multiple users
      const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/users/${id}`))  // 🔧 GANTI: endpoint delete
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
    setEditingAkun(null)  
    setIsEditMode(false)
    setShowAddModal(true)
  }
  const handleEdit = (item) => {
    setEditingAkun(item)  
    setIsEditMode(true)
    setShowAddModal(true)
  }
  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setEditingAkun(null)  
    setIsEditMode(false)
  }
  const handleAddSuccess = (newTeam) => {
    getUsers()  
    setShowAddModal(false)
    setEditingAkun(null)  
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
    getUsers(params)
  }
  useEffect(() => {
    getOpsi()
    getUsers()  // 🔧 GANTI: sesuaikan nama function (contoh: getProducts, getCategories)
  }, [])

    return(
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
        title="Data Users"
        subtitle="Kelola data Users"
        
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

<DeleteModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Team"
        message={`Apakah Anda yakin ingin menghapus team "${deletingAkun?.name}"?`}
        loading={deleteLoading}
        size="sm"
      />

      <DeleteModal
        show={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false)
          setBulkDeleteIds([])
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Multiple Users"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} akun?`}
        loading={bulkDeleteLoading}
        size="sm"
      />

      {/* Modal Add/Edit */}
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? 'Edit Akun' : 'Tambah Akun Baru'}
          width="700px"
          closeOnOverlayClick={false}
        >
          <TambahAkun
          onClose={handleCloseAddModal}
          onSuccess={handleAddSuccess}
          postUser={postUser}
          editingAkun={editingAkun}
          isEditMode={isEditMode}
          roles={roles}
          positions={positions}
          />
        </Modal> 
      )}
       <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-teams"
        title="Export Data Teams"
      />
        </>
    )
}