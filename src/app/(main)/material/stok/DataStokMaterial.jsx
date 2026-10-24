"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import useServerListFetch from "@/hooks/useServerListFetch";

const statusBadge = {
  aman: "bg-emerald-100 text-emerald-700",
  menipis: "bg-amber-100 text-amber-700",
  habis: "bg-rose-100 text-rose-700",
};

export default function DataStokMaterial() {
  const { fetchList } = useServerListFetch();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState("nama_material");
  const [sortDirection, setSortDirection] = useState("asc");

  const columns = [
    {
      key: "nama_material",
      title: "Barang",
      sortable: true,
      searchable: true,
    },
    {
      key: "kategori",
      title: "Kategori",
      sortable: true,
    },
    {
      key: "stok_sekarang",
      title: "Gudang",
      sortable: true,
      render: (value, item) => `${value ?? 0} ${item.satuan || ""}`.trim(),
    },
    {
      key: "total_pemakaian",
      title: "Pakai",
      sortable: true,
      render: (value, item) => `${value ?? 0} ${item.satuan || ""}`.trim(),
    },
    {
      key: "status_stok",
      title: "Status",
      filterable: true,
      filterOptions: [
        { value: "aman", label: "Aman" },
        { value: "menipis", label: "Menipis" },
        { value: "habis", label: "Habis" },
      ],
      render: (value) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[value] || "bg-gray-100"}`}>
          {value || "-"}
        </span>
      ),
    },
  ];

  const getStok = async (params = {}, showLoading = true) => {
    const nextSort = params.sortField !== undefined ? params.sortField : sortField;
    const nextDirection = params.sortDirection !== undefined ? params.sortDirection : sortDirection;
    await fetchList({
      endpoint: "/sp/material-data",
      page: params.page || currentPage,
      per_page: params.per_page || itemsPerPage,
      search: params.search !== undefined ? params.search : searchTerm,
      filters: params.filters || filters,
      extraParams: {
        sort_by: nextSort || "nama_material",
        sort_order: nextDirection || "asc",
      },
      showLoading,
      setLoading,
      onSuccess: (payload) => {
        setData(payload.data);
        setTotal(payload.total);
        setCurrentPage(payload.page);
        setItemsPerPage(payload.per_page);
      },
      onError: (error) => {
        console.error("Error fetching material stock:", error);
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
    getStok(params);
  };

  useEffect(() => {
    getStok();
  }, []);

  return (
    <DataTable
      data={data}
      total={total}
      loading={loading}
      columns={columns}
      searchable={true}
      filterable={true}
      sortable={true}
      pagination={true}
      itemsPerPageOptions={[5, 10, 25, 50]}
      defaultItemsPerPage={10}
      title="Stok Gudang Material"
      subtitle="Sisa di gudang dan jumlah yang sudah dipakai untuk teknis gedung"
      serverSide={true}
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
