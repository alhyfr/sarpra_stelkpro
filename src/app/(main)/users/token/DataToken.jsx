'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal'
import DeleteModal from '@/components/Delete'
import ExportModal from '@/components/ExportModal'
import { Edit, Trash2 } from 'lucide-react'
import api from '@/app/utils/Api'
import TambahToken from './TambahToken'
export default function DataToken() {
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
    const [editingToken, setEditingToken] = useState(null)        // Data yang sedang diedit
    const [isEditMode, setIsEditMode] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)     // Modal konfirmasi hapus
    const [deletingToken, setDeletingToken] = useState(null)           // Data yang akan dihapus
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false) // Modal konfirmasi hapus multiple
    const [bulkDeleteIds, setBulkDeleteIds] = useState([])               // Array ID yang akan dihapus
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
    const [showExportModal, setShowExportModal] = useState(false)

    const columns = [
        {
            key: 'app_name',
            title: 'APP NAME',
            searchable: true,
            filterable: true,
        },
        {
            key: 'api_key',
            title: 'API KEY',
            searchable: true,
            filterable: true,
        },
        {
            key: 'permissions',
            title: 'PERMISSION',
            searchable: true,
            filterable: true,
        },
        {
            key: 'is_active',
            title: 'IS ACTIVE',
            searchable: true,
            filterable: true,
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
    const getToken = async (params = {}, showLoading = true) => {
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
                api.get(`/sp/api-key?${queryParams}`),
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
    const postToken = async (form) => {
        try {
            let response
            const config = form instanceof FormData ? {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            } : {}

            if (editingToken && editingToken.id) {
                if (form instanceof FormData) {
                    form.append('_method', 'PUT')
                    response = await api.put(`/sp/api-key/${editingToken.id}`, form, config)
                } else {
                    response = await api.put(`/sp/api-key/${editingToken.id}`, form, config)
                }
            } else {

                response = await api.post('/sp/api-key', form, config)
            }

            if (response.data.status === 'success') {
                getToken()
                setShowAddModal(false)
                setEditingToken(null)
                setIsEditMode(false)
                return response.data
            }
        } catch (error) {
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
        setDeletingToken(item)
        setShowDeleteModal(true)
    }
    const handleConfirmDelete = async () => {
        if (!deletingToken) return

        setDeleteLoading(true)
        try {
            await api.delete(`/sp/api-key/${deletingToken.id}`)
            getToken()
            setShowDeleteModal(false)
            setDeletingToken(null)
        } catch (error) {
            console.error('Error deleting token:', error)
        } finally {
            setDeleteLoading(false)
        }
    }
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setDeletingToken(null)
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
            const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/api-key/${id}`))
            await Promise.all(deletePromises)
            getToken()
            setShowBulkDeleteModal(false)
            setBulkDeleteIds([])
        } catch (error) {
            console.error('Error bulk deleting token :', error)
        } finally {
            setBulkDeleteLoading(false)
        }
    }
    const handleAdd = () => {
        setEditingToken(null)
        setIsEditMode(false)
        setShowAddModal(true)
    }

    const handleEdit = (item) => {
        setEditingToken(item)
        setIsEditMode(true)
        setShowAddModal(true)
    }
    const handleCloseAddModal = () => {
        setShowAddModal(false)
        setEditingToken(null)
        setIsEditMode(false)
    }
    const handleAddSuccess = (newToken) => {
        getToken()
        setShowAddModal(false)
        setEditingToken(null)
        setIsEditMode(false)
    }
    const handleExport = () => {
        setShowExportModal(true)
    }
    const handleDataChange = (params) => {
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
        getToken(params)
    }
    useEffect(() => {
        getToken()
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
                title="Data Token"
                subtitle="Kelola data Token"

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
                title="Hapus Token"
                message={`Apakah Anda yakin ingin menghapus token "${deletingToken?.app_name}"?`}
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
                title="Hapus Multiple Token"
                message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} token?`}
                loading={bulkDeleteLoading}
                size="sm"
            />

            {/* Modal Add/Edit */}
            {showAddModal && (
                <Modal
                    show={showAddModal}
                    onClose={handleCloseAddModal}
                    title={isEditMode ? 'Edit Token' : 'Tambah Token Baru'}
                    size="lg"
                    closeOnOverlayClick={false}
                >
                    <TambahToken
                        onClose={handleCloseAddModal}
                        onSuccess={handleAddSuccess}
                        postToken={postToken}
                        editingToken={editingToken}
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
                filename="data-token"
                title="Export Data Token"
            />


        </>
    )
}