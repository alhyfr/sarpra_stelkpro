"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import ImageView from "@/components/ImageView";
import dayjs from "dayjs";
import Aswitch from "@/components/Aswitch";
import { useData } from "@/app/context/DataContext";
import AddPaset from "./AddPaset";
export default function DataAset() {
  const { subscribeWebSocket } = useData();
  const [data, setData] = useState([]); // Data yang ditampilkan di table
  const [total, setTotal] = useState(0); // Total data dari server (untuk pagination)
  const [loading, setLoading] = useState(false); // Loading state saat fetch data
  const [currentPage, setCurrentPage] = useState(1); // Halaman aktif
  const [itemsPerPage, setItemsPerPage] = useState(10); // Jumlah item per halaman
  const [searchTerm, setSearchTerm] = useState(""); // Kata kunci pencarian
  const [sortField, setSortField] = useState(""); // Field yang di-sort
  const [sortDirection, setSortDirection] = useState("asc"); // Arah sorting (asc/desc)
  const [filters, setFilters] = useState({});
  const [showAddModal, setShowAddModal] = useState(false); // Modal tambah/edit data
  const [editingPaset, setEditingPaset] = useState(null); // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingPaset, setDeletingPaset] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageView, setShowImageView] = useState(false);
  const getImageUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
      return filename;
    }
    const baseURL =
      process.env.NEXT_PUBLIC_API_STORAGE ||
      "http://localhost:3002/api/storage/";

    if (filename.startsWith("/")) {
      return `${baseURL}${filename}`;
    }
    return `${baseURL}/${filename}`;
  };
  const handleViewImage = (item) => {
    const imageUrl = getImageUrl(item.gambar);
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        title: item.nabar || "Foto Aset",
      });
      setShowImageView(true);
    }
  };
  const columns = [
    {
      key: "kode",
      title: "Kode Barang",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "desc",
      title: "Nama Barang",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "ruang",
      title: "Lokasi",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "jenis_kerusakan",
      title: "Jenis Kerusakan",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "tgl_masuk",
      title: "Tanggal Masuk",
      sortable: true,
      searchable: true,
      filterable: true,
      type: "dateRange",
      format: "DD-MM-YYYY",
      render: (value) => dayjs(value).format("DD-MM-YYYY"),
      filterOptions: [
        { value: "last3Months", label: "3 Bulan Terakhir" },
        { value: "custom", label: "Custom Range" },
      ],
    },
    {
      key: "tindakan",
      title: "Tindakan",
      sortable: true,
      searchable: true,
      wrap: true,
      minWidth: "200px",
    },
    {
      key: "tgl_selesai",
      title: "Tanggal Selesai",
      sortable: true,
      searchable: true,
      filterable: true,
      format: "DD-MM-YYYY",
      render: (value) => value ? dayjs(value).format("DD-MM-YYYY") : "Dalam Proses",
    },

    {
      key: "status",
      title: "Status",
      sortable: true,
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: "proses", label: "Proses" },
        { value: "selesai", label: "Selesai" },
        { value: "terjadwal", label: "Terjadwal" },
      ],
    },
    {
      key: "gambar",
      title: "Gambar",
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
            onClick={() => handleViewImage(item)}
            title="Klik untuk melihat gambar"
          >
            <img
              src={imageUrl}
              alt={item.desc || 'Foto Peminjaman Barang'}
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
      key: "actions",
      title: "Actions",
      sortable: true,
      searchable: true,
      filterable: true,
      type: "actions",
      actions: [
        {
          icon: Edit,
          title: "Edit",
          onClick: (item) => handleEdit(item),
        },
        {
          icon: Trash2,
          title: "Delete",
          onClick: (item) => handleDelete(item),
        },
      ],
    },
  ];
  const getPaset = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/perbaikan-aset?${queryParams}`),
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
  const postPaset = async (form) => {
    try {
      let response

      // Setup config untuk multipart/form-data jika upload file
      const config = form instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {}

      // Check if we have editingAtk to determine if it's update or create
      if (editingPaset && editingPaset.id) {
        if (form instanceof FormData) {
          form.append('_method', 'PUT')  // Laravel method spoofing
          response = await api.put(`/sp/perbaikan-aset/${editingPaset.id}`, form, config)
        } else {
          response = await api.put(`/sp/perbaikan-aset/${editingPaset.id}`, form, config)
        }
      } else {
        response = await api.post('/sp/perbaikan-aset', form, config)
      }
      if (response.data.status === 'success') {
        // Refresh data setelah berhasil
        getPaset()
        setShowAddModal(false)
        setEditingPaset(null)
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
    setDeletingPaset(item)
    setShowDeleteModal(true)
  }
  const handleConfirmDelete = async () => {
    if (!deletingPaset) return

    setDeleteLoading(true)
    try {
      await api.delete(`/sp/perbaikan-aset/${deletingPaset.id}`)  // Fix: gunakan id dari object
      getPaset()  // Fix: nama function yang benar
      setShowDeleteModal(false)
      setDeletingPaset(null)  // Fix: nama variable yang benar
    } catch (error) {
      // Error handling untuk delete
    } finally {
      setDeleteLoading(false)
    }
  }
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingPaset(null)
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
      const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/perbaikan-aset/${id}`))  // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises)
      getPaset()
      setShowBulkDeleteModal(false)
      setBulkDeleteIds([])
    } catch (error) {
      // Error handling untuk bulk delete
    } finally {
      setBulkDeleteLoading(false)
    }
  }
  const handleAdd = () => {
    setEditingPaset(null)
    setIsEditMode(false)
    setShowAddModal(true)
  }
  const handleEdit = (item) => {
    setEditingPaset(item)
    setIsEditMode(true)
    setShowAddModal(true)
  }
  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setEditingPaset(null)
    setIsEditMode(false)
  }
  const handleAddSuccess = (newPaset) => {
    getPaset()
    setShowAddModal(false)
    setEditingPaset(null)
    setIsEditMode(false)
  }
  const handleExport = () => {
    setShowExportModal(true)
  }
  const handleStatusChange = async (item, newStatus) => {
    try {
      await api.put(`/sp/perbaikan-barang-status/${item.id}`, {
        status: newStatus,
      });
      getPaset();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
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
    getPaset(params)
  }
  useEffect(() => {
    getPaset()
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
        title="Data Perbaikan Aset"
        subtitle="Kelola data perbaikan aset"
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
        title="Hapus Perbaikan Aset"
        message={`Apakah Anda yakin ingin menghapus "${deletingPaset?.kode}"?`}
        loading={deleteLoading}
        size="sm"
      />
      <DeleteModal
        show={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Multiple Perbaikan Aset"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} Perbaikan Aset?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      <DeleteModal
        show={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Multiple Perbaikan Aset"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} Perbaikan Aset?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={
            isEditMode ? "Edit Perbaikan Aset" : "Tambah Perbaikan Aset Baru"
          }
          size="xl"
          closeOnOverlayClick={false}
        >
          <AddPaset
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postPaset={postPaset}
            editingPaset={editingPaset}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-perbaikan-aset"
        title="Export Data Perbaikan Aset"
      />
      <ImageView
        show={showImageView && selectedImage !== null}
        onClose={() => {
          setShowImageView(false)
          setSelectedImage(null)
        }}
        images={selectedImage?.url}
        title={selectedImage?.title}
        alt={selectedImage?.title || 'Foto Perbaikan Aset'}
      />

    </div>
  );
}
