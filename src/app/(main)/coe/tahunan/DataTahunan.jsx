"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2, ListTodo } from "lucide-react";
import api from "@/app/utils/Api";
import TambahTahunan from "./TambahTahunan";
import CoeTasks from "./CoeTasks";
import dayjs from "dayjs";
import AInput from "@/components/AInput";
import Button from "@/components/Button";
import useServerListFetch from "@/hooks/useServerListFetch";

const statusBadge = {
  incoming: "bg-slate-100 text-slate-700",
  ongoing: "bg-blue-100 text-blue-700",
  selesai: "bg-emerald-100 text-emerald-700",
  cancel: "bg-rose-100 text-rose-700",
};

const unitBadge = {
  it: "bg-sky-100 text-sky-700",
  lab: "bg-violet-100 text-violet-700",
  sarpra: "bg-amber-100 text-amber-700",
};

const unitLabel = {
  it: "IT",
  lab: "Lab",
  sarpra: "Sarpra",
};

export default function DataTahunan() {
  const { fetchList } = useServerListFetch();
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
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [taskCoe, setTaskCoe] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelItem, setCancelItem] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

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
      key: "unit",
      title: "Unit",
      searchable: true,
      filterable: true,
      sortable: true,
      filterOptions: [
        { value: "it", label: "IT" },
        { value: "lab", label: "Lab" },
        { value: "sarpra", label: "Sarpra" },
      ],
      render: (value) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${unitBadge[value] || "bg-gray-100 text-gray-700"}`}
        >
          {unitLabel[value] || value || "-"}
        </span>
      ),
    },
    {
      key: "nama",
      title: "Team",
      searchable: true,
      filterable: false,
      sortable: false,
    },
    {
      key: "progress",
      title: "Progress",
      searchable: false,
      filterable: false,
      sortable: false,
      render: (value, item) => {
        const pct = Number(value || 0);
        const done = item.task_done || 0;
        const totalTasks = item.task_total || 0;
        return (
          <div className="min-w-[100px]">
            <div className="mb-1 text-xs text-gray-600">
              {pct}% ({done}/{totalTasks})
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      searchable: true,
      filterable: true,
      sortable: true,
      filterOptions: [
        { value: "incoming", label: "Incoming" },
        { value: "ongoing", label: "Ongoing" },
        { value: "selesai", label: "Selesai" },
        { value: "cancel", label: "Cancel" },
      ],
      render: (value, item) => (
        <div className="space-y-1">
          <select
            className={`rounded-md border px-2 py-1 text-xs font-medium ${statusBadge[value] || "bg-gray-100"}`}
            value={value}
            onChange={(e) => handleStatusSelect(item, e.target.value)}
          >
            <option value="incoming">Incoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="selesai">Selesai</option>
            <option value="cancel">Cancel</option>
          </select>
          {value === "cancel" && item.keterangan && (
            <div
              className="max-w-[160px] truncate text-[11px] text-rose-600"
              title={item.keterangan}
            >
              {item.keterangan}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      type: "actions",
      sortable: false,
      actions: [
        {
          icon: ListTodo,
          title: "Tasks",
          onClick: (item) => handleOpenTasks(item),
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
    },
  ];

  const getTahunan = async (params = {}, showLoading = true) => {
    await fetchList({
      endpoint: "/sp/coe/tahunan",
      page: params.page || currentPage,
      per_page: params.per_page || itemsPerPage,
      search: params.search !== undefined ? params.search : searchTerm,
      filters: params.filters || filters,
      showLoading,
      setLoading,
      onSuccess: (payload) => {
        setData(payload.data);
        setTotal(payload.total);
        setCurrentPage(payload.page);
        setItemsPerPage(payload.per_page);
      },
      onError: (error) => {
        console.error("Error fetching list:", error);
        setData([]);
        setTotal(0);
      },
    });
  };

  const postTahunan = async (form) => {
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
      if (editingTahunan && editingTahunan.id) {
        response = await api.put(
          `/sp/coe/tahunan/${editingTahunan.id}`,
          form,
          config
        );
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

  const handleStatusSelect = async (item, newStatus) => {
    if (newStatus === "cancel") {
      setCancelItem(item);
      setCancelReason(item.keterangan || "");
      setShowCancelModal(true);
      return;
    }
    try {
      await api.put(`/sp/coe/tahunan-status/${item.id}`, {
        status: newStatus,
      });
      getTahunan();
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Gagal mengubah status");
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelItem) return;
    if (!cancelReason.trim()) {
      alert("Keterangan wajib diisi sebagai alasan tidak terlaksana");
      return;
    }
    setCancelLoading(true);
    try {
      await api.put(`/sp/coe/tahunan-status/${cancelItem.id}`, {
        status: "cancel",
        keterangan: cancelReason.trim(),
      });
      setShowCancelModal(false);
      setCancelItem(null);
      setCancelReason("");
      getTahunan();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal membatalkan kegiatan");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleOpenTasks = (item) => {
    setTaskCoe(item);
    setShowTasksModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTahunan) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/sp/coe/tahunan/${deletingTahunan.id}`);
      getTahunan();
      setShowDeleteModal(false);
      setDeletingTahunan(null);
    } catch (error) {
      console.error("Error deleting tahunan:", error);
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
      const deletePromises = bulkDeleteIds.map((id) =>
        api.delete(`/sp/coe/tahunan/${id}`)
      );
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

  const handleAddSuccess = () => {
    getTahunan();
    setShowAddModal(false);
    setEditingTahunan(null);
    setIsEditMode(false);
  };

  const handleExport = () => {
    setShowExportModal(true);
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
    getTahunan(params);
  };

  useEffect(() => {
    getTahunan();
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
        title="Calendar of Events"
        subtitle="Unit: IT · Lab · Sarpra"
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
        title="Hapus Tahunan"
        message={`Apakah Anda yakin ingin menghapus kegiatan "${deletingTahunan?.kegiatan}"?`}
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
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} kegiatan?`}
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
      {showTasksModal && taskCoe && (
        <Modal
          show={showTasksModal}
          onClose={() => {
            setShowTasksModal(false);
            setTaskCoe(null);
          }}
          title="Task Pelaksanaan COE"
          width="720px"
          closeOnOverlayClick={false}
        >
          <CoeTasks
            coe={taskCoe}
            onChanged={() => getTahunan({}, false)}
          />
        </Modal>
      )}
      {showCancelModal && (
        <Modal
          show={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setCancelItem(null);
            setCancelReason("");
          }}
          title="Alasan Tidak Terlaksana"
          width="520px"
          closeOnOverlayClick={false}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Kegiatan:{" "}
              <span className="font-medium text-gray-800">
                {cancelItem?.kegiatan}
              </span>
            </p>
            <AInput
              id="keterangan"
              name="keterangan"
              label="Keterangan"
              placeholder="Tuliskan alasan kegiatan tidak terlaksana"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              multiline
              rows={4}
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelItem(null);
                  setCancelReason("");
                }}
                disabled={cancelLoading}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? "Menyimpan..." : "Simpan Cancel"}
              </Button>
            </div>
          </div>
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
