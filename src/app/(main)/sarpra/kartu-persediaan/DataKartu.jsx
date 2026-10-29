"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import dayjs from "dayjs";
import useServerListFetch from "@/hooks/useServerListFetch";

const jenisBadge = {
  masuk: "bg-emerald-100 text-emerald-700",
  keluar: "bg-blue-100 text-blue-700",
  rusak: "bg-rose-100 text-rose-700",
  opname: "bg-amber-100 text-amber-700",
};

const jenisLabel = {
  masuk: "Masuk",
  keluar: "Distribusi",
  rusak: "Rusak",
  opname: "Opname",
};

export default function DataKartu() {
  const { fetchList } = useServerListFetch();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [ready, setReady] = useState(false);

  const columns = [
    {
      key: "tanggal",
      title: "Tanggal",
      type: "dateRange",
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "-"),
    },
    {
      key: "nama",
      title: "Barang",
      render: (value, item) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{item.kode}</div>
        </div>
      ),
    },
    {
      key: "jenis",
      title: "Jenis",
      filterable: true,
      filterOptions: [
        { value: "masuk", label: "Masuk" },
        { value: "keluar", label: "Distribusi" },
        { value: "rusak", label: "Rusak" },
        { value: "opname", label: "Opname" },
      ],
      render: (value) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${jenisBadge[value] || "bg-gray-100"}`}>
          {jenisLabel[value] || value || "-"}
        </span>
      ),
    },
    {
      key: "jumlah",
      title: "Jumlah",
      render: (value, item) =>
        item.jenis === "opname" ? `selisih ${value}` : `${value} ${item.satuan || ""}`,
    },
    {
      key: "stok_sesudah",
      title: "Sisa",
      render: (value, item) => `${value} ${item.satuan || ""}`,
    },
    { key: "ruangan", title: "Ruangan", render: (value) => value || "-" },
    { key: "keterangan", title: "Keterangan", render: (value) => value || "-" },
  ];

  const getData = async (params = {}) => {
    await fetchList({
      endpoint: "/sp/persediaan-mutasi",
      page: params.page || currentPage,
      per_page: params.per_page || itemsPerPage,
      search: params.search !== undefined ? params.search : searchTerm,
      filters: params.filters || filters,
      setLoading,
      onSuccess: (payload) => {
        setData(payload.data);
        setTotal(payload.total);
        setCurrentPage(payload.page);
        setItemsPerPage(payload.per_page);
      },
      onError: () => {
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
    getData(params);
  };

  useEffect(() => {
    const barangId = new URLSearchParams(window.location.search).get("barang_id");
    const nextFilters = barangId ? { barang_id: barangId } : {};
    setFilters(nextFilters);
    setReady(true);
    getData({ page: 1, filters: nextFilters });
  }, []);

  return (
    <DataTable
      data={data}
      total={total}
      loading={loading || !ready}
      columns={columns}
      searchable
      filterable
      selectable={false}
      pagination
      itemsPerPageOptions={[10, 25, 50]}
      defaultItemsPerPage={10}
      title="Laporan Kartu Persediaan"
      subtitle="Hanya laporan. Input mutasi dan distribusi dilakukan di sip-mon."
      serverSide
      onDataChange={handleDataChange}
      currentPage={currentPage}
      currentItemsPerPage={itemsPerPage}
      currentSearch={searchTerm}
      currentFilters={filters}
      currentSortField={sortField}
      currentSortDirection={sortDirection}
    />
  );
}
