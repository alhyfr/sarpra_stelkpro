'use client'
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import Modal from "@/components/Modal";
import { Trash2, Eye } from "lucide-react";
import api from "@/app/utils/Api";
import dayjs from "dayjs";
import useServerListFetch from "@/hooks/useServerListFetch";

const STATUS_LABEL = {
  dicek: "Dicek",
  bermasalah: "Bermasalah",
  selesai: "Selesai",
};

export default function DataLaporanPerawatanIt() {
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const columns = [
    {
      key: "tanggal",
      title: "Tanggal",
      searchable: true,
      filterable: true,
      type: "dateRange",
      format: "DD-MM-YYYY",
      render: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "-"),
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
      key: "kategori_nama",
      title: "Kategori",
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      key: "target",
      title: "Target",
      searchable: false,
      filterable: false,
      render: (_, row) => {
        if (row?.inventaris_id || row?.inventaris_nama) {
          return `Inv: ${row.inventaris_kode || "-"} — ${row.inventaris_nama || row.aset_nama || "-"}`;
        }
        if (row?.aset_manual_nama) {
          return `Manual: ${row.aset_manual_nama}${row.aset_manual_lokasi ? ` (${row.aset_manual_lokasi})` : ""}`;
        }
        if (row?.aset_nama) {
          return `${row.aset_kode ? row.aset_kode + " — " : ""}${row.aset_nama}`;
        }
        if (row?.nama_layanan) {
          return row.nama_layanan;
        }
        return "-";
      },
    },
    {
      key: "status",
      title: "Status",
      searchable: true,
      filterable: true,
      sortable: true,
      render: (value) => STATUS_LABEL[value] || value || "-",
    },
    {
      key: "nama_petugas",
      title: "Petugas",
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      key: "checklist_summary",
      title: "Checklist",
      searchable: false,
      filterable: false,
      render: (_, row) => {
        const list = Array.isArray(row?.checklist) ? row.checklist : [];
        if (!list.length) return "-";
        const ok = list.filter((c) => c.status === "ok").length;
        return `${ok}/${list.length} OK`;
      },
    },
    {
      key: "id_perbaikan",
      title: "Tindak Lanjut",
      searchable: false,
      filterable: false,
      render: (value) => (value ? `#${value}` : "-"),
    },
    {
      key: "actions",
      title: "Actions",
      type: "actions",
      sortable: false,
      actions: [
        {
          icon: Eye,
          title: "Detail",
          onClick: (item) => handleDetail(item),
        },
        {
          icon: Trash2,
          title: "Delete",
          onClick: (item) => handleDelete(item),
        },
      ],
    },
  ];

  const getList = async (params = {}, showLoading = true) => {
    await fetchList({
      endpoint: "/sp/laporan-perawatan-it",
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
        console.error("Error fetching laporan perawatan IT:", error);
        setData([]);
        setTotal(0);
      },
    });
  };

  const handleDetail = async (item) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/sp/laporan-perawatan-it/${item.id}`);
      setDetailItem(res.data?.data || item);
    } catch (error) {
      console.error(error);
      setDetailItem(item);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sp/laporan-perawatan-it/${deletingItem.id}`);
      getList({}, true);
      setShowDeleteModal(false);
      setDeletingItem(null);
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = (selectedIds) => {
    setBulkDeleteIds(selectedIds);
    setShowBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return;
    setBulkDeleteLoading(true);
    try {
      await Promise.all(
        bulkDeleteIds.map((id) => api.delete(`/sp/laporan-perawatan-it/${id}`))
      );
      getList({}, true);
      setShowBulkDeleteModal(false);
      setBulkDeleteIds([]);
    } catch (error) {
      console.error("Error bulk deleting:", error);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleDataChange = (params) => {
    if (params.page !== undefined) setCurrentPage(params.page);
    if (params.per_page !== undefined) setItemsPerPage(params.per_page);
    if (params.search !== undefined) setSearchTerm(params.search);
    if (params.filters !== undefined) setFilters(params.filters);
    if (params.sortField !== undefined) setSortField(params.sortField);
    if (params.sortDirection !== undefined) setSortDirection(params.sortDirection);
    getList(params);
  };

  useEffect(() => {
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checklist = Array.isArray(detailItem?.checklist)
    ? detailItem.checklist
    : [];

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
        selectable={true}
        onExport={() => setShowExportModal(true)}
        onBulkDelete={handleBulkDelete}
        pagination={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        title="Laporan Perawatan Perangkat IT"
        subtitle="Hasil input perawatan IT dari sip-mon (hanya laporan)"
        serverSide={true}
        onDataChange={handleDataChange}
        currentPage={currentPage}
        currentItemsPerPage={itemsPerPage}
        currentSearch={searchTerm}
        currentFilters={filters}
        currentSortField={sortField}
        currentSortDirection={sortDirection}
      />

      <DeleteModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingItem(null);
          setDeleteLoading(false);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Laporan"
        message={`Hapus perawatan IT tanggal ${
          deletingItem?.tanggal
            ? dayjs(deletingItem.tanggal).format("DD-MM-YYYY")
            : "-"
        }?`}
        loading={deleteLoading}
        size="sm"
      />

      <DeleteModal
        show={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Multiple"
        message={`Hapus ${bulkDeleteIds.length} data laporan perawatan IT?`}
        loading={bulkDeleteLoading}
        size="sm"
      />

      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="laporan-perawatan-it"
        title="Export Laporan Perawatan IT"
      />

      <Modal
        show={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDetailItem(null);
        }}
        title="Detail Perawatan IT"
        size="lg"
      >
        {detailLoading ? (
          <p className="text-sm text-gray-500">Memuat...</p>
        ) : detailItem ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-gray-500">Tanggal</p>
                <p className="font-medium">
                  {detailItem.tanggal
                    ? dayjs(detailItem.tanggal).format("DD MMMM YYYY")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium">
                  {STATUS_LABEL[detailItem.status] || detailItem.status}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Kategori</p>
                <p className="font-medium">{detailItem.kategori_nama || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Petugas</p>
                <p className="font-medium">{detailItem.nama_petugas || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">Aset</p>
                <p className="font-medium">
                  {detailItem.inventaris_id
                    ? `${detailItem.inventaris_kode || ""} — ${detailItem.inventaris_nama || ""}`.trim()
                    : detailItem.aset_manual_nama
                      ? `${detailItem.aset_manual_nama}${detailItem.aset_manual_lokasi ? ` (${detailItem.aset_manual_lokasi})` : ""} [manual]`
                      : detailItem.aset_nama
                        ? `${detailItem.aset_kode || ""} ${detailItem.aset_nama}`.trim()
                        : "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Layanan</p>
                <p className="font-medium">{detailItem.nama_layanan || "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 mb-2">Checklist</p>
              {checklist.length === 0 ? (
                <p className="text-gray-400">Tidak ada checklist</p>
              ) : (
                <ul className="space-y-2">
                  {checklist.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3 border rounded-lg px-3 py-2"
                    >
                      <span>{c.item || "-"}</span>
                      <span className="shrink-0 font-medium">
                        {c.status === "ok"
                          ? "OK"
                          : c.status === "tidak"
                            ? "Tidak"
                            : "-"}
                        {c.nilai ? ` (${c.nilai})` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {detailItem.catatan && (
              <div>
                <p className="text-gray-500">Catatan</p>
                <p className="font-medium whitespace-pre-wrap">
                  {detailItem.catatan}
                </p>
              </div>
            )}

            {detailItem.id_perbaikan && (
              <div>
                <p className="text-gray-500">Tindak lanjut perbaikan</p>
                <p className="font-medium">#{detailItem.id_perbaikan}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Data tidak ditemukan</p>
        )}
      </Modal>
    </div>
  );
}
