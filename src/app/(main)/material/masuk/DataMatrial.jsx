'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal'
import DeleteModal from '@/components/Delete'
import ExportModal from '@/components/ExportModal'
import { Edit, Trash2 } from 'lucide-react'
import api from '@/app/utils/Api'
import TambahMaterial from './TambahMatrial'
import ImageView from '@/components/ImageView'
import { useData } from '@/app/context/DataContext'

export default function DataMaterial() {
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
    const [editingMaterial, setEditingMaterial] = useState(null)        // Data yang sedang diedit
    const [isEditMode, setIsEditMode] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)     // Modal konfirmasi hapus
    const [deletingMaterial, setDeletingMaterial] = useState(null)           // Data yang akan dihapus
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
        const imageUrl = getImageUrl(item.foto_material)
        if (imageUrl) {
            setSelectedImage({
                url: imageUrl,
                title: item.nama_material,
            })
            setShowImageView(true)
        }
    }

    const columns = [
        {
            key: 'nama_material',
            title: 'Nama Material',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'satuan',
            title: 'Satuan',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'kategori',
            title: 'Kategori',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'stok_sekarang',
            title: 'Stok Sekarang',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'stok_minimal',
            title: 'Stok Minimal',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'foto_material',
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
                                {item.nama_material?.charAt(0).toUpperCase() || '?'}
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
                            alt={item.nama_material || 'Foto Material'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none'
                                const parent = e.target.parentElement
                                parent.classList.add('flex', 'items-center', 'justify-center', 'dark:bg-gray-700')
                                parent.innerHTML = `<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">${item.nama_material?.charAt(0).toUpperCase() || '?'}</span>`
                            }}
                        />
                    </div>
                )
            }
        },
        {
            key: 'actions',
            title: 'Actions',
            sortable: false,
            searchable: false,
            filterable: false,
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

    const getMaterial = async (params = {}, showLoading = true) => {
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
                api.get(`/sp/materials?${queryParams}`),
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

    const postMaterial = async (form) => {
        try {
            let response

            // Setup config untuk multipart/form-data jika upload file
            const config = form instanceof FormData ? {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            } : {}

            // Check if we have editingMaterial to determine if it's update or create
            if (editingMaterial && editingMaterial.id) {
                if (form instanceof FormData) {
                    form.append('_method', 'PUT')  // Laravel method spoofing
                    response = await api.put(`/sp/materials/${editingMaterial.id}`, form, config)
                } else {
                    response = await api.put(`/sp/materials/${editingMaterial.id}`, form, config)
                }
            } else {
                response = await api.post('/sp/materials', form, config)
            }
            if (response.data.message === 'success') {
                // Refresh data setelah berhasil
                getMaterial()
                setShowAddModal(false)
                setEditingMaterial(null)
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
        setDeletingMaterial(item)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!deletingMaterial) return

        setDeleteLoading(true)
        try {
            await api.delete(`/sp/materials/${deletingMaterial.id}`)
            getMaterial()
            setShowDeleteModal(false)
            setDeletingMaterial(null)
        } catch (error) {
            // Error handling untuk delete
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setDeletingMaterial(null)
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
            const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/material/${id}`))
            await Promise.all(deletePromises)
            getMaterial()
            setShowBulkDeleteModal(false)
            setBulkDeleteIds([])
        } catch (error) {
            // Error handling untuk bulk delete
        } finally {
            setBulkDeleteLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingMaterial(null)
        setIsEditMode(false)
        setShowAddModal(true)
    }

    const handleEdit = (item) => {
        setEditingMaterial(item)
        setIsEditMode(true)
        setShowAddModal(true)
    }

    const handleCloseAddModal = () => {
        setShowAddModal(false)
        setEditingMaterial(null)
        setIsEditMode(false)
    }

    const handleAddSuccess = (newMaterial) => {
        getMaterial()
        setShowAddModal(false)
        setEditingMaterial(null)
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
        getMaterial(params)
    }

    useEffect(() => {
        getMaterial()
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
                message={`Apakah Anda yakin ingin menghapus material "${deletingMaterial?.nama_material}"?`}
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
                title="Hapus Multiple Material"
                message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} material?`}
                loading={bulkDeleteLoading}
                size="sm"
            />
            {/* Modal Add/Edit */}
            {showAddModal && (
                <Modal
                    show={showAddModal}
                    onClose={handleCloseAddModal}
                    title={isEditMode ? 'Edit Material' : 'Tambah Material Baru'}
                    size="lg"
                    closeOnOverlayClick={false}
                >
                    <TambahMaterial
                        onClose={handleCloseAddModal}
                        onSuccess={handleAddSuccess}
                        postMaterial={postMaterial}
                        editingMaterial={editingMaterial}
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
                filename="data-material"
                title="Export Data Material"
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
                alt={selectedImage?.title || 'Material Photo'}
            />
        </div>
    )
}