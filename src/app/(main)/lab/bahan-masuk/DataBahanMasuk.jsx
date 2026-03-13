'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal'
import DeleteModal from '@/components/Delete'
import ExportModal from '@/components/ExportModal'
import { Edit, Trash2 } from 'lucide-react'
import api from '@/app/utils/Api'
import TambahBahanMasuk from './TambahBahanMasuk'
import ImageView from '@/components/ImageView'
import { useData } from '@/app/context/DataContext'
import dayjs from 'dayjs';
const STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE || ''
export default function DataBahanMasuk() {
    const { labs, getOpsi } = useData()
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
    const [editingBahanMasuk, setEditingBahanMasuk] = useState(null)        // Data yang sedang diedit
    const [isEditMode, setIsEditMode] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)     // Modal konfirmasi hapus
    const [deletingBahanMasuk, setDeletingBahanMasuk] = useState(null)           // Data yang akan dihapus
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false) // Modal konfirmasi hapus multiple
    const [bulkDeleteIds, setBulkDeleteIds] = useState([])               // Array ID yang akan dihapus
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
    const [showExportModal, setShowExportModal] = useState(false)
    const [showImageView, setShowImageView] = useState(false)            // Image viewer modal
    const [selectedImage, setSelectedImage] = useState(null)
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
    const handleViewImage = (item) => {
        const imageUrl = getImageUrl(item.foto)
        if (imageUrl) {
            setSelectedImage({
                url: imageUrl,
                title: item.nama_barang,
                description: `${item.lokasi || ''}`
            })
            setShowImageView(true)
        }
    }
    const columns = [
        {
            key: 'kode_barang',
            title: 'Kode Barang',
            sortable: true,
            searchable: true,
        },
        {
            key: 'nama_barang',
            title: 'Nama Barang',
            sortable: true,
            searchable: true,
        },
        {
            key: 'tgl_masuk',
            title: 'Tanggal Masuk',
            sortable: true,
            searchable: true,
            render: (value) => {
                return dayjs(value).format('DD MMMM YYYY')
            }

        },
        {
            key: 'jml',
            title: 'Jumlah',
            sortable: true,
            searchable: true,
        },
        {
            key: 'nama_lab',
            title: 'Lokasi',
            sortable: true,
            searchable: true,
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
    const getDataBahanMasuk = async (params = {}, showLoading = true) => {
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
                api.get(`/sp/bahan-masuk?${queryParams}`),
                minLoadingTime
            ])

            if (response.data.status === 'success') {
                setData(response.data.data)
                setTotal(response.data.total)
                setCurrentPage(response.data.page)
                setItemsPerPage(response.data.per_page)
            }
        } catch (error) {
            console.error('Error fetching bahan masuk:', error)
            setData([])
            setTotal(0)
        } finally {
            if (showLoading) {
                setLoading(false)
            }
        }
    }
    const postDataBahanMasuk = async (form) => {
        try {
            let response
            const config = form instanceof FormData ? {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            } : {}
            if (editingBahanMasuk && editingBahanMasuk.id) {
                if (form instanceof FormData) {
                    form.append('_method', 'PUT')
                    response = await api.put(`/sp/bahan-masuk/${editingBahanMasuk.id}`, form, config)
                } else {
                    response = await api.put(`/sp/bahan-masuk/${editingBahanMasuk.id}`, form, config)
                }
            } else {
                response = await api.post('/sp/bahan-masuk', form, config)
            }
            if (response.data.status === 'success') {
                getDataBahanMasuk()
                setShowAddModal(false)
                setEditingBahanMasuk(null)
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
        setDeletingBahanMasuk(item)
        setShowDeleteModal(true)
    }
    const handleConfirmDelete = async () => {
        if (!deletingBahanMasuk) return

        setDeleteLoading(true)
        try {
            await api.delete(`/sp/bahan-masuk/${deletingBahanMasuk.id}`)
            getDataBahanMasuk()
            setShowDeleteModal(false)
            setDeletingBahanMasuk(null)
        } catch (error) {
            console.error('Error deleting bahan masuk:', error)
        } finally {
            setDeleteLoading(false)
        }
    }
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setDeletingBahanMasuk(null)
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
            const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/bahan-masuk/${id}`))
            await Promise.all(deletePromises)
            getDataBahanMasuk()
            setShowBulkDeleteModal(false)
            setBulkDeleteIds([])
        } catch (error) {
            console.error('Error bulk deleting bahan masuk :', error)
        } finally {
            setBulkDeleteLoading(false)
        }
    }
    const handleAdd = () => {
        setEditingBahanMasuk(null)
        setIsEditMode(false)
        setShowAddModal(true)
    }
    const handleEdit = (item) => {
        setEditingBahanMasuk(item)
        setIsEditMode(true)
        setShowAddModal(true)
    }
    const handleCloseAddModal = () => {
        setShowAddModal(false)
        setEditingBahanMasuk(null)
        setIsEditMode(false)
    }
    const handleAddSuccess = (newBahanMasuk) => {
        getDataBahanMasuk()
        setShowAddModal(false)
        setEditingBahanMasuk(null)
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
        getDataBahanMasuk(params)
    }
    useEffect(() => {
        getDataBahanMasuk()
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
                title="Data Bahan Masuk"
                subtitle="Kelola data Bahan Masuk"
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
                title="Hapus Bahan Masuk"
                message={`Apakah Anda yakin ingin menghapus bahan masuk "${deletingBahanMasuk?.nama_barang}"?`}
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
                title="Hapus Multiple Bahan Masuk"
                message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} bahan masuk?`}
                loading={bulkDeleteLoading}
                size="sm"
            />
            {showAddModal && (
                <Modal
                    show={showAddModal}
                    onClose={handleCloseAddModal}
                    title={isEditMode ? 'Edit Bahan Masuk' : 'Tambah Bahan Masuk Baru'}
                    size="lg"
                    closeOnOverlayClick={false}
                >
                    <TambahBahanMasuk
                        onClose={handleCloseAddModal}
                        onSuccess={handleAddSuccess}
                        postDataBahanMasuk={postDataBahanMasuk}
                        editingBahanMasuk={editingBahanMasuk}
                        isEditMode={isEditMode}
                    />
                </Modal>
            )}
        </div>
    )
}