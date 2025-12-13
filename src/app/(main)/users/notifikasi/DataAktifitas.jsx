'use client'
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import dayjs from "dayjs";
import "dayjs/locale/id";

export default function DataAktifitas() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filters, setFilters] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNotifikasi, setDeletingNotifikasi] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const columns = [
    {
      key: "index",
      title: "No",
      type: "index",
      searchable: false,
      filterable: false,
      sortable: false,
    },
    {
      key: "user_id",
      title: "User ID",
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      key: "username",
      title: "Username",
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      key: "created_at",
      title: "Tanggal Aktifitas",
      format: "DD-MM-YYYY",
      searchable: true,
      filterable: true,
      sortable: true,
      render: (value) => dayjs(value).locale("id").format("dddd, DD-MM-YYYY HH:mm"),
    },
    {
      key: "aktifitas",
      title: "Aktifitas",
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
        key: "actions",
        title: "Actions",
        type: "actions",
        sortable: false,
        actions: [
          {
            icon: Trash2,
            title: "Delete",
            onClick: (item) => handleDelete(item),
          },
        ],
      },
  ];
  const getNotifikasi = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/aktifitas-user?${queryParams}`),
        minLoadingTime,
      ]);

      if (response.data.status === "success") {
        setData(response.data.data);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setItemsPerPage(response.data.per_page);
        // console.log(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setData([]);
      setTotal(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  const handleDelete = (item) => {
    setDeletingNotifikasi(item);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/sp/aktifitas/${deletingEvent.id}`); // Fix: gunakan id dari object
      // Refresh data after delete
      getNotifikasi(); // Fix: nama function yang benar
      setShowDeleteModal(false);
      setDeletingNotifikasi(null); // Fix: nama variable yang benar
    } catch (error) {
      console.error("Error deleting event:", error); // Fix: pesan error
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingNotifikasi(null);
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
        api.delete(`/sp/aktifitas/${id}`)
      ); // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises);
      getNotifikasi();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting notifikasi :", error);
    } finally {
      setBulkDeleteLoading(false);
    }
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
    getNotifikasi(params);
  };
  useEffect(() => {
    getNotifikasi();
  }, []);
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
        title="Data Aktifitas"
        subtitle="Data Aktifitas"
        // Server-side Mode (PENTING!)
        serverSide={true}
        onDataChange={handleDataChange} // ⚡ INI YANG PENTING - menghubungkan search/filter dengan API
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
        title="Hapus Aktifitas"
        message={`Apakah Anda yakin ingin menghapus aktifitas "${deletingNotifikasi?.aktifitas}"?`}
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
        title="Hapus Multiple Aktifitas"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} aktifitas?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
       <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-aktifitas"
        title="Export Data Aktifitas"
      />
        </div>
    )
}