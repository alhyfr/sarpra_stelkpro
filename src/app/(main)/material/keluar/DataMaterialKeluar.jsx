"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import ExportModal from "@/components/ExportModal";
import dayjs from "dayjs";
import useServerListFetch from "@/hooks/useServerListFetch";

export default function DataMaterialKeluar() {
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

  const columns = [
    {
      key: "nama_material",
      title: "Nama Material",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "tgl_pakai",
      title: "Tanggal Pakai",
      sortable: true,
      searchable: true,
      filterable: true,
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "-"),
    },
    {
      key: "jumlah_pakai",
      title: "Jumlah Pakai",
      sortable: true,
      searchable: true,
      filterable: true,
      render: (value, item) => `${value ?? 0} ${item.satuan || ""}`.trim(),
    },
    {
      key: "lokasi_pakai",
      title: "Lokasi Pakai",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "teknisi",
      title: "Pengambil",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "keterangan",
      title: "Keterangan",
      render: (value) => value || "-",
    },
  ];

  const getMaterialKeluar = async (params = {}, showLoading = true) => {
    await fetchList({
      endpoint: "/sp/material-outs",
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

  const handleDataChange = (params) => {
    if (params.page !== undefined) setCurrentPage(params.page);
    if (params.per_page !== undefined) setItemsPerPage(params.per_page);
    if (params.search !== undefined) setSearchTerm(params.search);
    if (params.filters !== undefined) setFilters(params.filters);
    if (params.sortField !== undefined) setSortField(params.sortField);
    if (params.sortDirection !== undefined) setSortDirection(params.sortDirection);
    getMaterialKeluar(params);
  };

  useEffect(() => {
    getMaterialKeluar();
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
        selectable={false}
        onExport={() => setShowExportModal(true)}
        pagination={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        title="Laporan Material Keluar"
        subtitle="Hanya laporan. Input pemakaian dilakukan di sip-mon."
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
        filename="laporan-material-keluar"
        title="Export Laporan Material Keluar"
      />
    </div>
  );
}
