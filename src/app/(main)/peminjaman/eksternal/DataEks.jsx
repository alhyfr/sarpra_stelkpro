"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import AddEks from "./AddEks";
import dayjs from "dayjs";
import Link from "next/link";

export default function DataEks() {
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
  const [editingPineks, setEditingPineks] = useState(null); // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingPineks, setDeletingPineks] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const columns = [
    {
      key: "nik",
      title: "NIK",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "nama",
      title: "Nama",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "kegiatan",
      title: "Keguatan",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "tempat",
      title: "Tempat",
      sortable: true,
      searchable: true,
      filterable: true,
      wrap: true,
      width: "200px",
      
    },
    {
      key: "tgl_pinjam",
      title: "TGL Pinjam",
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
      key: "tgl_kembali",
      title: "TGL Kembali",
      sortable: true,
      searchable: true,
      filterable: true,
      type: "dateRange",
      format: "DD-MM-YYYY",
      render: (value) => {
        if (!value || value === null || value === "") {
          return <span className="text-gray-500 italic">Belum kembali</span>;
        }
        return dayjs(value).format("DD-MM-YYYY");
      },
    },
    {
      key:'data',
      title: "Data",
      sortable: false,
      searchable: false,
      filterable: false,
      render: (value, item) => {
        // item adalah seluruh row data
        if (!item || !item.id) return null;
        
        // Simpan data ke sessionStorage sebelum navigasi untuk URL yang lebih pendek
        const handleClick = () => {
          sessionStorage.setItem(`peminjaman_eksternal_${item.id}`, JSON.stringify(item));
        };
        
        return (
          <Link href={`/peminjaman/eksternal/${item.id}`} onClick={handleClick}>
            <button className="
              inline-flex items-center justify-center
              px-4 py-2
              text-sm font-medium text-white
              bg-gradient-to-r from-green-500 to-green-600
              hover:from-green-600 hover:to-green-700
              rounded-lg
              shadow-md hover:shadow-lg
              transition-all duration-200 ease-in-out
              transform hover:scale-105 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            ">
              Data
            </button>
          </Link>
        );
      },
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
  const getPineks = async (params = {}, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 800));
      const queryParams = new URLSearchParams({
        page: params.page || currentPage,
        per_page: params.per_page || itemsPerPage,
      });
      const searchValue =
        params.search !== undefined ? params.search : searchTerm;
      if (searchValue && searchValue.trim() !== "") {
        queryParams.append("search", searchValue);
      }
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value);
          }
        });
      }

      const [response] = await Promise.all([
        api.get(`/sp/pin-eks?${queryParams}`),
        minLoadingTime,
      ]);

      if (response.data.message === "success") {
        setData(response.data.data);
        setTotal(response.data.pagination?.total || response.data.data.length);
        setCurrentPage(response.data.pagination?.current_page || 1);
        setItemsPerPage(response.data.pagination?.per_page || 10);
      }
    } catch (error) {
      setData([]);
      setTotal(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  const postPineks = async (form) => {
    try {
      let response;

      // Setup config untuk multipart/form-data jika upload file
      const config =
        form instanceof FormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : {};

      // Check if we have editingAtk to determine if it's update or create
      if (editingPineks && editingPineks.id) {
        if (form instanceof FormData) {
          form.append("_method", "PUT"); // Laravel method spoofing
          response = await api.put(
            `/sp/pin-eks/${editingPineks.id}`,
            form,
            config
          );
        } else {
          response = await api.put(
            `/sp/pin-eks/${editingPineks.id}`,
            form,
            config
          );
        }
      } else {
        response = await api.post("/sp/pin-eks", form, config);
      }
      if (response.data.message === "success") {
        // Refresh data setelah berhasil
        getPineks();
        setShowAddModal(false);
        setEditingPineks(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      // Re-throw error agar bisa ditangani di TambahAtk component
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error("Terjadi kesalahan saat menyimpan data");
      }
    }
  };
  const handleDelete = (item) => {
    setDeletingPineks(item);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (!deletingPineks) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/sp/pin-eks/${deletingPineks.id}`); // Fix: gunakan id dari object
      getPineks(); // Fix: nama function yang benar
      setShowDeleteModal(false);
      setDeletingPineks(null); // Fix: nama variable yang benar
    } catch (error) {
      // Error handling untuk delete
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingPineks(null);
    setDeleteLoading(false);
  };
  const handleBulkDelete = (selectedIds) => {
    setBulkDeleteIds(selectedIds);
    setShowBulkDeleteModal(true);
  };
  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return;
    setBulkDeleteLoading(true);
    try {
      // Delete multiple users
      const deletePromises = bulkDeleteIds.map((id) =>
        api.delete(`/sp/pin-eks/${id}`)
      ); // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises);
      getPineks();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      // Error handling untuk bulk delete
    } finally {
      setBulkDeleteLoading(false);
    }
  };
  const handleAdd = () => {
    setEditingPineks(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };
  const handleEdit = (item) => {
    setEditingPineks(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingPineks(null);
    setIsEditMode(false);
  };
  const handleAddSuccess = (newAtk) => {
    getPineks();
    setShowAddModal(false);
    setEditingPineks(null);
    setIsEditMode(false);
  };
  const handleExport = () => {
    setShowExportModal(true);
  };
  const handleDataChange = (params) => {
    // Update state berdasarkan perubahan dari DataTable
    if (params.page !== undefined) {
      setCurrentPage(params.page);
    }
    if (params.per_page !== undefined) {
      setItemsPerPage(params.per_page);
    }
    if (params.search !== undefined) {
      setSearchTerm(params.search);
    }
    if (params.filters !== undefined) {
      setFilters(params.filters);
    }
    if (params.sortField !== undefined) {
      setSortField(params.sortField);
    }
    if (params.sortDirection !== undefined) {
      setSortDirection(params.sortDirection);
    }

    // Fetch data dengan params baru
    getPineks(params);
  };
  useEffect(() => {
    getPineks();
  }, []);
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
        title="Data Peminjaman Eksternal"
        subtitle="Kelola data peminjaman eksternal"
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
        title="Hapus Peminjaman Eksternal"
        message={`Apakah Anda yakin ingin menghapus "${deletingPineks?.nama}"?`}
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
        title="Hapus Multiple Peminjaman Eksternal"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} Peminjaman Eksternal?`}
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
        title="Hapus Multiple Peminjaman Eksternal"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} Peminjaman Eksternal?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={
            isEditMode ? "Edit Peminjaman Eksternal" : "Tambah Peminjaman Eksternal Baru"
          }
          size="xl"
          closeOnOverlayClick={false}
        >
          <AddEks
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postPineks={postPineks}
            editingPineks={editingPineks}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-Peminjaman-Eksternal"
        title="Export Data Peminjaman Eksternal"
      />
    </div>
  );
}
