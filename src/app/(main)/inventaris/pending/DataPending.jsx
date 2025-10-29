"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import { Package2, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import dayjs from "dayjs";
import { useData } from "@/app/context/DataContext";
import Vgambar from "../master/Vgambar";
import Vbukti from "../master/Vbukti";
import UbahStatus from "./UbahStatus";

const rupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

export default function DataPending() {
  const [data, setData] = useState([]); // Data yang ditampilkan di table
  const [total, setTotal] = useState(0); // Total data dari server (untuk pagination)
  const [loading, setLoading] = useState(false); // Loading state saat fetch data
  const [currentPage, setCurrentPage] = useState(1); // Halaman aktif
  const [itemsPerPage, setItemsPerPage] = useState(10); // Jumlah item per halaman
  const [searchTerm, setSearchTerm] = useState(""); // Kata kunci pencarian
  const [sortField, setSortField] = useState(""); // Field yang di-sort
  const [sortDirection, setSortDirection] = useState("asc"); // Arah sorting (asc/desc)
  const [filters, setFilters] = useState({});

  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal konfirmasi hapus
  const [deletingInv, setDeletingInv] = useState(null); // Data yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Modal konfirmasi hapus multiple
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]); // Array ID yang akan dihapus
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
          icon: Package2,
          title: "status",
          onClick: (item) => handleStatus(item),
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
        api.get(`/sp/aset-off?${queryParams}`),
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
  const handleStatus = (item) => {
    setSelectedItem(item);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedItem(null);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedItem) return;
    
    try {
      await api.put(`/sp/aset-off/${selectedItem.id}`, {
        status: newStatus
      });
      // Refresh data after update
      getInv();
      setShowStatusModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert('Terjadi kesalahan saat mengubah status');
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
  return <>
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
         onBulkDelete={handleBulkDelete}
        // Pagination
        pagination={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        // Title
        title="Data Penghapusan Aset"
        subtitle="Aset yang masuk dalam daftar Pengahpusan Aset"
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
       {/* Modal Ubah Status */}
       <Modal
         show={showStatusModal}
         onClose={handleCloseStatusModal}
         title="Ubah Status Aset"
         size="md"
       >
         <UbahStatus 
           item={selectedItem}
           onUpdate={handleStatusUpdate}
           onClose={handleCloseStatusModal}
         />
       </Modal>
  </>;
}
