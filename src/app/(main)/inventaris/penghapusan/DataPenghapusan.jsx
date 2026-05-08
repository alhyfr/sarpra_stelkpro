"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import DeleteModal from "@/components/Delete";
import { Undo2, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import dayjs from "dayjs";
import { useData } from "@/app/context/DataContext";
import Vgambar from "../master/Vgambar";
import Vbukti from "../master/Vbukti";
import KembalikanModal from "./KembalikanModal";

const rupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

export default function DataPenghapusan() {
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
  const [deletingInv, setDeletingInv] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // State untuk modal kembalikan status
  const [showKembalikanModal, setShowKembalikanModal] = useState(false);
  const [kembalikanItem, setKembalikanItem] = useState(null);
  const [kembalikanLoading, setKembalikanLoading] = useState(false);

  const { getOpsi, dana, gedung, kategoriAset } = useData();

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
      key: "deskripsi_lelang",
      title: "KETERANGAN PENGHAPUSAN",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "gambar",
      title: "FOTO",
      sortable: false,
      searchable: false,
      filterable: false,
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
      sortable: false,
      searchable: false,
      filterable: false,
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
      sortable: false,
      searchable: false,
      filterable: false,
      type: "actions",
      actions: [
        {
          icon: Undo2,
          title: "Kembalikan",
          onClick: (item) => handleKembalikan(item),
        },
        {
          icon: Trash2,
          title: "Delete",
          onClick: (item) => handleDelete(item),
        },
      ],
    },
  ];

  // ─── Fetch data lelang ────────────────────────────────────────────────────
  const getInv = async (params = {}, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
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
          if (value) queryParams.append(key, value);
        });
      }

      const [response] = await Promise.all([
        api.get(`/sp/aset-lelang?${queryParams}`),
        minLoadingTime,
      ]);

      if (response.data.status === "success") {
        setData(response.data.data);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setItemsPerPage(response.data.per_page);
      }
    } catch (error) {
      console.error("Error fetching data penghapusan:", error);
      setData([]);
      setTotal(0);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // ─── Kembalikan status (status_lelang = 'tidak', deskripsi = '') ──────────
  const handleKembalikan = (item) => {
    setKembalikanItem(item);
    setShowKembalikanModal(true);
  };

  const handleCloseKembalikanModal = () => {
    setShowKembalikanModal(false);
    setKembalikanItem(null);
  };

  const handleConfirmKembalikan = async () => {
    if (!kembalikanItem) return;
    setKembalikanLoading(true);
    try {
      await api.put(`/sp/aset-lelang/${kembalikanItem.id}`, {
        status_lelang: "tidak",
        deskripsi_lelang: "",
      });
      getInv();
      setShowKembalikanModal(false);
      setKembalikanItem(null);
    } catch (error) {
      console.error("Error mengembalikan status lelang:", error);
    } finally {
      setKembalikanLoading(false);
    }
  };

  // ─── Delete single ────────────────────────────────────────────────────────
  const handleDelete = (item) => {
    setDeletingInv(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingInv) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sp/aset/${deletingInv.id}`);
      getInv();
      setShowDeleteModal(false);
      setDeletingInv(null);
    } catch (error) {
      console.error("Error deleting aset:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingInv(null);
    setDeleteLoading(false);
  };

  // ─── Bulk delete ──────────────────────────────────────────────────────────
  const handleBulkDelete = (selectedIds) => {
    setBulkDeleteIds(selectedIds);
    setShowBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return;
    setBulkDeleteLoading(true);
    try {
      const deletePromises = bulkDeleteIds.map((id) =>
        api.delete(`/sp/aset/${id}`)
      );
      await Promise.all(deletePromises);
      getInv();
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting aset:", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // ─── DataTable change handler ─────────────────────────────────────────────
  const handleDataChange = (params) => {
    if (params.page !== undefined) setCurrentPage(params.page);
    if (params.per_page !== undefined) setItemsPerPage(params.per_page);
    if (params.search !== undefined) setSearchTerm(params.search);
    if (params.filters !== undefined) setFilters(params.filters);
    if (params.sortField !== undefined) setSortField(params.sortField);
    if (params.sortDirection !== undefined) setSortDirection(params.sortDirection);
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
        onBulkDelete={handleBulkDelete}
        pagination={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        title="Daftar Penghapusan Aset"
        subtitle="Aset yang masuk dalam daftar penghapusan / lelang"
        serverSide={true}
        onDataChange={handleDataChange}
        currentPage={currentPage}
        currentItemsPerPage={itemsPerPage}
        currentSearch={searchTerm}
        currentFilters={filters}
        currentSortField={sortField}
        currentSortDirection={sortDirection}
      />

      {/* Modal Konfirmasi Kembalikan */}
      <KembalikanModal
        show={showKembalikanModal}
        onClose={handleCloseKembalikanModal}
        onConfirm={handleConfirmKembalikan}
        item={kembalikanItem}
        loading={kembalikanLoading}
      />

      {/* Modal Delete Single */}
      <DeleteModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Aset"
        message={`Apakah Anda yakin ingin menghapus Aset "${deletingInv?.desc || deletingInv?.kode}"?`}
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
        title="Hapus Multiple Aset"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} aset?`}
        loading={bulkDeleteLoading}
        size="sm"
      />
    </>
  );
}