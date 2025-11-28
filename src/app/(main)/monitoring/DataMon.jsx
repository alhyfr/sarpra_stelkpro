'use client'
import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable';
import DeleteModal from '@/components/Delete'
import ExportModal from '@/components/ExportModal'
import { Trash2 } from 'lucide-react'
import api from '@/app/utils/Api'
import ImageView from '@/components/ImageView'
import Aswitch from '@/components/Aswitch';
import { useData } from '@/app/context/DataContext';
import dayjs from 'dayjs';
const STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE || ''
export default function DataMon() {
    const { getOpsi, gedung } = useData()
    const [data, setData] = useState([])           // Data yang ditampilkan di table
    const [total, setTotal] = useState(0)         // Total data dari server (untuk pagination)
    const [loading, setLoading] = useState(false) // Loading state saat fetch data
    const [currentPage, setCurrentPage] = useState(1)     // Halaman aktif
    const [itemsPerPage, setItemsPerPage] = useState(10) // Jumlah item per halaman
    const [searchTerm, setSearchTerm] = useState('')      // Kata kunci pencarian
    const [sortField, setSortField] = useState('')       // Field yang di-sort
    const [sortDirection, setSortDirection] = useState('asc') // Arah sorting (asc/desc)
    const [filters, setFilters] = useState({})

    const [showDeleteModal, setShowDeleteModal] = useState(false)     // Modal konfirmasi hapus
    const [deletingMonitoring, setDeletingMonitoring] = useState(null)           // Data yang akan dihapus
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false) // Modal konfirmasi hapus multiple
    const [bulkDeleteIds, setBulkDeleteIds] = useState([])               // Array ID yang akan dihapus
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
    const [showExportModal, setShowExportModal] = useState(false)
    const [showImageView, setShowImageView] = useState(false)            // Image viewer modal
    const [selectedImage, setSelectedImage] = useState(null)
    const getImageUrl = (filename) => {
        if (!filename) return null
        if (filename.startsWith('http://') || filename.startsWith('https://')) {
            return filename
        }
        if (filename.startsWith('/')) {
            return `${STORAGE_URL}${filename}`
        }
        return `${STORAGE_URL}/${filename}`
    }
    const handleViewImage = (item) => {
        const imageUrl = getImageUrl(item.gambar)
        if (imageUrl) {
            setSelectedImage({
                url: imageUrl,
                title: item.desc,
                description: `${item.ruang || ''}`
            })
            setShowImageView(true)
        }
    }
    const columns = [
        {
            key: 'tgl_mon',
            title: 'Tanggal Monitoring',
            sortable: true,
            searchable: true,
            type: "dateRange",
            format: "DD-MM-YYYY",
            render: (value) => {
                if (!value) return '-';
                return dayjs(value).format("DD-MM-YYYY");
            },
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
            key: 'kode',
            title: 'Kode Aset',
            sortable: true,
            searchable: true,
        },
        {
            key: 'desc',
            title: 'Deskripsi',
            sortable: true,
            searchable: true,
        },
        {
            key: 'ruang',
            title: 'Ruangan',
            sortable: true,
            searchable: true,
        },
        {
            key: 'kondisi',
            title: 'Kondisi',
            sortable: true,
            searchable: true,
            filterable: true,
            filterOptions: [
                { value: 'baik', label: 'Baik' },
                { value: 'rusak', label: 'Rusak' },
                { value: 'tidak berfungsi', label: 'Tidak Berfungsi' },
                { value: 'tidak sempurna', label: 'Tidak Sempurna' },
            ]
        },
        {
            key: 'ket',
            title: 'Keterangan',
            sortable: true,
            searchable: true,
        },
        {
            key: 'pic',
            title: 'PIC',
            sortable: true,
            searchable: true,
        },
        {
            key: 'gambar',
            title: 'Foto',
            sortable: true,
            searchable: true,
            render: (value, item) => {
                const imageUrl = getImageUrl(value)
                if (!imageUrl) {
                    return (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {item.desc?.charAt(0).toUpperCase() || '?'}
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
                            alt={item.desc || 'Foto Gedung'}
                            className="w-full h-full object-cover"
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
                    icon: Trash2,
                    title: 'Delete',
                    onClick: (item) => handleDelete(item),
                },
            ],
        },
    ]
    const getDataMonitoring = async (params = {}, showLoading = true) => {
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
                api.get(`/sp/monitoring?${queryParams}`),
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
    const handleDelete = (item) => {
        setDeletingMonitoring(item)
        setShowDeleteModal(true)
    }
    const handleConfirmDelete = async () => {
        if (!deletingMonitoring) return

        setDeleteLoading(true)
        try {
            await api.delete(`/sp/monitoring/${deletingMonitoring.id}`)
            getDataMonitoring()
            setShowDeleteModal(false)
            setDeletingMonitoring(null)
        } catch (error) {
            console.error('Error deleting monitoring:', error)
        } finally {
            setDeleteLoading(false)
        }
    }
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setDeletingMonitoring(null)
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
            const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/monitoring/${id}`))  // 🔧 GANTI: endpoint delete
            await Promise.all(deletePromises)
            getDataMonitoring()
            setShowBulkDeleteModal(false)
            setBulkDeleteIds([])
        } catch (error) {
            console.error('Error bulk deleting monitoring :', error)
        } finally {
            setBulkDeleteLoading(false)
        }
    }
    const handleCloseBulkDeleteModal = () => {
        setShowBulkDeleteModal(false)
        setBulkDeleteIds([])
        setBulkDeleteLoading(false)
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
        getDataMonitoring(params)
    }
    useEffect(() => {
        getDataMonitoring()
    }, [])
    return (
        <div>
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
                onExport={handleExport}
                onBulkDelete={handleBulkDelete}

                // Pagination
                pagination={true}
                itemsPerPageOptions={[5, 10, 25, 50]}
                defaultItemsPerPage={10}

                // Title
                title="Data Monitoring"
                subtitle="Kelola data Monitoring"

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
                title="Hapus Monitoring"
                message={`Apakah Anda yakin ingin menghapus monitoring "${deletingMonitoring?.desc}"?`}
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
                title="Hapus Multiple Monitoring"
                message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} monitoring?`}
                loading={bulkDeleteLoading}
                size="sm"
            />
            <ExportModal
                show={showExportModal}
                onClose={() => setShowExportModal(false)}
                data={data}
                columns={columns}
                filename="data-ruangan"
                title="Export Data Ruangan"
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
                alt={selectedImage?.title || 'Ruangan Photo'}
            />
        </div>
    )
}