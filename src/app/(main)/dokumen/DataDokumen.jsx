"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import { Download, Edit, Eye, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import useServerListFetch from "@/hooks/useServerListFetch";
import { getStorageUrl } from "@/helper/storageUrl";
import TambahDokumen from "./TambahDokumen";

export default function DataDokumen() {
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
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/sp/dokumen/kategori");
        const rows = res.data?.data || [];
        setKategoriOptions(rows.map((item) => ({ value: String(item.id), label: item.nama })));
      } catch {
        setKategoriOptions([]);
      }
    };
    load();
  }, []);

  const getFileUrl = (item) => getStorageUrl(item?.file_path) || item?.file_url || null;

  const openPreview = (item) => {
    const url = getFileUrl(item);
    if (!url) {
      alert("File tidak tersedia");
      return;
    }
    setPreviewItem(item);
  };

  const downloadFile = (item) => {
    const url = getFileUrl(item);
    if (!url) {
      alert("File tidak tersedia");
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = item.file_name || item.judul || "dokumen.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { key: "kode", title: "Kode", searchable: true },
    { key: "judul", title: "Judul", searchable: true },
    {
      key: "kategori_id",
      title: "Kategori",
      filterable: true,
      filterOptions: kategoriOptions,
      render: (_value, item) => item.kategori_nama || "-",
    },
    { key: "nomor_dokumen", title: "Nomor", searchable: true },
    {
      key: "nomor_revisi",
      title: "Revisi",
      render: (value) => value || "-",
    },
    {
      key: "tgl_dokumen",
      title: "Tgl Dokumen",
      render: (value) => (value ? String(value).slice(0, 10) : "-"),
    },
    {
      key: "aktif",
      title: "Status",
      filterable: true,
      filterOptions: [
        { value: "1", label: "Aktif" },
        { value: "0", label: "Nonaktif" },
      ],
      render: (value) =>
        Number(value) === 0 || value === false ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Nonaktif</span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Aktif</span>
        ),
    },
    {
      key: "actions",
      title: "Actions",
      type: "actions",
      sortable: false,
      actions: [
        { icon: Eye, title: "Lihat", onClick: (item) => openPreview(item) },
        { icon: Download, title: "Unduh", onClick: (item) => downloadFile(item) },
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
    const nextFilters = { ...(params.filters || filters) };
    if (nextFilters.kategori_id) {
      // map filter key for API
    }
    await fetchList({
      endpoint: "/sp/dokumen",
      page: params.page || currentPage,
      per_page: params.per_page || itemsPerPage,
      search: params.search !== undefined ? params.search : searchTerm,
      filters: {
        ...nextFilters,
        kategori_id: nextFilters.kategori_id,
        aktif: nextFilters.aktif,
      },
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

  const postDokumen = async (form) => {
    const response = editingItem?.id
      ? await api.put(`/sp/dokumen/${editingItem.id}`, form)
      : await api.post("/sp/dokumen", form);
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
      await api.delete(`/sp/dokumen/${deletingItem.id}`);
      setShowDeleteModal(false);
      setDeletingItem(null);
      getData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus dokumen");
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
        title="Arsip Dokumen"
        subtitle="Prosedur ISO, surat, sertifikat, dan dokumen lainnya"
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
        message={`Hapus "${deletingItem?.judul}" beserta filenya?`}
        loading={deleteLoading}
        size="sm"
      />
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={isEditMode ? "Edit Dokumen" : "Tambah Dokumen"}
          width="760px"
          closeOnOverlayClick={false}
        >
          <TambahDokumen
            onClose={() => setShowAddModal(false)}
            postDokumen={postDokumen}
            editingItem={editingItem}
            isEditMode={isEditMode}
          />
        </Modal>
      )}
      {previewItem && (
        <Modal
          show={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={previewItem.judul || "Pratinjau PDF"}
          width="92vw"
          maxWidth="1100px"
          height="88vh"
          closeOnOverlayClick
        >
          <div className="flex h-full min-h-[70vh] flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-800">{previewItem.kode}</span>
                {previewItem.kategori_nama ? ` · ${previewItem.kategori_nama}` : ""}
                {previewItem.nomor_dokumen ? ` · ${previewItem.nomor_dokumen}` : ""}
              </div>
              <button
                type="button"
                onClick={() => downloadFile(previewItem)}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Unduh PDF
              </button>
            </div>
            <iframe
              title={previewItem.judul || "PDF"}
              src={`${getFileUrl(previewItem)}#toolbar=1&navpanes=0`}
              className="h-full min-h-[65vh] w-full flex-1 rounded-lg border border-gray-200 bg-white"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
