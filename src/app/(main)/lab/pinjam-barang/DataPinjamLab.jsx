"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import { CheckCircle2, Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import useServerListFetch from "@/hooks/useServerListFetch";
import { useData } from "@/app/context/DataContext";
import TambahPinjamLab from "./TambahPinjamLab";
import Button from "@/components/Button";
import AInput from "@/components/AInput";
import ASelect from "@/components/ASelect";
import dayjs from "dayjs";

export default function DataPinjamLab() {
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
  const [returnItem, setReturnItem] = useState(null);
  const [returnForm, setReturnForm] = useState({
    tgl_kembali: dayjs().format("YYYY-MM-DD"),
    kondisi_kembali: "baik",
  });
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    getOpsi();
  }, [getOpsi]);

  const columns = [
    { key: "nomor", title: "Nomor", searchable: true },
    {
      key: "tgl_pinjam",
      title: "Tgl Pinjam",
      render: (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-"),
    },
    {
      key: "lab_id",
      title: "Lab",
      filterable: true,
      filterOptions: (labs || []).map((lab) => ({
        value: String(lab.id),
        label: lab.nama_lab,
      })),
      render: (_v, item) => item.nama_lab || "-",
    },
    {
      key: "jenis",
      title: "Jenis",
      filterable: true,
      filterOptions: [
        { value: "bahan", label: "Bahan" },
        { value: "alat", label: "Alat" },
      ],
      render: (value) => (value === "alat" ? "Alat" : "Bahan"),
    },
    { key: "nama", title: "Barang", searchable: true },
    { key: "jml", title: "Jml" },
    { key: "peminjam", title: "Peminjam", searchable: true },
    {
      key: "tgl_rencana_kembali",
      title: "Rencana Kembali",
      render: (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-"),
    },
    {
      key: "status",
      title: "Status",
      filterable: true,
      filterOptions: [
        { value: "proses", label: "Dipinjam" },
        { value: "selesai", label: "Dikembalikan" },
      ],
      render: (value) =>
        value === "selesai" ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Dikembalikan
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Dipinjam
          </span>
        ),
    },
    {
      key: "actions",
      title: "Actions",
      type: "actions",
      actions: [
        {
          icon: CheckCircle2,
          title: "Kembalikan",
          show: (item) => item.status === "proses",
          onClick: (item) => {
            setReturnItem(item);
            setReturnForm({
              tgl_kembali: dayjs().format("YYYY-MM-DD"),
              kondisi_kembali: "baik",
            });
          },
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
      endpoint: "/sp/lab-pinjam",
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

  const postData = async (form) => {
    const response = editingItem?.id
      ? await api.put(`/sp/lab-pinjam/${editingItem.id}`, form)
      : await api.post("/sp/lab-pinjam", form);
    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Gagal menyimpan");
    }
    setShowAddModal(false);
    setEditingItem(null);
    setIsEditMode(false);
    getData();
  };

  const handleReturn = async () => {
    if (!returnItem) return;
    setReturnLoading(true);
    try {
      await api.put(`/sp/lab-pinjam/${returnItem.id}/status`, {
        status: "selesai",
        ...returnForm,
      });
      setReturnItem(null);
      getData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengembalikan");
    } finally {
      setReturnLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sp/lab-pinjam/${deletingItem.id}`);
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
        title="Peminjaman Barang Lab"
        subtitle="Pinjam alat/bahan ke luar lab (bisa berhari-hari). Stok bahan berkurang sampai dikembalikan."
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
        title="Hapus Peminjaman"
        message={`Hapus peminjaman "${deletingItem?.nomor}"?`}
        loading={deleteLoading}
        size="sm"
      />

      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={isEditMode ? "Edit Peminjaman Lab" : "Tambah Peminjaman Lab"}
          width="860px"
          closeOnOverlayClick={false}
        >
          <TambahPinjamLab
            onClose={() => setShowAddModal(false)}
            postData={postData}
            editingItem={editingItem}
            isEditMode={isEditMode}
          />
        </Modal>
      )}

      {returnItem && (
        <Modal
          show={!!returnItem}
          onClose={() => setReturnItem(null)}
          title={`Kembalikan ${returnItem.nama}`}
          width="480px"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {returnItem.jenis === "bahan"
                ? "Jika kondisi baik, stok bahan akan dikembalikan. Jika rusak/hilang, stok tetap berkurang sebagai rusak."
                : "Catat tanggal dan kondisi pengembalian alat."}
            </p>
            <AInput
              id="tgl_kembali"
              name="tgl_kembali"
              type="date"
              label="Tanggal Kembali"
              value={returnForm.tgl_kembali}
              onChange={(e) =>
                setReturnForm((prev) => ({ ...prev, tgl_kembali: e.target.value }))
              }
              required
            />
            <ASelect
              id="kondisi_kembali"
              name="kondisi_kembali"
              label="Kondisi Kembali"
              value={returnForm.kondisi_kembali}
              onChange={(e) =>
                setReturnForm((prev) => ({ ...prev, kondisi_kembali: e.target.value }))
              }
              options={[
                { value: "baik", label: "Baik" },
                { value: "rusak", label: "Rusak" },
                { value: "hilang", label: "Hilang" },
              ]}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setReturnItem(null)}>
                Batal
              </Button>
              <Button type="button" onClick={handleReturn} disabled={returnLoading}>
                {returnLoading ? "Menyimpan..." : "Konfirmasi Kembali"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
