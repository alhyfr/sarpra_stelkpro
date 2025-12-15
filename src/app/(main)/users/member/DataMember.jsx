import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import TambahMember from "./TambahMember";
import dayjs from "dayjs";
import Aswitch from "@/components/Aswitch";

const BarMember = dynamic(() => import('./BarMember'), { ssr: false });

export default function DataMember() {
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
  const [editingMember, setEditingMember] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMember, setDeletingMember] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [showBarModal, setShowBarModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

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
      key: "mid",
      title: "Kode Member",
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      key: "name",
      title: "Nama Member",
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
    },
    {
      key: "kategori",
      title: "Kategori",
      searchable: true,
      filterable: true,
      sortable: true,
      filterOptions: [
        { value: "gupeg", label: "GURU & PEGAWAI" },
        { value: "siswa", label: "SISWA" },
      ],
    },
    {
      key: "status",
      title: "Status",
      searchable: true,
      filterable: true,
      sortable: true,
      filterOptions: [
        { value: "on", label: "Aktif" },
        { value: "off", label: "Banned" },
      ],
      render: (value, item) => {
        return (
          <Aswitch
            value={value}
            onChange={(newStatus) => handleStatusChange(item, newStatus)}
            size="sm"
            onValue="on"
            offValue="off"
            showIcons={true}
            labels={{
              on: "Aktif",
              off: "Banned",
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
  const getMembers = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/member?${queryParams}`),
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
  const postMember = async (form) => {
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
      if (editingMember && editingMember.id) {
        if (form instanceof FormData) {
          form.append("_method", "PUT");
          response = await api.put(
            `/sp/member/${editingMember.id}`,
            form,
            config
          );
        } else {
          response = await api.put(
            `/sp/member/${editingMember.id}`,
            form,
            config
          );
        }
      } else {
        response = await api.post("/sp/member", form, config);
      }
      if (response.data.status === "success") {
        getMembers();
        setShowAddModal(false);
        setEditingMember(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      console.error("Error saving member:", error);
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
    setDeletingMember(item);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (!deletingMember) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/sp/member/${deletingMember.id}`); // Fix: gunakan id dari object
      // Refresh data after delete
      getMembers(); // Fix: nama function yang benar
      setShowDeleteModal(false);
      setDeletingMember(null); // Fix: nama variable yang benar
    } catch (error) {
      console.error("Error deleting member:", error); // Fix: pesan error
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingMember(null);
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
        api.delete(`/sp/member/${id}`)
      ); // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises);
      getMembers();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting member :", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };
  const handleAdd = () => {
    setEditingMember(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };
  const handleEdit = (item) => {
    setEditingMember(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingMember(null);
    setIsEditMode(false);
  };
  const handleAddSuccess = (newMember) => {
    getMembers();
    setShowAddModal(false);
    setEditingMember(null);
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
    getMembers(params);
  };
  const handleStatusChange = async (item, newStatus) => {
    try {
      await api.put(`/sp/member-status/${item.id}`, { status: newStatus });
      getMembers();
    } catch (error) {
      console.error("Error changing status:", error);
    }
  };

  const handleBar = (selectedIds) => {
    setSelectedItems(selectedIds);
    setShowBarModal(true);
  };

  const handleCloseBarModal = () => {
    setShowBarModal(false);
    setSelectedItems([]);
  };

  useEffect(() => {
    getMembers();
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
        onStiker={handleBar}
        // Pagination
        pagination={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        // Title
        title="Data Member"
        subtitle="Kelola data Member"
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
        title="Hapus Member"
        message={`Apakah Anda yakin ingin menghapus member "${deletingMember?.name}"?`}
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
        title="Hapus Multiple Member"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} member?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? "Edit Member" : "Tambah Member Baru"}
          width="700px"
          closeOnOverlayClick={false}
        >
          <TambahMember
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postMember={postMember}
            editingMember={editingMember}
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

      {/* Modal Barcode Member */}
      {showBarModal && (
        <Modal
          show={showBarModal}
          onClose={handleCloseBarModal}
          title="Cetak Barcode Member"
          size="lg"
        >
          <BarMember
            selectedItems={selectedItems}
            data={data}
            onClose={handleCloseBarModal}
          />
        </Modal>
      )}
    </div>
  );
}
