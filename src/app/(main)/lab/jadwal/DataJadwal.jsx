"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import TambahJadwal from "./TambahJadwal";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Vlkpd from "./Vlkpd";
import {useData} from "@/app/context/DataContext";

export default function DataJadwal() {
  const { labs,getOpsi } = useData();
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
  const [editingJadwal, setEditingJadwal] = useState(null); // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingJadwal, setDeletingJadwal] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const columns = [
    {
      key: "pj",
      title: "Fasilitator",
      sortable: true,
      searchable: true,
    },
    {
      key: "nama_lab",
      title: "Laboratorium",
      sortable: true,
      searchable: true,
      wrap: true,
      minWidth: "300px",
      filterable: true,
      filterOptions: labs.map((item) => ({
        value: String(item.nama_lab),
        label: item.nama_lab || item.name || item.label,
      })),
    },
    {
      key: "jadwal",
      title: "Jadwal",
      sortable: true,
      searchable: true,
      render: (value, item) => {
        const tanggal = item.tgl ? dayjs(item.tgl).locale("id").format("dddd, DD-MM-YYYY") : "-";
        const jamMulai = item.jam_mulai || "-";
        const jamSelesai = item.jam_selesai || "-";
        const jam = jamMulai !== "-" && jamSelesai !== "-" ? `${jamMulai} - ${jamSelesai}` : "-";
        
        return (
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-gray-900 dark:text-white">
              {tanggal}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {jam}
            </div>
          </div>
        );
      },
    },
    {
      key: "mapel",
      title: "Mapel",
      sortable: true,
      searchable: true,
      wrap: true,
      minWidth: "300px",
      render: (value, item) => {
        const mapel = item.mapel || "-";
        const kelas = item.kelas || "-";
        
        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium text-gray-900 dark:text-white">
              {mapel}
            </div>
            {kelas !== "-" && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Kelas: {kelas}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "topik",
      title: "Topik",
      sortable: true,
      searchable: true,
      wrap: true,
      minWidth: "200px",
    },
    {
        key: "lkpd",
        title: "LKPD",
        sortable: true,
        searchable: true,
        filterable: true,
        render: (value) => {
          if (value) {
            return <Vlkpd item={value} />;
          } else {
            return <div className="w-10 h-10 bg-gray-200"></div>;
          }
        },
      },
    {
      key: "status",
      title: "Status",
      sortable: true,
      searchable: true,
      filter: true,
      filterOptions: [
        { value: "0", label: "Terjadwal" },
        { value: "1", label: "Terlaksana" },
      ],
      render: (value) => {
        const statusValue = value === 0 || value === "0" ? 0 : 1;
        const label = statusValue === 0 ? "Terjadwal" : "Terlaksana";
        const bgColor = statusValue === 0 
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
            {label}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
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
  const getJadwalLab = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/jadwal-lab?${queryParams}`),
        minLoadingTime,
      ]);

      if (response.data.message === "success") {
        setData(response.data.data);
        // Use same pattern as DataInv.jsx - check both structures for compatibility
        setTotal(
          response.data.total ||
            response.data.pagination?.total ||
            response.data.data.length
        );
        setCurrentPage(
          response.data.page || response.data.pagination?.current_page || 1
        );
        setItemsPerPage(
          response.data.per_page || response.data.pagination?.per_page || 10
        );
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
  const postJadwalLab = async (form) => {
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
      if (editingJadwal && editingJadwal.id) {
        if (form instanceof FormData) {
          form.append("_method", "PUT");
          response = await api.put(
            `/sp/jadwal-lab/${editingJadwal.id}`,
            form,
            config
          );
        } else {
          response = await api.put(
            `/sp/jadwal-lab/${editingJadwal.id}`,
            form,
            config
          );
        }
      } else {
        response = await api.post("/sp/jadwal-lab", form, config);
      }
      if (response.data.status === "success") {
        getJadwalLab();
        setShowAddModal(false);
        setEditingJadwal(null);
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
    setDeletingJadwal(item);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (!deletingJadwal) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/sp/jadwal-lab/${deletingJadwal.id}`);
      getJadwalLab();
      setShowDeleteModal(false);
      setDeletingJadwal(null);
    } catch (error) {
      console.error("Error deleting jadwal lab:", error);
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingJadwal(null);
    setDeleteLoading(false);
  };
  // Bulk delete handlers
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
        api.delete(`/sp/jadwal-lab/${id}`)
      ); // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises);
      getJadwalLab();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting jadwal lab :", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };
  const handleAdd = () => {
    setEditingJadwal(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };
  const handleEdit = (item) => {
    setEditingJadwal(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingJadwal(null);
    setIsEditMode(false);
  };
  const handleAddSuccess = (newTeam) => {
    getJadwalLab();
    setShowAddModal(false);
    setEditingJadwal(null);
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
    getJadwalLab(params);
  };
  useEffect(() => {
    getJadwalLab();
    getOpsi();
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
        title="Data Jadwal Lab"
        subtitle="Kelola data Jadwal Lab"
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
                title="Hapus Jadwal Lab"
                message={`Apakah Anda yakin ingin menghapus jadwal lab "${deletingJadwal?.nama_lab}"?`}
                loading={deleteLoading}
                size="sm"
            />

            {/* Modal Delete Multiple */}
            <DeleteModal
                show={showBulkDeleteModal}
                onClose={() => {
                    setShowBulkDeleteModal(false)
                    setBulkDeleteIds([])
                }}
                onConfirm={handleConfirmBulkDelete}
                title="Hapus Multiple Jadwal Lab"
                message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} jadwal lab?`}
                loading={bulkDeleteLoading}
                size="sm"
            />
            {showAddModal && (
                <Modal
                    show={showAddModal}
                    onClose={handleCloseAddModal}
                    title={isEditMode ? 'Edit Jadwal Lab' : 'Tambah Jadwal Lab Baru'}
                    size="lg"
                    closeOnOverlayClick={false}
                >
                    <TambahJadwal
                        onClose={handleCloseAddModal}
                        onSuccess={handleAddSuccess}
                        postJadwalLab={postJadwalLab}
                        editingJadwal={editingJadwal}
                        isEditMode={isEditMode}
                        labs={labs}
                    />
                </Modal>
            )}
            {/* Modal Export */}
            <ExportModal
                show={showExportModal}
                onClose={() => setShowExportModal(false)}
                data={data}
                columns={columns}
                filename="data-jadwal-lab"
                title="Export Data Jadwal Lab"
            />
    </div>
  );
}
