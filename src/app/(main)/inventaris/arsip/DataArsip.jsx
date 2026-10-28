"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import DataTable from "@/components/DataTable";
import dayjs from "dayjs";
import api from "@/app/utils/Api";
import { useData } from "@/app/context/DataContext";
import Vgambar from "../master/Vgambar";
import Vbukti from "../master/Vbukti";
import useServerListFetch from "@/hooks/useServerListFetch";

const ExportModal = dynamic(() => import("@/components/ExportModal"), { ssr: false });

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value || 0);

export default function DataArsip() {
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
  const [showExportModal, setShowExportModal] = useState(false);
  const { getOpsi, dana, gedung, kategoriAset } = useData();

  const columns = [
    {
      key: "tgl_penghapusan",
      title: "TGL PENGHAPUSAN",
      sortable: true,
      searchable: false,
      filterable: false,
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "-"),
    },
    {
      key: "created_at",
      title: "TGL ARSIP SISTEM",
      sortable: true,
      searchable: false,
      filterable: false,
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY HH:mm") : "-"),
    },
    {
      key: "tgl",
      title: "TANGGAL MASUK",
      sortable: true,
      searchable: true,
      filterable: true,
      type: "dateRange",
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "-"),
      filterOptions: [
        {
          value: "last3Months",
          label: "3 Bulan Terakhir",
          getValue: () => {
            const threeMonthsAgo = dayjs().subtract(3, "month").startOf("month").format("YYYY-MM-DD");
            const today = dayjs().format("YYYY-MM-DD");
            return `${threeMonthsAgo},${today}`;
          },
        },
        { value: "custom", label: "Custom Range", isCustomRange: true },
      ],
    },
    { key: "kode", title: "KODE", sortable: true, searchable: true, filterable: true },
    { key: "kode_ypt", title: "KODE YPT", sortable: true, searchable: true, filterable: true },
    { key: "kode_sim", title: "SIMKUG", sortable: true, searchable: true, filterable: true },
    { key: "desc", title: "DESKRIPSI", sortable: true, searchable: true, filterable: true },
    { key: "spec", title: "SPESIFIKASI", sortable: true, searchable: true, filterable: true },
    {
      key: "gedung",
      title: "GEDUNG",
      sortable: true,
      searchable: true,
      filterable: true,
      filterOptions: gedung.map((item) => ({ value: item.gedung, label: item.gedung })),
    },
    { key: "ruang", title: "RUANGAN", sortable: true, searchable: true, filterable: true },
    { key: "merk", title: "MERK", sortable: true, searchable: true, filterable: true },
    {
      key: "harga",
      title: "HARGA",
      sortable: true,
      searchable: false,
      filterable: false,
      render: (value) => rupiah(value),
    },
    {
      key: "sumber",
      title: "SUMBER DANA",
      sortable: true,
      searchable: true,
      filterable: true,
      filterOptions: dana.map((item) => ({ value: item.sumber, label: item.sumber })),
    },
    {
      key: "kategori",
      title: "KATEGORI",
      sortable: true,
      searchable: true,
      filterable: true,
      filterOptions: kategoriAset.map((item) => ({ value: item.kategori, label: item.kategori })),
    },
    {
      key: "metode_penghapusan",
      title: "METODE",
      sortable: true,
      searchable: true,
      filterable: true,
      filterOptions: [
        { value: "lelang", label: "Lelang" },
        { value: "hibah", label: "Hibah" },
        { value: "musnah", label: "Pemusnahan" },
        { value: "dijual", label: "Dijual" },
        { value: "hilang", label: "Hilang" },
        { value: "lainnya", label: "Lainnya" },
      ],
    },
    { key: "no_ba", title: "NO. BA / SK", sortable: true, searchable: true, filterable: true },
    {
      key: "keterangan_penghapusan",
      title: "KETERANGAN PENGHAPUSAN",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "deskripsi_lelang",
      title: "ALASAN DAFTAR HAPUS",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "dihapus_oleh",
      title: "DIHAPUS OLEH",
      sortable: true,
      searchable: true,
      filterable: false,
    },
    {
      key: "gambar",
      title: "FOTO",
      sortable: false,
      searchable: false,
      filterable: false,
      render: (value) =>
        value ? <Vgambar item={value} /> : <div className="w-10 h-10 rounded-full bg-gray-200" />,
    },
    {
      key: "bukti",
      title: "BUKTI",
      sortable: false,
      searchable: false,
      filterable: false,
      render: (value) =>
        value ? <Vbukti item={value} /> : <div className="w-10 h-10 rounded-full bg-gray-200" />,
    },
  ];

  const getArsip = async (params = {}, showLoading = true) => {
    await fetchList({
      endpoint: "/sp/aset-arsip",
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
        console.error("Error fetching arsip penghapusan:", error);
        setData([]);
        setTotal(0);
      },
    });
  };

  const handleDataChange = (params) => {
    if (params.page !== undefined) setCurrentPage(params.page);
    if (params.per_page !== undefined) setItemsPerPage(params.per_page);
    if (params.search !== undefined) setSearchTerm(params.search);
    if (params.filters !== undefined) setFilters(params.filters);
    if (params.sortField !== undefined) setSortField(params.sortField);
    if (params.sortDirection !== undefined) setSortDirection(params.sortDirection);
    getArsip(params);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const fetchAllArsipForExport = async () => {
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

      const response = await api.get(`/sp/aset-arsip?${queryParams}`);
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

  useEffect(() => {
    getArsip();
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
        selectable={false}
        onExport={handleExport}
        pagination={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        title="Arsip Penghapusan Aset"
        subtitle="Aset yang sudah dihapus dari daftar penghapusan dan disimpan sebagai arsip"
        serverSide={true}
        onDataChange={handleDataChange}
        currentPage={currentPage}
        currentItemsPerPage={itemsPerPage}
        currentSearch={searchTerm}
        currentFilters={filters}
        currentSortField={sortField}
        currentSortDirection={sortDirection}
      />

      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="arsip-penghapusan-aset"
        title="Export Arsip Penghapusan Aset"
        fetchAllData={fetchAllArsipForExport}
      />
    </>
  );
}
