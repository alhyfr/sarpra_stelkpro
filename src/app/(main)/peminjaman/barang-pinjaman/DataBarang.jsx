"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import TambahBarang from "./TambahBarang";
import Aswitch from "@/components/Aswitch";
import { useData } from "@/app/context/DataContext";

export default function DataBarang() {
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
  const [editingPinjam, setEditingPinjam] = useState(null); // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingPinjam, setDeletingPinjam] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const columns = [
    {
      key: "kode",
      title: "Kode",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "nabar",
      title: "Nama Barang",
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
        { value: "on", label: "ON" },
        { value: "off", label: "OFF" },
      ],
      render: (value, item) => (
        <Aswitch
          value={value}
          onChange={(newStatus) => handleStatusChange(item, newStatus)}
          size="sm"
          onValue="on"
          offValue="off"
          showIcons={true}
          labels={{
            on: 'ON',
            off: 'OFF'
          }}
        />
      ),
    },
    {
      key: "kategori",
      title: "Kategori",
      sortable: true,
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: "perabotan", label: "Perabotan" },
        { value: "elektronik", label: "Elektronik" },
        { value: "perlengkapan ruangan", label: "Perlengkapan Ruangan" },
        { value: "kendaraan", label: "Kendaraan" },
        { value: "alat laboratorium", label: "Alat Laboratorium" },
        { value: "sistem keamanan", label: "Sistem Keamanan" },
        { value: "perlengkapan pengikat", label: "Perlengkapan Pengikat" },
        { value: "perlengkapan cetak", label: "Perlengkapan Cetak" },
        { value: "perlengkapan kebersihan", label: "Perlengkapan Kebersihan" },
      ],
    },
    {
      key: "ket",
      title: "Keterangan",
      sortable: true,
      searchable: true,
      filterable: true,
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
  const getBarangPinjaman = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/pinjam?${queryParams}`),
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
  const postBarangPinjaman = async (form) => {
    try {
      let response;
      // Check if form contains any File objects (actual file uploads)
      const hasFileUpload =
        form instanceof FormData &&
        Array.from(form.entries()).some(
          ([key, value]) => value instanceof File
        );

      const config = hasFileUpload
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : {};

      if (editingPinjam) {
        if (hasFileUpload) {
          form.append("_method", "PUT");
          response = await api.put(
            `/sp/pinjam/${editingPinjam.id}`,
            form,
            config
          );
        } else {
          response = await api.put(
            `/sp/pinjam/${editingPinjam.id}`,
            form,
            config
          );
        }
      } else {
        response = await api.post("/sp/pinjam", form, config);
      }

      if (response.data.message === "success") {
        getBarangPinjaman();
        setShowAddModal(false);
        setEditingPinjam(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error("Terjadi kesalahan saat menyimpan data");
      }
    }
  };
  const handleConfirmDelete = async () => {
    if (!deletingPinjam) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/sp/pinjam/${deletingPinjam.id}`);
      getBarangPinjaman();
      setShowDeleteModal(false);
      setDeletingPinjam(null);
    } catch (error) {
      console.error("Error deleting Barang Pinjaman:", error);
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingPinjam(null);
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
      const deletePromises = bulkDeleteIds.map((id) =>
        api.delete(`/sp/pinjam/${id}`)
      );
      await Promise.all(deletePromises);
      getBarangPinjaman();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting Barang Pinjaman:", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };
  const handleAdd = () => {
    setEditingPinjam(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };
  const handleEdit = (item) => {
    setEditingPinjam(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingPinjam(null);
    setIsEditMode(false);
  };

  const handleDelete = (item) => {
    setDeletingPinjam(item);
    setShowDeleteModal(true);
  };
  const handleAddSuccess = (newPinjam) => {
    getBarangPinjaman();
    setShowAddModal(false);
    setEditingPinjam(null);
    setIsEditMode(false);
  };
  const handleExport = () => {
    setShowExportModal(true);
  };
  const handleStatusChange = async (item, newStatus) => {
    try {
      await api.put(`/sp/pinjam-status/${item.id}`, {
        status: newStatus,
      });
      getBarangPinjaman();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const handleDataChange = (params) => {
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

    getBarangPinjaman(params);
  };
  useEffect(() => {
    getBarangPinjaman();
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
        title="Data Barang Pinjaman"
        subtitle="Kelola data barang pinjaman"
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
        title="Hapus Barang Pinjaman"
        message={`Apakah Anda yakin ingin menghapus "${deletingPinjam?.nabar}"?`}
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
        title="Hapus Multiple Barang Pinjaman"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} Barang Pinjaman?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={
            isEditMode ? "Edit Barang Pinjaman" : "Tambah Barang Pinjaman Baru"
          }
          size="lg"
          closeOnOverlayClick={false}
        >
          <TambahBarang
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postBarangPinjaman={postBarangPinjaman}
            editingPinjam={editingPinjam}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-barang-pinjaman"
        title="Export Data Barang Pinjaman"
      />
    </div>
  );
}
