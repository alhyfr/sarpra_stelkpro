"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import TambahEx from "./TambahEx";
import dayjs from "dayjs";
import SignBoard from "./signBoard";
import useServerListFetch from '@/hooks/useServerListFetch'
export default function DataEx() {
  const { fetchList, clearListCache } = useServerListFetch()
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
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
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
      key: "tgl_mulai",
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
      key: "tgl_selesai",
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
      key: "ruangan",
      title: "Ruangan",
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
        key: "sign_board",
        title: "Sign",
        searchable: false,
        filterable: false,
        sortable: false,
        render: (value, item) => <SignBoard item={item} />,
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
  const getEvent = async (params = {}, showLoading = true) => {
    await fetchList({
      endpoint: "/sp/coe/event",
      page: params.page || currentPage,
      per_page: params.per_page || itemsPerPage,
      search: params.search !== undefined ? params.search : searchTerm,
      filters: params.filters || filters,
      showLoading,
      setLoading,
      onSuccess: (payload) => {
        setData(payload.data)
        setTotal(payload.total)
        setCurrentPage(payload.page)
        setItemsPerPage(payload.per_page)
      },
      onError: (error) => {
        console.error("Error fetching list:", error)
        setData([])
        setTotal(0)
      },
    })
  }
  const postEvent = async (form) => {
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
      if (editingEvent && editingEvent.id) {
        if (form instanceof FormData) {
          form.append("_method", "PUT");
          response = await api.put(
            `/sp/coe/event/${editingEvent.id}`,
            form,
            config
          );
        } else {
          response = await api.put(
            `/sp/coe/event/${editingEvent.id}`,
            form,
            config
          );
        }
      } else {
        response = await api.post("/sp/coe/event", form, config);
      }
      if (response.data.status === "success") {
        getEvent();
        setShowAddModal(false);
        setEditingEvent(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      console.error("Error saving event:", error);
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
    setDeletingEvent(item);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/sp/coe/event/${deletingEvent.id}`); // Fix: gunakan id dari object
      // Refresh data after delete
      getEvent(); // Fix: nama function yang benar
      setShowDeleteModal(false);
      setDeletingEvent(null); // Fix: nama variable yang benar
    } catch (error) {
      console.error("Error deleting event:", error); // Fix: pesan error
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingEvent(null);
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
        api.delete(`/sp/coe/event/${id}`)
      ); // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises);
      getEvent();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting event :", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };
  const handleAdd = () => {
    setEditingEvent(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };
  const handleEdit = (item) => {
    setEditingEvent(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingEvent(null);
    setIsEditMode(false);
  };
  const handleAddSuccess = (newTeam) => {
    getEvent();
    setShowAddModal(false);
    setEditingEvent(null);
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
    getEvent(params);
  };
  useEffect(() => {
    getEvent();
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
        subtitle="Eksternal Event"
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
        title="Hapus Event"
        message={`Apakah Anda yakin ingin menghapus event "${deletingEvent?.kegiatan}"?`}
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
        title="Hapus Multiple Event"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} event?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? "Edit Event" : "Tambah Event Baru"}
          width="700px"
          closeOnOverlayClick={false}
        >
          <TambahEx
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postEvent={postEvent}
            editingEvent={editingEvent}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-event"
        title="Export Data Event"
      />
    </div>
  );
}
