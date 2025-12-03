'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal'
import DeleteModal from '@/components/Delete'
import ExportModal from '@/components/ExportModal'
import { Edit, Trash2 } from 'lucide-react'
import api from '@/app/utils/Api'
import TambahBahan from './TambahBahan'
import ImageView from '@/components/ImageView'
import { useData } from '@/app/context/DataContext'
const STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE || ''
export default function DataBahan() {
    const { labs,getOpsi } = useData()
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
    const [editingBahan, setEditingBahan] = useState(null)        // Data yang sedang diedit
    const [isEditMode, setIsEditMode] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)     // Modal konfirmasi hapus
    const [deletingBahan, setDeletingBahan] = useState(null)           // Data yang akan dihapus
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
        const imageUrl = getImageUrl(item.gambar)
        if (imageUrl) {
            setSelectedImage({
                url: imageUrl,
                title: item.nama_bahan,
                description: `${item.nama_lab || ''}`
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
            key: 'kategori',
            title: 'Kategori',
            sortable: true,
            searchable: true,
        },
        {
            key: 'satuan',
            title: 'Satuan',
            sortable: true,
            searchable: true,
        },
        {
            key: 'stok_awal',
            title: 'Stok Awal',
            sortable: true,
            searchable: true,
        },
        {
            key: 'stok_minimum',
            title: 'Stok Minimum',
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
            key: 'kondisi',
            title: 'Kondisi',
            sortable: true,
            searchable: true,
        },
        {
            key: 'ket',
            title: 'Keterangan',
            sortable: true,
            searchable: true,
        },
        {
            key: 'gambar',
            title: 'Foto',
            render: (value, item) => {
                const imageUrl = getImageUrl(value)

                if (!imageUrl) {
                    return (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {item.nama_barang?.charAt(0).toUpperCase() || '?'}
                            </span>
                        </div>
                    )
                }

                return (
                    <div
                        className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewImage(item);
                        }}
                        title="Klik untuk melihat gambar"
                    >
                        <img
                            src={imageUrl}
                            alt={item.nama_barang || 'Foto Barang'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none'
                                const parent = e.target.parentElement
                                parent.classList.add('flex', 'items-center', 'justify-center', 'dark:bg-gray-700')
                                parent.innerHTML = `<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">${item.nama_barang?.charAt(0).toUpperCase() || '?'}</span>`
                            }}
                        />
                    </div>
                )
            }
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
    const getDataBahan = async (params = {}, showLoading = true) => {
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
                api.get(`/sp/bahan-praktikum?${queryParams}`),
                minLoadingTime
            ])

            if (response.data.message === 'success') {
                setData(response.data.data)
                // Use same pattern as DataInv.jsx - check both structures for compatibility
                setTotal(response.data.total || response.data.pagination?.total || response.data.data.length)
                setCurrentPage(response.data.page || response.data.pagination?.current_page || 1)
                setItemsPerPage(response.data.per_page || response.data.pagination?.per_page || 10)
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
    const postDataBahan = async (form) => {
        try {
            let response
            const config = form instanceof FormData ? {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            } : {}
            if (editingBahan && editingBahan.id) {
                if (form instanceof FormData) {
                    form.append('_method', 'PUT')
                    response = await api.put(`/sp/bahan-praktikum/${editingBahan.id}`, form, config)
                } else {
                    response = await api.put(`/sp/bahan-praktikum/${editingBahan.id}`, form, config)
                }
            } else {
                response = await api.post('/sp/bahan-praktikum', form, config)
            }
            if (response.data.status === 'success') {
                getDataBahan()
                setShowAddModal(false)
                setEditingBahan(null)
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
        setDeletingBahan(item)
        setShowDeleteModal(true)
    }
    const handleConfirmDelete = async () => {
        if (!deletingBahan) return

        setDeleteLoading(true)
        try {
            await api.delete(`/sp/bahan-praktikum/${deletingBahan.id}`)
            getDataBahan()
            setShowDeleteModal(false)
            setDeletingBahan(null)
        } catch (error) {
            console.error('Error deleting daftar lab:', error)
        } finally {
            setDeleteLoading(false)
        }
    }
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setDeletingBahan(null)
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
            const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/bahan-praktikum/${id}`))  // 🔧 GANTI: endpoint delete
            await Promise.all(deletePromises)
            getDataBahan()
            setShowBulkDeleteModal(false)
            setBulkDeleteIds([])
        } catch (error) {
            console.error('Error bulk deleting bahan praktikum :', error)
        } finally {
            setBulkDeleteLoading(false)
        }
    }
    const handleAdd = () => {
        setEditingBahan(null)
        setIsEditMode(false)
        setShowAddModal(true)
    }
    const handleEdit = (item) => {
        setEditingBahan(item)
        setIsEditMode(true)
        setShowAddModal(true)
    }
    const handleCloseAddModal = () => {
        setShowAddModal(false)
        setEditingBahan(null)
        setIsEditMode(false)
    }
    const handleAddSuccess = (newTeam) => {
        getDataBahan()
        setShowAddModal(false)
        setEditingBahan(null)
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
        getDataBahan(params)
    }
    useEffect(() => {
        getDataBahan()
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
                title="Data Bahan Praktikum"
                subtitle="Kelola data Bahan Praktikum"
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
                title="Hapus Bahan Praktikum"
                message={`Apakah Anda yakin ingin menghapus bahan praktikum "${deletingBahan?.nama_bahan}"?`}
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
                title="Hapus Multiple Bahan Praktikum"
                message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} bahan praktikum?`}
                loading={bulkDeleteLoading}
                size="sm"
            />
            {showAddModal && (
                <Modal
                    show={showAddModal}
                    onClose={handleCloseAddModal}
                    title={isEditMode ? 'Edit Bahan Praktikum' : 'Tambah Bahan Praktikum Baru'}
                    size="lg"
                    closeOnOverlayClick={false}
                >
                    <TambahBahan
                        onClose={handleCloseAddModal}
                        onSuccess={handleAddSuccess}
                        postDataBahan={postDataBahan}
                        editingBahan={editingBahan}
                        isEditMode={isEditMode}
                        labs={labs}
                    />
                </Modal>
            )}
            {/* Modal Export */}
            <ExportModal
                show={showExportModal}
                onClose={() => setShowExportModal(false)}
                data={data}
                columns={columns}
                filename="data-bahan-praktikum"
                title="Export Data Bahan Praktikum"
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
                alt={selectedImage?.title || 'Bahan Praktikum Photo'}
            />
        </div>
    )
}