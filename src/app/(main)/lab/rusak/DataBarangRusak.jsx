"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import useServerListFetch from "@/hooks/useServerListFetch";
import TambahBarangRusak from "./TambahBarangRusak";
import dayjs from "dayjs";

export default function DataBarangRusak() {
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
    { key: "kode_barang", title: "Kode", searchable: true },
    { key: "nama_barang", title: "Nama Bahan", searchable: true },
    {
      key: "tgl_keluar",
      title: "Tanggal Rusak",
      render: (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-"),
    },
    { key: "jml", title: "Jumlah" },
    { key: "pengambil", title: "Pelapor" },
    { key: "petugas", title: "Petugas" },
    { key: "nama_lab", title: "Lab" },
    {
      key: "keterangan",
      title: "Keterangan",
      render: (value) => value || "-",
    },
    {
      key: "actions",
      title: "Actions",
      type: "actions",
      actions: [
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
    const nextFilters = { ...(params.filters || filters), jenis: "rusak" };
    await fetchList({
      endpoint: "/sp/bahan-keluar",
      page: params.page || currentPage,
      per_page: params.per_page || itemsPerPage,
      search: params.search !== undefined ? params.search : searchTerm,
      filters: nextFilters,
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
    const payload = { ...form, jenis: "rusak", status: "selesai" };
    const response = editingItem?.id
      ? await api.put(`/sp/bahan-keluar/${editingItem.id}`, payload)
      : await api.post("/sp/bahan-keluar", payload);
    if (response.data.status !== "success" && response.data.message !== "success") {
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
      await api.delete(`/sp/bahan-keluar/${deletingItem.id}`);
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
        title="Barang Rusak"
        subtitle="Daftar bahan praktikum rusak dari Bahan Keluar (jenis rusak)"
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
        title="Hapus Data Rusak"
        message={`Hapus data rusak "${deletingItem?.nama_barang}"? Stok akan dihitung ulang.`}
        loading={deleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={isEditMode ? "Edit Barang Rusak" : "Tambah Barang Rusak"}
          width="720px"
          closeOnOverlayClick={false}
        >
          <TambahBarangRusak
            onClose={() => setShowAddModal(false)}
            postData={postData}
            editingItem={editingItem}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
    </div>
  );
}
