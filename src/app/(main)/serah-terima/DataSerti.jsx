"use client";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2, FileText } from "lucide-react";
import api from "@/app/utils/Api";
import TambahSerti from "./TambahSerti";
import dayjs from "dayjs";
import { useData } from "@/app/context/DataContext";
import { useRouter } from "next/navigation";
const Vbukti = dynamic(() => import("../inventaris/master/Vbukti"), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-gray-200"></div>,
});

export default function DataSerti() {
  const { getOpsi, gedung } = useData();
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
  const [editingSerti, setEditingSerti] = useState(null); // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingSerti, setDeletingSerti] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const router = useRouter();
  const columns = [
    {
      key: 'tgl',
      title: 'TANGGAL',
      sortable: true,
      searchable: true,
      render: (value) => dayjs(value).format('DD-MM-YYYY'),
    },
    {
      key: 'nip',
      title: 'NIP',
      sortable: true,
      searchable: true,
    },
    {
      key: 'penerima',
      title: 'NAMA PENERIMA',
      sortable: true,
      searchable: true,
    },
    {
      key: 'unit',
      title: 'UNIT',
      sortable: true,
      searchable: true,
    },
    {
      key: 'jabatan',
      title: 'JABATAN',
      sortable: true,
      searchable: true,
    },
    {
      key: 'nama',
      title: 'PENYERAH',
      sortable: true,
      searchable: true,
    },
    {
      key: 'list',
      title: 'LIST',
      sortable: false,
      searchable: false,
      render: (value, item) => {
        if (!item || !item.id) return null;

        // Simpan data ke sessionStorage sebelum navigasi
        const handleClick = () => {
          sessionStorage.setItem(`serah_terima_${item.id}`, JSON.stringify(item));
        };

        return (
          <Link href={`/serah-terima/${item.id}`} onClick={handleClick}>
            <button className="
                inline-flex items-center justify-center gap-2
                px-4 py-2
                text-sm font-medium text-white
                bg-gradient-to-r from-blue-500 to-blue-600
                hover:from-blue-600 hover:to-blue-700
                rounded-lg
                shadow-md hover:shadow-lg
                transition-all duration-200 ease-in-out
                transform hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ">
              <FileText className="w-4 h-4" />
              Data
            </button>
          </Link>
        );
      },
    },
    {
      key: "actions",
      title: "ACTIONS",
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
  ]
  const getSerti = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/serti?${queryParams}`),
        minLoadingTime,
      ]);

      if (response.data.status === "success") {
        setData(response.data.data);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setItemsPerPage(response.data.per_page);
      }
    } catch (error) {
      console.error("Error fetching serah-terima:", error);
      setData([]);
      setTotal(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  const postSerti = async (form) => {
    try {
      let response;
      const config =
        form instanceof FormData
          ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
          : {};
      if (editingSerti && editingSerti.id && isEditMode) {
        if (form instanceof FormData) {
          form.append("_method", "PUT"); // Laravel method spoofing
          response = await api.put(`/sp/serti/${editingSerti.id}`, form, config);
        } else {
          response = await api.put(`/sp/serti/${editingSerti.id}`, form, config);
        }
      } else {
        response = await api.post("/sp/serti", form, config);
      }

      if (response.data.status === "success") {
        getSerti();
        setShowAddModal(false);
        setEditingSerti(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      console.error("Error saving serah-terima:", error);
      if (error.response?.data?.message) {
        if (error.response.data.field) {
          const fieldError = new Error(error.response.data.message);
          fieldError.field = error.response.data.field;
          throw fieldError;
        }
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error("Terjadi kesalahan saat menyimpan data");
      }
    }
  };
  const handleDelete = (item) => {
    setDeletingSerti(item);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (!deletingSerti) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sp/serti/${deletingSerti.id}`);
      getSerti();
      setShowDeleteModal(false);
      setDeletingSerti(null);
    } catch (error) {
      console.error("Error deleting serah-terima:", error);
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingSerti(null);
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
        api.delete(`/sp/serti/${id}`)
      ); // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises);
      getSerti();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting serah-terima :", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };
  const handleAdd = () => {
    setEditingSerti(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };
  const handleEdit = (item) => {
    setEditingSerti(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingSerti(null);
    setIsEditMode(false);
  };
  const handleAddSuccess = (newSerti) => {
    getSerti();
    setShowAddModal(false);
    setEditingSerti(null);
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
    getSerti(params);
  };
  useEffect(() => {
    getSerti();
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
        title="Data Serah Terima Barang"
        subtitle="Kelola data Serah Terima Barang"
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
        title="Hapus Serah Terima Barang"
        message={`Apakah Anda yakin ingin menghapus serah terima barang "${deletingSerti?.nama}"?`}
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
        title="Hapus Multiple Serah Terima Barang"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} serah terima barang?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? "Edit Serah Terima Barang" : "Tambah Serah Terima Barang Baru"}
          width="700px"
          closeOnOverlayClick={false}
        >
          <TambahSerti
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postSerti={postSerti}
            editingSerti={editingSerti}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-serah-terima-barang"
        title="Export Data Serah Terima Barang"
      />
    </div>
  );
}
