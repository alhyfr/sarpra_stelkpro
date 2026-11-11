"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import { CheckCircle2, Edit, Eye, RotateCcw, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import useServerListFetch from "@/hooks/useServerListFetch";
import { useData } from "@/app/context/DataContext";
import TambahPenggunaan from "./TambahPenggunaan";
import Button from "@/components/Button";
import dayjs from "dayjs";

const statusBadge = {
  draft: "bg-slate-100 text-slate-700",
  dipinjam: "bg-amber-100 text-amber-800",
  sebagian: "bg-sky-100 text-sky-800",
  dikembalikan: "bg-emerald-100 text-emerald-800",
  batal: "bg-rose-100 text-rose-800",
};

export default function DataPenggunaan() {
  const { fetchList } = useServerListFetch();
  const { labs, getOpsi } = useData();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getOpsi();
  }, [getOpsi]);

  const openDetail = async (item) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/sp/penggunaan-lab/${item.id}`);
      setDetail(res.data?.data || null);
    } catch (error) {
      alert(error.response?.data?.message || "Gagal memuat detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const setStatus = async (item, status) => {
    try {
      await api.put(`/sp/penggunaan-lab/${item.id}/status`, { status });
      getData();
      if (detail?.id === item.id) openDetail(item);
    } catch (error) {
      alert(error.response?.data?.message || "Gagal update status");
    }
  };

  const returnOneItem = async (itemRow) => {
    try {
      await api.put(`/sp/penggunaan-lab/item/${itemRow.id}/kembali`, {
        jumlah_kembali: itemRow.jumlah,
        status: "dikembalikan",
      });
      if (detail?.id) openDetail({ id: detail.id });
      getData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengembalikan item");
    }
  };

  const columns = [
    { key: "nomor", title: "Nomor", searchable: true },
    {
      key: "tgl",
      title: "Tanggal",
      render: (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-"),
    },
    {
      key: "lab_id",
      title: "Lab",
      filterable: true,
      filterOptions: (labs || []).map((lab) => ({ value: String(lab.id), label: lab.nama_lab })),
      render: (_v, item) => item.nama_lab || "-",
    },
    { key: "peminjam", title: "Peminjam", searchable: true },
    { key: "kelas", title: "Kelas" },
    { key: "kegiatan", title: "Kegiatan" },
    {
      key: "total_item",
      title: "Item",
      render: (value, item) => `${value || 0} (${item.total_qty || 0})`,
    },
    {
      key: "status",
      title: "Status",
      filterable: true,
      filterOptions: [
        { value: "draft", label: "Draft" },
        { value: "dipinjam", label: "Dipinjam" },
        { value: "sebagian", label: "Sebagian" },
        { value: "dikembalikan", label: "Dikembalikan" },
        { value: "batal", label: "Batal" },
      ],
      render: (value) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[value] || statusBadge.draft}`}>
          {value || "draft"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      type: "actions",
      sortable: false,
      actions: [
        { icon: Eye, title: "Detail", onClick: (item) => openDetail(item) },
        {
          icon: CheckCircle2,
          title: "Tandai dipinjam",
          onClick: (item) => setStatus(item, "dipinjam"),
          show: (item) => item.status === "draft",
        },
        {
          icon: RotateCcw,
          title: "Kembalikan semua",
          onClick: (item) => setStatus(item, "dikembalikan"),
          show: (item) => item.status === "dipinjam" || item.status === "sebagian",
        },
        {
          icon: Edit,
          title: "Edit",
          onClick: (item) => {
            setEditingItem(item);
            setIsEditMode(true);
            setShowAddModal(true);
          },
        },
        {
          icon: Trash2,
          title: "Delete",
          onClick: (item) => {
            setDeletingItem(item);
            setShowDeleteModal(true);
          },
        },
      ],
    },
  ];

  const getData = async (params = {}) => {
    await fetchList({
      endpoint: "/sp/penggunaan-lab",
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

  const postPenggunaan = async (form) => {
    const response = editingItem?.id
      ? await api.put(`/sp/penggunaan-lab/${editingItem.id}`, form)
      : await api.post("/sp/penggunaan-lab", form);
    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Gagal menyimpan");
    }
    setShowAddModal(false);
    setEditingItem(null);
    setIsEditMode(false);
    getData();
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sp/penggunaan-lab/${deletingItem.id}`);
      setShowDeleteModal(false);
      setDeletingItem(null);
      getData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus");
    } finally {
      setDeleteLoading(false);
    }
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
    getData();
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
        selectable={false}
        onAdd={() => {
          setEditingItem(null);
          setIsEditMode(false);
          setShowAddModal(true);
        }}
        pagination
        itemsPerPageOptions={[10, 25, 50]}
        defaultItemsPerPage={10}
        title="Dokumen Penggunaan Alat & Bahan"
        subtitle="Catatan pinjam dan pengembalian alat/bahan praktikum (siap untuk app desktop)"
        serverSide
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
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Dokumen"
        message={`Hapus dokumen "${deletingItem?.nomor}" beserta itemnya?`}
        loading={deleteLoading}
        size="sm"
      />

      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={isEditMode ? "Edit Dokumen Penggunaan" : "Tambah Dokumen Penggunaan"}
          width="960px"
          maxHeight="90vh"
          closeOnOverlayClick={false}
        >
          <TambahPenggunaan
            onClose={() => setShowAddModal(false)}
            postPenggunaan={postPenggunaan}
            editingItem={editingItem}
            isEditMode={isEditMode}
          />
        </Modal>
      )}

      {detail && (
        <Modal
          show={!!detail}
          onClose={() => setDetail(null)}
          title={`Detail ${detail.nomor}`}
          width="900px"
          maxHeight="90vh"
        >
          {detailLoading ? (
            <p className="text-sm text-gray-500">Memuat...</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <div>
                  <p className="text-gray-500">Lab</p>
                  <p className="font-medium">{detail.nama_lab}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tanggal</p>
                  <p className="font-medium">{detail.tgl ? dayjs(detail.tgl).format("DD MMM YYYY") : "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[detail.status] || ""}`}>
                    {detail.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Peminjam</p>
                  <p className="font-medium">{detail.peminjam}</p>
                </div>
                <div>
                  <p className="text-gray-500">Kelas / Mapel</p>
                  <p className="font-medium">
                    {detail.kelas || "-"} / {detail.mapel || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Kegiatan</p>
                  <p className="font-medium">{detail.kegiatan || "-"}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th className="px-3 py-2">Jenis</th>
                      <th className="px-3 py-2">Kode</th>
                      <th className="px-3 py-2">Nama</th>
                      <th className="px-3 py-2">Jml</th>
                      <th className="px-3 py-2">Kembali</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.items || []).map((row) => (
                      <tr key={row.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 capitalize">{row.jenis}</td>
                        <td className="px-3 py-2">{row.kode || "-"}</td>
                        <td className="px-3 py-2">{row.nama}</td>
                        <td className="px-3 py-2">
                          {row.jumlah} {row.satuan || ""}
                        </td>
                        <td className="px-3 py-2">{row.jumlah_kembali}</td>
                        <td className="px-3 py-2">{row.status}</td>
                        <td className="px-3 py-2">
                          {row.status === "dipinjam" && (
                            <button
                              type="button"
                              onClick={() => returnOneItem(row)}
                              className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                            >
                              Kembalikan
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-2">
                {detail.status === "draft" && (
                  <Button type="button" onClick={() => setStatus(detail, "dipinjam")}>
                    Mulai pinjam
                  </Button>
                )}
                {(detail.status === "dipinjam" || detail.status === "sebagian") && (
                  <Button type="button" onClick={() => setStatus(detail, "dikembalikan")}>
                    Kembalikan semua
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
