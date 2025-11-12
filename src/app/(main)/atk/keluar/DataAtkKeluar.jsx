"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2, Printer } from "lucide-react";
import api from "@/app/utils/Api";
import TambahAtkKeluar from "./TambahAtkKeluar";
import { useData } from "@/app/context/DataContext";
import dayjs from "dayjs";
import Struk from "./Struk";
import Aswitch from "@/components/Aswitch";

export default function DataAtkKeluar() {
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
  const [editingAtkOut, setEditingAtkOut] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAtkOut, setDeletingAtkOut] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStrukModal, setShowStrukModal] = useState(false);
  const [selectedAtkOut, setSelectedAtkOut] = useState(null);
  const { subscribeWebSocket } = useData();

  const columns = [
    {
      key: "nabar",
      title: "NABAR",
      searchable: true,
      filterable: true,
    },
    {
      key: "vol",
      title: "VOLUME",
      searchable: true,
      filterable: true,
    },
    {
      key: "tgl",
      title: "TANGGAL KELUAR",
      searchable: true,
      filterable: true,
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
      key: "pengambil",
      title: "PENGAMBIL",
      searchable: true,
      filterable: true,
    },
    {
      key: "kategori",
      title: "KATEGORI",
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: 'gupeg', label: 'GURU & PEGAWAI' },
        { value: 'siswa', label: 'SISWA' },
      ],
    },
    {
      key: "unit",
      title: "UNIT",
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: 'kurikulum', label: 'KURIKULUM' },
        { value: 'sarpra', label: 'SARPRA' },
        { value: 'hc', label: 'HUMAN CAPITAL' },
        { value: 'kesiswaan', label: 'KESISWAAN' },
        { value: 'hubinkom', label: 'HUBINKOM' },
        { value: 'siswa', label: 'SISWA' },
      ],
    },
    {
      key: "status",
      title: "STATUS",
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: 'proses', label: 'PROSES' },
        { value: 'selesai', label: 'SELESAI' },
      ],
      render: (value, item) => (
        <Aswitch
          value={value}
          onChange={(newStatus) => handleStatusChange(item, newStatus)}
          size="sm"
          onValue="selesai"
          offValue="proses"
          showIcons={true}
          labels={{
            on: 'selesai',
            off: 'proses'
          }}
        />
      ),
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
        {
          icon: Printer,
          title: "Struk",
          onClick: (item) => handleStruk(item),
          show: (item) => item.status === 'selesai',
        },
      ],
    },
  ];
  const getAtkOut = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/atk-out?${queryParams}`),
        minLoadingTime,
      ]);

      if (response.data.message === "success") {
        const rawData = response.data.data;

        setData(rawData);
        setTotal(response.data.pagination?.total || rawData.length);
        setCurrentPage(response.data.pagination?.current_page || 1);
        setItemsPerPage(response.data.pagination?.per_page || 10);
      }
    } catch (error) {
      console.error("Error fetching ATK Keluar:", error);
      setData([]);
      setTotal(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  const postAtkOut = async (form) => {
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

      if (editingAtkOut) {
        if (form instanceof FormData) {
          form.append("_method", "PUT");
          response = await api.put(
            `/sp/atk-out/${editingAtkOut.id}`,
            form,
            config
          );
        } else {
          response = await api.put(
            `/sp/atk-out/${editingAtkOut.id}`,
            form,
            config
          );
        }
      } else {
        response = await api.post("/sp/atk-out", form, config);
      }

      if (response.data.message === "success") {
        getAtkOut();
        setShowAddModal(false);
        setEditingAtkOut(null);
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
  const handleDelete = (item) => {
    setDeletingAtkOut(item);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (!deletingAtkOut) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/sp/atk-out/${deletingAtkOut.id}`);
      getAtkOut();
      setShowDeleteModal(false);
      setDeletingAtkOut(null);
    } catch (error) {
      console.error("Error deleting ATK Keluar:", error);
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingAtkOut(null);
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
        api.delete(`/sp/atk-out/${id}`)
      );
      await Promise.all(deletePromises);
      getAtkOut();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting ATK Keluar:", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };
  const handleAdd = () => {
    setEditingAtkOut(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setEditingAtkOut(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingAtkOut(null);
    setIsEditMode(false);
  };
  const handleAddSuccess = (newAtkOut) => {
    getAtkOut();
    setShowAddModal(false);
    setEditingAtkOut(null);
    setIsEditMode(false);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleStruk = (item) => {
    setSelectedAtkOut(item);
    setShowStrukModal(true);
  };

  const handleCloseStrukModal = () => {
    setShowStrukModal(false);
    setSelectedAtkOut(null);
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      await api.put(`/sp/atk-out-status/${item.id}`, {
        status: newStatus
      });
      getAtkOut();
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

    getAtkOut(params);
  };
  useEffect(() => {
    getAtkOut();
  }, []);
  // useEffect(() => {
  //   const unsubscribe = subscribeWebSocket('atkPinjamUpdated', () => {
  //     getAtkOut(); // Trigger refresh when pinbar is updated
  //   });

  //   return unsubscribe; // Cleanup on unmount
  // }, [subscribeWebSocket, getAtkOut]);
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
        title="Data ATK Keluar"
        subtitle="Kelola data ATK Keluar"
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
        title="Hapus ATK Keluar"
        message={`Apakah Anda yakin ingin menghapus "${deletingAtkOut?.nabar}"?`}
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
        title="Hapus Multiple ATK Keluar"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} ATK Keluar?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {/* Modal Add/Edit */}
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? 'Edit ATK Keluar' : 'Tambah ATK Keluar Baru'}
          size="lg"
          closeOnOverlayClick={false}
        >
          <TambahAtkKeluar
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postAtkOut={postAtkOut}
            editingAtkOut={editingAtkOut}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
       <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-atk-keluar"
        title="Export Data ATK Keluar"
      />
      {/* Modal Struk */}
      {showStrukModal && (
        <Modal
          show={showStrukModal}
          onClose={handleCloseStrukModal}
          title="Struk ATK Keluar"
          size="lg"
          closeOnOverlayClick={false}
        >
          <Struk data={selectedAtkOut} />
        </Modal>
      )}
    </div>
  );
}
