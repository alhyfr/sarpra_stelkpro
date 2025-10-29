"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import dayjs from "dayjs";
import TambahInv from "./TambahInv";
import { useData } from "@/app/context/DataContext";
import Vbukti from "./Vbukti";
import Vgambar from "./Vgambar";
import Stiker from "./Stiker";
const rupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};
export default function DataInv() {
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
  const [editingInv, setEditingInv] = useState(null); // Data yang sedang diedit
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingInv, setDeletingInv] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showStikerModal, setShowStikerModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const {
    satuan,
    getOpsi,
    dana,
    gedung,
    getRuanganByGedung,
    ruangan,
    kategoriAset,
  } = useData();

  const columns = [
    {
      key: "tgl",
      title: "TANGGAL MASUK",
      sortable: true,
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
      key: "kode",
      title: "KODE",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "kode_ypt",
      title: "KODE YPT",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "kode_sim",
      title: "SIMKUG",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "desc",
      title: "DESKRIPSI",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "spec",
      title: "SPESIFIKASI",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "gedung",
      title: "GEDUNG",
      sortable: true,
      searchable: true,
      filterable: true,
      filter: (value) => value.gedung,
      filterOptions: gedung.map((item) => ({
        value: item.gedung,
        label: item.gedung,
      })),
    },
    {
      key: "ruang",
      title: "RUANGAN",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "noseri",
      title: "NO SERI",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "merk",
      title: "MERK",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "type",
      title: "TYPE",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "color",
      title: "COLOR",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "satuan",
      title: "SATUAN",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "harga",
      title: "HARGA",
      sortable: true,
      searchable: true,
      filterable: true,
      render: (value) => rupiah(value),
    },
    {
      key: "sumber",
      title: "SUMBER DANA",
      sortable: true,
      searchable: true,
      filterable: true,
      filter: (value) => value.sumber,
      filterOptions: dana.map((item) => ({
        value: item.sumber,
        label: item.sumber,
      })),
    },
    {
      key: "kategori",
      title: "KATEGORI",
      sortable: true,
      searchable: true,
      filterable: true,
      filter: (value) => value.kategori,
      filterOptions: kategoriAset.map((item) => ({
        value: item.kategori,
        label: item.kategori,
      })),
    },
    {
      key: "gambar",
      title: "FOTO",
      sortable: true,
      searchable: true,
      filterable: true,
      render: (value) => {
        if (value) {
          return <Vgambar item={value} />;
        } else {
          return <div className="w-10 h-10 rounded-full bg-gray-200"></div>;
        }
      },
    },
    {
      key: "bukti",
      title: "BUKTI",
      sortable: true,
      searchable: true,
      filterable: true,
      render: (value) => {
        if (value) {
          return <Vbukti item={value} />;
        } else {
          return <div className="w-10 h-10 rounded-full bg-gray-200"></div>;
        }
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
  ];
  const getInv = async (params = {}, showLoading = true) => {
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
        api.get(`/sp/aset?${queryParams}`),
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

  const postInv = async (form) => {
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

      // Check if we have editingInv to determine if it's update or create
      if (editingInv && editingInv.id) {
        // Update existing inventaris
        // Untuk update dengan file, beberapa API perlu POST dengan _method=PUT
        if (form instanceof FormData) {
          form.append("_method", "PUT"); // Laravel method spoofing
          response = await api.put(`/sp/aset/${editingInv.id}`, form, config);
        } else {
          // Update tanpa file
          response = await api.put(`/sp/aset/${editingInv.id}`, form, config);
        }
      } else {
        // Create new inventaris
        response = await api.post("/sp/aset", form, config);
      }

      if (response.data.status === "success") {
        // Refresh data setelah berhasil
        getInv();
        setShowAddModal(false);
        setEditingInv(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      console.error("Error saving inventaris:", error);
      // Re-throw error agar bisa ditangani di TambahInv component
      if (error.response?.data?.message) {
        // Handle specific field errors (like duplicate kode)
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
    setDeletingInv(item);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (!deletingInv) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sp/aset/${deletingInv.id}`); // Fix: gunakan id dari object
      // Refresh data after delete
      getInv(); // Fix: nama function yang benar
      setShowDeleteModal(false);
      setDeletingInv(null); // Fix: nama variable yang benar
    } catch (error) {
      console.error("Error deleting team:", error); // Fix: pesan error
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingInv(null);
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
        api.delete(`/sp/aset/${id}`)
      ); // 🔧 GANTI: endpoint delete
      await Promise.all(deletePromises);
      getInv();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting team :", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };
  const handleAdd = () => {
    setEditingInv(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };
  const handleEdit = (item) => {
    setEditingInv(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingInv(null);
    setIsEditMode(false);
  };
  const handleAddSuccess = (newTeam) => {
    getInv();
    setShowAddModal(false);
    setEditingInv(null);
    setIsEditMode(false);
  };
  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleStiker = (selectedIds) => {
    setSelectedItems(selectedIds);
    setShowStikerModal(true);
  };

  const handleCloseStikerModal = () => {
    setShowStikerModal(false);
    setSelectedItems([]);
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
    getInv(params);
  };
  useEffect(() => {
    getInv();
    getOpsi();
  }, []);
  return (
    <>
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
        title="Data Aset"
        subtitle="Kelola data Aset"
        serverSide={true}
        onDataChange={handleDataChange}
        currentPage={currentPage}
        currentItemsPerPage={itemsPerPage}
        currentSearch={searchTerm}
        currentFilters={filters}
        currentSortField={sortField}
        currentSortDirection={sortDirection}
      />

      {/* Modal Delete Single */}
      <DeleteModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Aset"
        message={`Apakah Anda yakin ingin menghapus Aset "${deletingInv?.nama}"?`}
        loading={deleteLoading}
        size="sm"
      />

      {/* Modal Delete Multiple */}
      <DeleteModal
        show={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Multiple Teams"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} team?`}
        loading={bulkDeleteLoading}
        size="sm"
      />

      {/* Modal Add/Edit */}
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? "Edit Aset" : "Tambah Aset"}
          size="fullscreen"
          closeOnOverlayClick={false}
        >
          <TambahInv
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postInv={postInv}
            editingInv={editingInv}
            isEditMode={isEditMode}
            satuan={satuan}
            dana={dana}
            gedung={gedung}
            ruangan={ruangan}
            getRuanganByGedung={getRuanganByGedung}
            kategoriAset={kategoriAset}
          />
        </Modal>
      )}

      {/* Modal Export */}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-inventaris"
        title="Export Data Invantaris Aset"
      />

       {/* Modal Stiker */}
       {showStikerModal && (
         <Modal
           show={showStikerModal}
           onClose={handleCloseStikerModal}
           title="Cetak Stiker"
           size="lg"
         >
           <Stiker 
             selectedItems={selectedItems}
             data={data}
             onClose={handleCloseStikerModal}
           />
         </Modal>
       )}
    </>
  );
}
