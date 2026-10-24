"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import { ClipboardList, Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import useServerListFetch from "@/hooks/useServerListFetch";
import TambahPersediaan from "./TambahPersediaan";

export default function DataPersediaan() {
  const router = useRouter();
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const columns = [
    { key: "kode", title: "Kode", searchable: true, filterable: false, sortable: true },
    { key: "nama", title: "Nama Barang", searchable: true, filterable: false, sortable: true },
    {
      key: "kategori",
      title: "Kategori",
      filterable: true,
      filterOptions: [
        { value: "alat", label: "Alat" },
        { value: "bahan", label: "Bahan" },
      ],
      render: (value) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${value === "bahan" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
          {value === "bahan" ? "Bahan" : "Alat"}
        </span>
      ),
    },
    { key: "satuan", title: "Satuan" },
    {
      key: "stok_sekarang",
      title: "Stok",
      render: (value, item) => (
        <span className={Number(item.perlu_restok) === 1 ? "font-semibold text-rose-600" : "text-gray-800"}>
          {value} {item.satuan || ""}
        </span>
      ),
    },
    { key: "stok_minimal", title: "Minimal" },
    { key: "lokasi_simpan", title: "Lokasi Simpan" },
    {
      key: "perlu_restok",
      title: "Kondisi",
      filterable: true,
      filterOptions: [{ value: "1", label: "Perlu restok" }],
      render: (value) =>
        Number(value) === 1 ? (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">Perlu restok</span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Aman</span>
        ),
    },
    {
      key: "actions",
      title: "Actions",
      type: "actions",
      sortable: false,
      actions: [
        { icon: ClipboardList, title: "Kartu", onClick: (item) => router.push(`/sarpra/kartu-persediaan?barang_id=${item.id}`) },
        { icon: Edit, title: "Edit", onClick: (item) => openEdit(item) },
        { icon: Trash2, title: "Delete", onClick: (item) => { setDeletingItem(item); setShowDeleteModal(true); } },
      ],
    },
  ];

  const getData = async (params = {}) => {
    await fetchList({
      endpoint: "/sp/persediaan",
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

  const postPersediaan = async (form) => {
    const response = editingItem?.id
      ? await api.put(`/sp/persediaan/${editingItem.id}`, form)
      : await api.post("/sp/persediaan", form);
    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Gagal menyimpan");
    }
    setShowAddModal(false);
    setEditingItem(null);
    setIsEditMode(false);
    getData();
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sp/persediaan/${deletingItem.id}`);
      setShowDeleteModal(false);
      setDeletingItem(null);
      getData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus barang");
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
        title="Persediaan Barang"
        subtitle="Saldo gudang alat dan bahan non-aset"
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
        onClose={() => { setShowDeleteModal(false); setDeletingItem(null); }}
        onConfirm={handleConfirmDelete}
        title="Hapus Barang"
        message={`Hapus "${deletingItem?.nama}" beserta kartu stoknya?`}
        loading={deleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={isEditMode ? "Edit Persediaan" : "Tambah Persediaan"}
          width="720px"
          closeOnOverlayClick={false}
        >
          <TambahPersediaan
            onClose={() => setShowAddModal(false)}
            postPersediaan={postPersediaan}
            editingItem={editingItem}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
    </div>
  );
}
