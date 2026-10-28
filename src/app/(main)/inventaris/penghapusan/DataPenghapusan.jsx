"use client";
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import dynamic from "next/dynamic";
import { Undo2, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import dayjs from "dayjs";
import { useData } from "@/app/context/DataContext";
import Vgambar from "../master/Vgambar";
import Vbukti from "../master/Vbukti";
import KembalikanModal from "./KembalikanModal";
import ArsipkanModal from "./ArsipkanModal";
import useServerListFetch from "@/hooks/useServerListFetch";

const ExportModal = dynamic(() => import("@/components/ExportModal"), { ssr: false });

const rupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

export default function DataPenghapusan() {
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
  const [showExportModal, setShowExportModal] = useState(false);

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
  const getInv = async (params = {}, showLoading = true, force = false) => {
    await fetchList({
      endpoint: "/sp/aset-lelang",
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
        console.error("Error fetching data penghapusan:", error);
        setData([]);
        setTotal(0);
      },
    });
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

  // ─── Arsipkan single / bulk ───────────────────────────────────────────────
  const handleDelete = (item) => {
    setBulkDeleteIds([]);
    setDeletingInv(item);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setShowBulkDeleteModal(false);
    setDeletingInv(null);
    setBulkDeleteIds([]);
    setDeleteLoading(false);
    setBulkDeleteLoading(false);
  };

  const handleConfirmArsip = async (meta) => {
    const ids = bulkDeleteIds.length > 0
      ? bulkDeleteIds
      : deletingInv?.id
        ? [deletingInv.id]
        : [];
    if (!ids.length) return;

    const isBulk = bulkDeleteIds.length > 0;
    if (isBulk) setBulkDeleteLoading(true);
    else setDeleteLoading(true);

    try {
      await Promise.all(
        ids.map((id) => api.delete(`/sp/aset/${id}`, { data: meta }))
      );
      clearListCache();
      await getInv({}, false, true);
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error mengarsipkan aset:", error);
    } finally {
      setDeleteLoading(false);
      setBulkDeleteLoading(false);
    }
  };

  const handleBulkDelete = (selectedIds) => {
    setDeletingInv(null);
    setBulkDeleteIds(selectedIds);
    setShowBulkDeleteModal(true);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const fetchAllPenghapusanForExport = async () => {
    const all = [];
    let page = 1;
    const perPage = 500;
    let totalPages = 1;

    do {
      const queryParams = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      });
      if (searchTerm?.trim()) queryParams.append("search", searchTerm.trim());
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "custom") {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/sp/aset-lelang?${queryParams}`);
      if (response.data?.status !== "success") {
        throw new Error(response.data?.message || "Gagal mengambil data export");
      }
      const chunk = response.data.data || [];
      all.push(...chunk);
      totalPages = Number(response.data.total_pages) || 1;
      if (chunk.length < perPage) break;
      page += 1;
    } while (page <= totalPages && page <= 100);

    return all;
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
        onExport={handleExport}
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

      <ArsipkanModal
        show={showDeleteModal || showBulkDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmArsip}
        item={deletingInv}
        count={bulkDeleteIds.length > 0 ? bulkDeleteIds.length : 1}
        loading={deleteLoading || bulkDeleteLoading}
      />

      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="daftar-penghapusan-aset"
        title="Export Daftar Penghapusan Aset"
        fetchAllData={fetchAllPenghapusanForExport}
      />
    </>
  );
}