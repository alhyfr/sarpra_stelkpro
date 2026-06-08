'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal'
import DeleteModal from '@/components/Delete'
import ExportModal from '@/components/ExportModal'
import { Edit, Trash2 } from 'lucide-react'
import api from '@/app/utils/Api'
import TambahMaterialKeluar from './TambahMaterialKeluar'
import { useData } from '@/app/context/DataContext'
import dayjs from 'dayjs'

export default function DataMaterialKeluar() {
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
    const [editingMaterialKeluar, setEditingMaterialKeluar] = useState(null)        // Data yang sedang diedit
    const [isEditMode, setIsEditMode] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)     // Modal konfirmasi hapus
    const [deletingMaterialKeluar, setDeletingMaterialKeluar] = useState(null)           // Data yang akan dihapus
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false) // Modal konfirmasi hapus multiple
    const [bulkDeleteIds, setBulkDeleteIds] = useState([])               // Array ID yang akan dihapus
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
    const [showExportModal, setShowExportModal] = useState(false)

    const columns = [
        {
            key: 'nama_material',
            title: 'Nama Material',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'tgl_pakai',
            title: 'Tanggal Pakai',
            sortable: true,
            searchable: true,
            filterable: true,
            render: (value) => dayjs(value).format('DD-MM-YYYY'),
        },
        {
            key: 'jumlah_pakai',
            title: 'Jumlah Pakai',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'lokasi_pakai',
            title: 'Lokasi Pakai',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'teknisi',
            title: 'Pengambil',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'actions',
            title: 'Actions',
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
        }, 
    ]
    const getMaterialKeluar = async (params = {}, showLoading = true) => {
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
                api.get(`/sp/material-outs?${queryParams}`),
                minLoadingTime
            ])

            if (response.data.status === 'success') {
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
    const postMaterialKeluar = async (form) => {
        try {
            let response

            // Setup config untuk multipart/form-data jika upload file
            const config = form instanceof FormData ? {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            } : {}

            // Check if we have editingMaterial to determine if it's update or create
            if (editingMaterialKeluar && editingMaterialKeluar.id) {
                if (form instanceof FormData) {
                    form.append('_method', 'PUT')  // Laravel method spoofing
                    response = await api.put(`/sp/material-outs/${editingMaterialKeluar.id}`, form, config)
                } else {
                    response = await api.put(`/sp/material-outs/${editingMaterialKeluar.id}`, form, config)
                }
            } else {
                response = await api.post('/sp/material-outs', form, config)
            }
            if (response.data.message === 'success') {
                // Refresh data setelah berhasil
                getMaterialKeluar()
                setShowAddModal(false)
                setEditingMaterialKeluar(null)
                setIsEditMode(false)
                return response.data
            }
        } catch (error) {
            // Re-throw error agar bisa ditangani di TambahMaterial component
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
        setDeletingMaterialKeluar(item)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!deletingMaterialKeluar) return

        setDeleteLoading(true)
        try {
            await api.delete(`/sp/material-outs/${deletingMaterialKeluar.id}`)
            getMaterialKeluar()
            setShowDeleteModal(false)
            setDeletingMaterialKeluar(null)
        } catch (error) {
            // Error handling untuk delete
        } finally {
            setDeleteLoading(false)
        }
    }
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setDeletingMaterialKeluar(null)
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
            const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/material-outs/${id}`))
            await Promise.all(deletePromises)
            getMaterialKeluar()
            setShowBulkDeleteModal(false)
            setBulkDeleteIds([])
        } catch (error) {
            // Error handling untuk bulk delete
        } finally {
            setBulkDeleteLoading(false)
        }
    }

    const handleCloseBulkDeleteModal = () => {
        setShowBulkDeleteModal(false)
        setBulkDeleteIds([])
        setBulkDeleteLoading(false)
    }
    const handleAdd = () => {
        setEditingMaterialKeluar(null)
        setIsEditMode(false)
        setShowAddModal(true)
    }

    const handleEdit = (item) => {
        setEditingMaterialKeluar(item)
        setIsEditMode(true)
        setShowAddModal(true)
    }

    const handleCloseAddModal = () => {
        setShowAddModal(false)
        setEditingMaterialKeluar(null)
        setIsEditMode(false)
    }

    const handleAddSuccess = (newMaterial) => {
        getMaterialKeluar()
        setShowAddModal(false)
        setEditingMaterialKeluar(null)
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
        getMaterialKeluar(params)
    }
    useEffect(() => {
        getMaterialKeluar()
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
                title="Data Material"
                subtitle="Kelola data Material Masuk"
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
                title="Hapus Material"
                message={`Apakah Anda yakin ingin menghapus material keluar "${deletingMaterialKeluar?.nama_material}"?`}
                loading={deleteLoading}
            />
            {/* Modal Delete Multiple */}
            <DeleteModal
                show={showBulkDeleteModal}
                onClose={handleCloseBulkDeleteModal}
                onConfirm={handleConfirmBulkDelete}
                title="Hapus Multiple Material Keluar"
                message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} material keluar?`}
                loading={bulkDeleteLoading}
                size="sm"
            />
            {/* Modal Add/Edit */}
            {showAddModal && (
                <Modal
                    show={showAddModal}
                    onClose={handleCloseAddModal}
                    title={isEditMode ? 'Edit Material Keluar' : 'Tambah Material Keluar Baru'}
                    size="lg"
                    closeOnOverlayClick={false}
                >
                    <TambahMaterialKeluar
                        onClose={handleCloseAddModal}
                        onSuccess={handleAddSuccess}
                        postMaterialKeluar={postMaterialKeluar}
                        editingMaterialKeluar={editingMaterialKeluar}
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
                filename="data-material-keluar"
                title="Export Data Material Keluar"
            />
        </div>
    )
}