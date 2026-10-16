"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import TambahKategoriIt from "./TambahKategoriIt";
import useServerListFetch from "@/hooks/useServerListFetch";

export default function DataKategoriIt() {
  const { fetchList, clearListCache } = useServerListFetch();
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
  const [editingKategori, setEditingKategori] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingKategori, setDeletingKategori] = useState(null);
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
    { key: "kode", title: "Kode", searchable: true, filterable: true, sortable: true },
    { key: "nama", title: "Nama", searchable: true, filterable: true, sortable: true },
    { key: "tipe", title: "Tipe", searchable: true, filterable: true, sortable: true },
    { key: "status", title: "Status", searchable: true, filterable: true, sortable: true },
    {
      key: "actions",
      title: "Actions",
      type: "actions",
      sortable: false,
      actions: [
        { icon: Edit, title: "Edit", onClick: (item) => handleEdit(item) },
        { icon: Trash2, title: "Delete", onClick: (item) => handleDelete(item) },
      ],
    },
  ];

  const getKategoriIt = async (params = {}, showLoading = true, force = false) => {
    await fetchList({
      endpoint: "/sp/kategori-it",
      page: params.page || currentPage,
      per_page: params.per_page || itemsPerPage,
      search: params.search !== undefined ? params.search : searchTerm,
      filters: params.filters || filters,
      showLoading,
      force,
      setLoading,
      onSuccess: (payload) => {
        setData(payload.data);
        setTotal(payload.total);
        setCurrentPage(payload.page);
        setItemsPerPage(payload.per_page);
      },
      onError: (error) => {
        console.error("Error fetching kategori IT:", error);
        setData([]);
        setTotal(0);
      },
    });
  };

  const postKategoriIt = async (form) => {
    try {
      let response;
      if (editingKategori && editingKategori.id) {
        response = await api.put(`/sp/kategori-it/${editingKategori.id}`, form);
      } else {
        response = await api.post("/sp/kategori-it", form);
      }

      if (response.data.status === "success") {
        setShowAddModal(false);
        setEditingKategori(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      console.error("Error saving kategori IT:", error);
      if (error.response?.data?.message) {
        const fieldError = new Error(error.response.data.message);
        if (error.response.data.field) fieldError.field = error.response.data.field;
        throw fieldError;
      }
      throw error.message ? error : new Error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleDelete = (item) => {
    setDeletingKategori(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingKategori) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sp/kategori-it/${deletingKategori.id}`);
      clearListCache();
      await getKategoriIt({}, false);
      setShowDeleteModal(false);
      setDeletingKategori(null);
    } catch (error) {
      console.error("Error deleting kategori IT:", error);
      alert(error.response?.data?.message || "Gagal menghapus kategori IT");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingKategori(null);
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
      await Promise.all(bulkDeleteIds.map((id) => api.delete(`/sp/kategori-it/${id}`)));
      clearListCache();
      await getKategoriIt({}, false);
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting kategori IT:", error);
      alert(error.response?.data?.message || "Gagal menghapus data");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingKategori(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setEditingKategori(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingKategori(null);
    setIsEditMode(false);
  };

  const handleAddSuccess = () => {
    clearListCache();
    getKategoriIt({}, false, true);
    setShowAddModal(false);
    setEditingKategori(null);
    setIsEditMode(false);
  };

  const handleExport = () => setShowExportModal(true);

  const handleDataChange = (params) => {
    if (params.page !== undefined) setCurrentPage(params.page);
    if (params.per_page !== undefined) setItemsPerPage(params.per_page);
    if (params.search !== undefined) setSearchTerm(params.search);
    if (params.filters !== undefined) setFilters(params.filters);
    if (params.sortField !== undefined) setSortField(params.sortField);
    if (params.sortDirection !== undefined) setSortDirection(params.sortDirection);
    getKategoriIt(params);
  };

  useEffect(() => {
    getKategoriIt();
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
        title="Data Kategori IT"
        subtitle="Kelola kategori perangkat & layanan IT"
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
        title="Hapus Kategori IT"
        message={`Apakah Anda yakin ingin menghapus kategori IT "${deletingKategori?.nama}" (${deletingKategori?.kode})?`}
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
        title="Hapus Multiple Kategori IT"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} kategori IT?`}
        loading={bulkDeleteLoading}
        size="sm"
      />

      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? "Edit Kategori IT" : "Tambah Kategori IT"}
          width="700px"
          closeOnOverlayClick={false}
        >
          <TambahKategoriIt
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postKategoriIt={postKategoriIt}
            editingKategori={editingKategori}
            isEditMode={isEditMode}
          />
        </Modal>
      )}

      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-kategori-it"
        title="Export Data Kategori IT"
      />
    </div>
  );
}
