'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal'
import DeleteModal from '@/components/Delete'
import ExportModal from '@/components/ExportModal'
import { Edit, Trash2 } from 'lucide-react'
import api from '@/app/utils/Api'
import TambahDaftar from './TambahDaftar'
import ImageView from '@/components/ImageView'
const STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE || ''
export default function DataDaftar() {
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
    const [editingDaftar, setEditingDaftar] = useState(null)        // Data yang sedang diedit
    const [isEditMode, setIsEditMode] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)     // Modal konfirmasi hapus
    const [deletingDaftar, setDeletingDaftar] = useState(null)           // Data yang akan dihapus
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
                title: item.nama,
                description: `${item.gedung || ''}`
            })
            setShowImageView(true)
        }
    }
    const columns = [
        {
            key: 'nama_lab',
            title: 'Nama Lab',
            sortable: true,
            searchable: true,
        },
        {
            key: 'ruangan',
            title: 'Ruangan',
            sortable: true,
            searchable: true,
        },
        {
            key: 'jurusan',
            title: 'Jurusan',
            sortable: true,
            searchable: true,
            wrap: true,
            minWidth: '300px',
        },
        {
            key: 'laboran',
            title: 'Laboran',
            sortable: true,
            searchable: true,
            wrap: true,
            minWidth: '300px',
        },
        {
            key: 'foto',
            title: 'Foto',
            render: (value, item) => {
                const imageUrl = getImageUrl(value)

                if (!imageUrl) {
                    return (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {item.gedung?.charAt(0).toUpperCase() || '?'}
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
                            alt={item.gedung || 'Foto Gedung'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none'
                                const parent = e.target.parentElement
                                parent.classList.add('flex', 'items-center', 'justify-center', 'dark:bg-gray-700')
                                parent.innerHTML = `<span class="text-xs text-gray-500 dark:text-gray-400 font-medium">${item.gedung?.charAt(0).toUpperCase() || '?'}</span>`
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
    const getDaftarLab = async (params = {}, showLoading = true) => {
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
                api.get(`/sp/daftar-lab?${queryParams}`),
                minLoadingTime
            ])

            if (response.data.status === 'success') {
                setData(response.data.data)
                setTotal(response.data.total)
                setCurrentPage(response.data.page)
                setItemsPerPage(response.data.per_page)
            }
        } catch (error) {
            console.error('Error fetching daftar lab:', error)
            setData([])
            setTotal(0)
        } finally {
            if (showLoading) {
                setLoading(false)
            }
        }
    }
    const postDaftarLab = async (form) => {
        try {
            let response
            const config = form instanceof FormData ? {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            } : {}
            if (editingDaftar && editingDaftar.id) {
                if (form instanceof FormData) {
                    form.append('_method', 'PUT')
                    response = await api.put(`/sp/daftar-lab/${editingDaftar.id}`, form, config)
                } else {
                    response = await api.put(`/sp/daftar-lab/${editingDaftar.id}`, form, config)
                }
            } else {
                response = await api.post('/sp/daftar-lab', form, config)
            }
            if (response.data.status === 'success') {
                getDaftarLab()
                setShowAddModal(false)
                setEditingDaftar(null)
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
        setDeletingDaftar(item)
        setShowDeleteModal(true)
    }
    const handleConfirmDelete = async () => {
        if (!deletingDaftar) return

        setDeleteLoading(true)
        try {
            await api.delete(`/sp/daftar-lab/${deletingDaftar.id}`)
            getDaftarLab()
            setShowDeleteModal(false)
            setDeletingDaftar(null)
        } catch (error) {
            console.error('Error deleting daftar lab:', error)
        } finally {
            setDeleteLoading(false)
        }
    }
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setDeletingDaftar(null)
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
            const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/daftar-lab/${id}`))  // 🔧 GANTI: endpoint delete
            await Promise.all(deletePromises)
            getDaftarLab()
            setShowBulkDeleteModal(false)
            setBulkDeleteIds([])
        } catch (error) {
            console.error('Error bulk deleting daftar lab :', error)
        } finally {
            setBulkDeleteLoading(false)
        }
    }
    const handleAdd = () => {
        setEditingDaftar(null)
        setIsEditMode(false)
        setShowAddModal(true)
    }
    const handleEdit = (item) => {
        setEditingDaftar(item)
        setIsEditMode(true)
        setShowAddModal(true)
    }
    const handleCloseAddModal = () => {
        setShowAddModal(false)
        setEditingDaftar(null)
        setIsEditMode(false)
    }
    const handleAddSuccess = (newTeam) => {
        getDaftarLab()
        setShowAddModal(false)
        setEditingDaftar(null)
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
        getDaftarLab(params)
    }
    useEffect(() => {
        getDaftarLab()
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
                title="Data Daftar Lab"
                subtitle="Kelola data Daftar Lab"
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
                title="Hapus Daftar Lab"
                message={`Apakah Anda yakin ingin menghapus daftar lab "${deletingDaftar?.nama_lab}"?`}
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
                title="Hapus Multiple Daftar Lab"
                message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} daftar lab?`}
                loading={bulkDeleteLoading}
                size="sm"
            />
            {showAddModal && (
                <Modal
                    show={showAddModal}
                    onClose={handleCloseAddModal}
                    title={isEditMode ? 'Edit Daftar Lab' : 'Tambah Daftar Lab Baru'}
                    size="md"
                    closeOnOverlayClick={false}
                >
                    <TambahDaftar
                        onClose={handleCloseAddModal}
                        onSuccess={handleAddSuccess}
                        postDaftarLab={postDaftarLab}
                        editingDaftar={editingDaftar}
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
                filename="data-daftar-lab"
                title="Export Data Daftar Lab"
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
                alt={selectedImage?.title || 'Daftar Lab Photo'}
            />

        </div>
    )
}