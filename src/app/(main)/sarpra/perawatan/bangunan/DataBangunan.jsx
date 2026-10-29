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

export default function DataBangunan() {
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

  const getImageUrl = (filename) => getStorageUrl(filename, { kind: "bangunan" });

  const openImage = (filename, title) => {
    const imageUrl = getImageUrl(filename);
    if (!imageUrl) return;
    setSelectedImage({ url: imageUrl, title });
    setShowImageView(true);
  };

  const getBangunan = async (params = {}, showLoading = true) => {
    await fetchList({
      endpoint: "/sp/perawatan-bangunan",
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
      await api.put(`/sp/perawatan-bangunan-status/${item.id}`, { status: newStatus });
      getBangunan();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const photoCell = (value, item, title) => {
    const imageUrl = getImageUrl(value);
    if (!imageUrl) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700">
          <span className="text-xs font-medium text-gray-500">
            {item.nama_bagian?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>
      );
    }
    return (
      <button
        type="button"
        className="h-10 w-10 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700"
        onClick={() => openImage(value, title)}
        title="Lihat gambar"
      >
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      </button>
    );
  };

  const columns = [
    { key: "nama_bagian", title: "Bagian", sortable: true, searchable: true, filterable: true },
    {
      key: "jenis_kerusakan",
      title: "Jenis Kerusakan",
      sortable: true,
      searchable: true,
      filterable: true,
      wrap: true,
      minWidth: "220px",
    },
    {
      key: "tindakan",
      title: "Tindakan",
      sortable: true,
      wrap: true,
      minWidth: "220px",
    },
    {
      key: "tgl_masuk",
      title: "Tanggal Masuk",
      sortable: true,
      filterable: true,
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "-"),
    },
    { key: "ket", title: "Keterangan", wrap: true, minWidth: "180px", render: (value) => value || "-" },
    {
      key: "befoto",
      title: "Sebelum",
      render: (value, item) => photoCell(value, item, "Foto sebelum"),
    },
    {
      key: "lasfoto",
      title: "Sesudah",
      render: (value, item) => photoCell(value, item, "Foto sesudah"),
    },
    { key: "pic", title: "PJ", sortable: true },
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
  ];

  const handleDataChange = (params) => {
    if (params.page !== undefined) setCurrentPage(params.page);
    if (params.per_page !== undefined) setItemsPerPage(params.per_page);
    if (params.search !== undefined) setSearchTerm(params.search);
    if (params.filters !== undefined) setFilters(params.filters);
    if (params.sortField !== undefined) setSortField(params.sortField);
    if (params.sortDirection !== undefined) setSortDirection(params.sortDirection);
    getBangunan(params);
  };

  useEffect(() => {
    getBangunan();
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
        title="Laporan Perawatan Bangunan"
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
        filename="laporan-perawatan-bangunan"
        title="Export Laporan Perawatan Bangunan"
      />
      <ImageView
        show={showImageView && selectedImage !== null}
        onClose={() => {
          setShowImageView(false);
          setSelectedImage(null);
        }}
        images={selectedImage?.url}
        title={selectedImage?.title}
        alt={selectedImage?.title || "Foto perawatan bangunan"}
      />
    </div>
  );
}
