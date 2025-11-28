"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2, Printer } from "lucide-react";
import api from "@/app/utils/Api";
import TambahPinruangan from "./tambahPinruangan";
import dayjs from "dayjs";
import Struk from "./Struk";
import Aswitch from "@/components/Aswitch";
import { useData } from "@/app/context/DataContext";
export default function DataRuangan() {
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
  const [editingPinru, setEditingPinru] = useState(null); // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingPinru, setDeletingPinru] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStrukModal, setShowStrukModal] = useState(false);
  const [selectedPinru, setSelectedPinru] = useState(null);
  const { subscribeWebSocket } = useData();
  const columns = [
    {
      key: "tgl",
      title: "Tanggal Pinjam",
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
      key: 'peminjam',
      title: "Peminjam",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: 'ruangan',
      title: "Ruangan",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "kegiatan",
      title: "Kegiatan",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "jam_mulai",
      title: "Jam Mulai",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "jam_selesai",
      title: "Jam Selesai",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: "proses", label: "Proses" },
        { value: "konfirmasi", label: "Konfirmasi" },
      ],
      render: (value, item) => {
        return <Aswitch
          value={value}
          onChange={(newStatus) => handleStatusChange(item, newStatus)}
          size="sm"
          onValue="konfirmasi"
          offValue="proses"
          showIcons={true}
          labels={{
            on: 'Konfirmasi',
            off: 'Proses'
          }}

        />
      }
    },
    {
      key: "tgl_end",
      title: "Tanggal Selesai",
      sortable: true,
      searchable: true,
      filterable: true,
      type: "dateRange",
      format: "DD-MM-YYYY",
      render: (value) => {
        if (!value || value === "" || value === null) {
          return <span className="text-gray-500 italic">None</span>;
        }
        return dayjs(value).format("DD-MM-YYYY");
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
          icon: Printer,
          title: "Struk",
          onClick: (item) => handleStruk(item),
          show: (item) => item.status === 'konfirmasi',
        },
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
    }
  ];
  const getPinru = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/pinruangan?${queryParams}`),
        minLoadingTime
      ])

      if (response.data.message === 'success') {
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
  const postPinru = async (form) => {
    try {
      let response

      // Setup config untuk multipart/form-data jika upload file
      const config = form instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {}

      // Check if we have editingAtk to determine if it's update or create
      if (editingPinru && editingPinru.id) {
        if (form instanceof FormData) {
          form.append('_method', 'PUT')  // Laravel method spoofing
          response = await api.put(`/sp/pinruangan/${editingPinru.id}`, form, config)
        } else {
          response = await api.put(`/sp/pinruangan/${editingPinru.id}`, form, config)
        }
      } else {
        response = await api.post('/sp/pinruangan', form, config)
      }
      if (response.data.message === 'success') {
        // Refresh data setelah berhasil
        getPinru()
        setShowAddModal(false)
        setEditingPinru(null)
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
    setDeletingPinru(item)
    setShowDeleteModal(true)
  }
  const handleConfirmDelete = async () => {
    if (!deletingPinru) return

    setDeleteLoading(true)
    try {
      await api.delete(`/sp/pinruangan/${deletingPinru.id}`)  // Fix: gunakan id dari object
      getPinru()  // Fix: nama function yang benar
      setShowDeleteModal(false)
      setDeletingPinru(null)  // Fix: nama variable yang benar
    } catch (error) {
      // Error handling untuk delete
    } finally {
      setDeleteLoading(false)
    }
  }
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingPinru(null)
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
      const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/pinruangan/${id}`))  // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises)
      getPinru()
      setShowBulkDeleteModal(false)
      setBulkDeleteIds([])
    } catch (error) {
      // Error handling untuk bulk delete
    } finally {
      setBulkDeleteLoading(false)
    }
  }
  const handleAdd = () => {
    setEditingPinru(null)
    setIsEditMode(false)
    setShowAddModal(true)
  }
  const handleEdit = (item) => {
    setEditingPinru(item)
    setIsEditMode(true)
    setShowAddModal(true)
  }
  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setEditingPinru(null)
    setIsEditMode(false)
  }
  const handleAddSuccess = (newAtk) => {
    getPinru()
    setShowAddModal(false)
    setEditingPinru(null)
    setIsEditMode(false)
  }
  const handleExport = () => {
    setShowExportModal(true)
  }
  const handleStruk = (item) => {
    setSelectedPinru(item);
    setShowStrukModal(true);
  };
  const handleCloseStrukModal = () => {
    setShowStrukModal(false);
    setSelectedPinru(null);
  };
  const handleStatusChange = async (item, newStatus) => {
    try {
      await api.put(`/sp/pinruangan-status/${item.id}`, {
        status: newStatus,
      });
      getPinru();
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
    getPinru(params)
  }
  useEffect(() => {
    getPinru()
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeWebSocket('pinruanganUpdated', () => {
      getPinru(); // Trigger refresh when pinruangan is updated
    });

    return unsubscribe; // Cleanup on unmount
  }, [subscribeWebSocket]);
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
        title="Data Peminjaman Ruangan"
        subtitle="Kelola data peminjaman ruangan"
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
        title="Hapus Peminjaman Ruangan"
        message={`Apakah Anda yakin ingin menghapus peminjaman ruangan "${deletingPinru?.ruangan}" oleh "${deletingPinru?.peminjam}"?`}
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
        title="Hapus Multiple Peminjaman Ruangan"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} Peminjaman Ruangan?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={
            isEditMode ? "Edit Peminjaman Ruangan" : "Tambah Peminjaman Ruangan"
          }
          size="xl"
          closeOnOverlayClick={false}
        >
          <TambahPinruangan
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postPinru={postPinru}
            editingPinru={editingPinru}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-Peminjaman-Ruangan"
        title="Export Data Peminjaman Ruangan"
      />
      {showStrukModal && (
        <Modal
          show={showStrukModal}
          onClose={handleCloseStrukModal}
          title="Struk Peminjaman Ruangan"
          size="lg"
          closeOnOverlayClick={false}
        >
          <Struk data={selectedPinru} />
        </Modal>
      )}
    </div>
  );
}
