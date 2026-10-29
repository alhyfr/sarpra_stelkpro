"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import ExportModal from "@/components/ExportModal";
import ImageView from "@/components/ImageView";
import Aswitch from "@/components/Aswitch";
import api from "@/app/utils/Api";
import dayjs from "dayjs";
import { getStorageUrl } from "@/helper/storageUrl";
import useServerListFetch from "@/hooks/useServerListFetch";

const statusBadge = {
  proses: "bg-amber-100 text-amber-800",
  selesai: "bg-emerald-100 text-emerald-800",
  terjadwal: "bg-blue-100 text-blue-800",
};

export default function DataAset() {
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageView, setShowImageView] = useState(false);

  const getImageUrl = (filename) => getStorageUrl(filename);

  const handleViewImage = (item) => {
    const imageUrl = getImageUrl(item.gambar);
    if (!imageUrl) return;
    setSelectedImage({ url: imageUrl, title: item.desc || item.kode || "Foto perawatan aset" });
    setShowImageView(true);
  };

  const getPaset = async (params = {}, showLoading = true) => {
    await fetchList({
      endpoint: "/sp/perawatan-aset",
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
      onError: () => {
        setData([]);
        setTotal(0);
      },
    });
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      await api.put(`/sp/perawatan-aset-status/${item.id}`, { status: newStatus });
      getPaset();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const columns = [
    { key: "kode", title: "Kode Barang", sortable: true, searchable: true, filterable: true },
    { key: "desc", title: "Nama Barang", sortable: true, searchable: true, filterable: true },
    { key: "ruang", title: "Lokasi", sortable: true, searchable: true, filterable: true },
    { key: "jenis_kerusakan", title: "Jenis Kerusakan", sortable: true, searchable: true, filterable: true },
    {
      key: "tgl_masuk",
      title: "Tanggal Masuk",
      sortable: true,
      filterable: true,
      type: "dateRange",
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "-"),
      filterOptions: [
        { value: "last3Months", label: "3 Bulan Terakhir" },
        { value: "custom", label: "Custom Range" },
      ],
    },
    { key: "tindakan", title: "Tindakan", wrap: true, minWidth: "200px" },
    {
      key: "tgl_selesai",
      title: "Tanggal Selesai",
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "Dalam proses"),
    },
    {
      key: "status",
      title: "Status",
      filterable: true,
      filterOptions: [
        { value: "proses", label: "Proses" },
        { value: "selesai", label: "Selesai" },
        { value: "terjadwal", label: "Terjadwal" },
      ],
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[value] || "bg-gray-100"}`}>
            {value || "-"}
          </span>
          <Aswitch
            value={value === "selesai" ? "selesai" : "proses"}
            onChange={(next) => handleStatusChange(item, next)}
          />
        </div>
      ),
    },
    {
      key: "gambar",
      title: "Gambar",
      render: (value, item) => {
        const imageUrl = getImageUrl(value);
        if (!imageUrl) {
          return (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700">
              <span className="text-xs font-medium text-gray-500">
                {item.desc?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          );
        }
        return (
          <button
            type="button"
            className="h-10 w-10 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700"
            onClick={() => handleViewImage(item)}
            title="Lihat gambar"
          >
            <img src={imageUrl} alt={item.desc || "Foto"} className="h-full w-full object-cover" />
          </button>
        );
      },
    },
  ];

  const handleDataChange = (params) => {
    if (params.page !== undefined) setCurrentPage(params.page);
    if (params.per_page !== undefined) setItemsPerPage(params.per_page);
    if (params.search !== undefined) setSearchTerm(params.search);
    if (params.filters !== undefined) setFilters(params.filters);
    if (params.sortField !== undefined) setSortField(params.sortField);
    if (params.sortDirection !== undefined) setSortDirection(params.sortDirection);
    getPaset(params);
  };

  useEffect(() => {
    getPaset();
  }, []);

  return (
    <div>
      <DataTable
        data={data}
        total={total}
        loading={loading}
        columns={columns}
        searchable
        filterable
        sortable
        selectable={false}
        onExport={() => setShowExportModal(true)}
        pagination
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        title="Laporan Perawatan Aset"
        subtitle="Hanya laporan & status. Input perawatan dilakukan di sip-mon."
        serverSide
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
        filename="laporan-perawatan-aset"
        title="Export Laporan Perawatan Aset"
      />
      <ImageView
        show={showImageView && selectedImage !== null}
        onClose={() => {
          setShowImageView(false);
          setSelectedImage(null);
        }}
        images={selectedImage?.url}
        title={selectedImage?.title}
        alt={selectedImage?.title || "Foto perawatan aset"}
      />
    </div>
  );
}
