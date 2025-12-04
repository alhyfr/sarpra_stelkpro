"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import TambahTahunan from "./TambahTahunan";
import dayjs from "dayjs";
import Aswitch from "@/components/Aswitch";
export default function DataTahunan() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filters, setFilters] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTahunan, setEditingTahunan] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTahunan, setDeletingTahunan] = useState(null);
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
      key: "kegiatan",
      title: "Kegiatan",
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      key: "tgl",
      title: "Tanggal Mulai",
      searchable: true,
      filterable: true,
      type: "dateRange",
      format: "DD-MM-YYYY",
      render: (value) => dayjs(value).format("DD-MM-YYYY"),
      filterOptions: [
        {
          value: "last3Months",
          label: "3 Bulan Terakhir",
          getValue: () => {
            const threeMonthsAgo = dayjs()
              .subtract(3, "month")
              .startOf("month")
              .format("YYYY-MM-DD");
            const today = dayjs().format("YYYY-MM-DD");
            return `${threeMonthsAgo},${today}`;
          },
        },
        {
          value: "custom",
          label: "Custom Range",
          isCustomRange: true,
        },
      ],
    },
    {
      key: "end",
      title: "Tanggal Selesai",
      searchable: true,
      filterable: true,
      type: "dateRange",
      format: "DD-MM-YYYY",
      render: (value) => dayjs(value).format("DD-MM-YYYY"),
      filterOptions: [
        {
          value: "last3Months",
          label: "3 Bulan Terakhir",
          getValue: () => {
            const threeMonthsAgo = dayjs()
              .subtract(3, "month")
              .startOf("month")
              .format("YYYY-MM-DD");
            const today = dayjs().format("YYYY-MM-DD");
            return `${threeMonthsAgo},${today}`;
          },
        },
        {
          value: "custom",
          label: "Custom Range",
          isCustomRange: true,
        },
      ],
    },
    {
      key: "lokasi",
      title: "Lokasi",
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      key: "status",
      title: "Status",
      searchable: true,
      filterable: true,
      sortable: true,
      filterOptions: [
        { value: "selasai", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
      render: (value, item) => {
        return (
          <Aswitch
            value={value}
            onChange={(newStatus) => handleStatusChange(item, newStatus)}
            size="sm"
            onValue="selesai"
            offValue="cancel"
            showIcons={true}
            labels={{
              on: "Completed",
              off: "Cancelled",
            }}
          />
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      type: "actions",
      sortable: false,
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
  const getTahunan = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/coe/tahunan?${queryParams}`),
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
  const postTahunan = async (form) => {
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
      if (editingTahunan && editingTahunan.id) {
        if (form instanceof FormData) {
          form.append("_method", "PUT");
          response = await api.put(
            `/sp/coe/tahunan/${editingTahunan.id}`,
            form,
            config
          );
        } else {
          response = await api.put(
            `/sp/coe/tahunan/${editingTahunan.id}`,
            form,
            config
          );
        }
      } else {
        response = await api.post("/sp/coe/tahunan", form, config);
      }
      if (response.data.status === "success") {
        getTahunan();
        setShowAddModal(false);
        setEditingTahunan(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      console.error("Error saving tahunan:", error);
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
    setDeletingTahunan(item);
    setShowDeleteModal(true);
  };
  const handleStatusChange = async (item, newStatus) => {
    try {
      await api.put(`/sp/coe/tahunan-status/${item.id}`, {
        status: newStatus,
      });
      getTahunan();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const handleConfirmDelete = async () => {
    if (!deletingTahunan) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/sp/coe/tahunan/${deletingTahunan.id}`); // Fix: gunakan id dari object
      // Refresh data after delete
      getTahunan(); // Fix: nama function yang benar
      setShowDeleteModal(false);
      setDeletingTahunan(null); // Fix: nama variable yang benar
    } catch (error) {
      console.error("Error deleting tahunan:", error); // Fix: pesan error
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingTahunan(null);
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
        api.delete(`/sp/coe/tahunan/${id}`)
      ); // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises);
      getTahunan();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting tahunan :", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };
  const handleAdd = () => {
    setEditingTahunan(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };
  const handleEdit = (item) => {
    setEditingTahunan(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingTahunan(null);
    setIsEditMode(false);
  };
  const handleAddSuccess = (newTeam) => {
    getTahunan();
    setShowAddModal(false);
    setEditingTahunan(null);
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
    getTahunan(params);
  };
  useEffect(() => {
    getTahunan();
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
        onAdd={handleAdd}
        onExport={handleExport}
        onBulkDelete={handleBulkDelete}
        // Pagination
        pagination={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        // Title
        title="Calendar of Events"
        subtitle="UNIT IT,LAB, & SARPRA"
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
        title="Hapus Tahunan"
        message={`Apakah Anda yakin ingin menghapus tahunan "${deletingTahunan?.tahunan}"?`}
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
        title="Hapus Multiple Tahunan"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} tahunan?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? "Edit Tahunan" : "Tambah Tahunan Baru"}
          width="700px"
          closeOnOverlayClick={false}
        >
          <TambahTahunan
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postTahunan={postTahunan}
            editingTahunan={editingTahunan}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-tahunan"
        title="Export Data Tahunan"
      />
    </div>
  );
}
