"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Edit, Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import TambahAtkMasuk from "./TambahAtkMasuk";
import { useData } from "@/app/context/DataContext";
import ImageView from "@/components/ImageView";
import dayjs from "dayjs";

export default function DataAtkMasuk() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filters, setFilters] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAtkMasuk, setEditingAtkMasuk] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAtkMasuk, setDeletingAtkMasuk] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImageView, setShowImageView] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { dana, getOpsi } = useData();

  useEffect(() => {
    getOpsi();
  }, []);

  const getImageUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
      return filename;
    }
    const baseURL = process.env.NEXT_PUBLIC_API_STORAGE;
    if (filename.startsWith("/")) {
      return `${baseURL}${filename}`;
    }
    return `${baseURL}/${filename}`;
  };

  const handleViewImage = (item) => {
    const imageUrl = getImageUrl(item.nota);
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        title: item.id,
      });
      setShowImageView(true);
    }
  };

  

  const columns = [
    {
      key: 'id',
      title: 'ID',
      searchable: true,
      filterable: true,
    },
    {
        key: 'nabar',
        title: 'Nama Barang',
        searchable: true,
        filterable: true,
      },
    {
      key: 'jml',
      title: 'Jumlah',
      searchable: true,
    },
    {
      key: 'tgl',
      title: 'Tanggal Masuk',
      searchable: true,
      filterable: true,
      type: 'dateRange',
      format: 'DD-MM-YYYY',
      render: (value) => dayjs(value).format('DD-MM-YYYY'),
      filterOptions: [
        { 
          value: "last3Months", 
          label: "3 Bulan Terakhir",
          getValue: () => {
            const threeMonthsAgo = dayjs().subtract(3, 'month').startOf('month').format("YYYY-MM-DD");
            const today = dayjs().format("YYYY-MM-DD");
            return `${threeMonthsAgo},${today}`;
          }
        },
        { 
          value: "custom", 
          label: "Custom Range",
          isCustomRange: true
        }
      ],
    },
    {
      key: 'sumber',
      title: 'Sumber Dana',
      searchable: true,
      filterable: true,
      filterOptions: dana.map((item) => ({
        value: item.sumber,
        label: item.sumber,
      })),
      
    },
    {
      key: 'nota',
      title: 'Nota',
      searchable: true,
      filterable: true,
       render: (value, item) => {
         const imageUrl = getImageUrl(value);
         
         // Fallback component untuk menampilkan initial
         const FallbackAvatar = () => (
           <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md">
             <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
               {item.nabar?.charAt(0).toUpperCase() || '?'}
             </span>
           </div>
         );
         
         if (!imageUrl) {
           return <FallbackAvatar />;
         }
         
         // Gunakan img tag biasa dengan error handling yang lebih baik
         return (
           <div 
             className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
             onClick={() => handleViewImage(item)}
             title="Klik untuk melihat gambar"
           >
             <img
               src={imageUrl}
               alt={item.nabar || 'Nota'}
               className="w-full h-full object-cover"
               onError={(e) => {
                 // Simply hide the image, React will handle the rest
                 e.target.style.display = 'none';
               }}
             />
           </div>
         );
       },
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: true,
      searchable: true,
      filterable: true,
      type: 'actions',
      actions: [
        {
          icon: Edit,
          title: 'Edit',
          onClick: (item) => handleEdit(item),
        },
        {
          icon: Trash2,
          title: 'Delete',
          onClick: (item) => handleDelete(item),
        },
      ],
    },
  ];

  const getAtkMasuk = async (params = {}, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800));

      const queryParams = new URLSearchParams({
        page: params.page || currentPage,
        per_page: params.per_page || itemsPerPage
      });

      const searchValue = params.search !== undefined ? params.search : searchTerm;
      if (searchValue && searchValue.trim() !== '') {
        queryParams.append('search', searchValue);
      }

      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value);
          }
        });
      }

      const [response] = await Promise.all([
        api.get(`/sp/atk-in?${queryParams}`),
        minLoadingTime
      ]);

       if (response.data.message === 'success') {
         const rawData = response.data.data;
         
        setData(rawData);
        setTotal(response.data.pagination?.total || rawData.length);
        setCurrentPage(response.data.pagination?.current_page || 1);
        setItemsPerPage(response.data.pagination?.per_page || 10);
       }
    } catch (error) {
      console.error('Error fetching ATK Masuk:', error);
      setData([]);
      setTotal(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const postAtkMasuk = async (form) => {
    try {
      let response;
      const config = form instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {};

       if (editingAtkMasuk) {
         if (form instanceof FormData) {
           form.append('_method', 'PUT');
           response = await api.put(`/sp/atk-in/${editingAtkMasuk.id}`, form, config);
         } else {
           response = await api.put(`/sp/atk-in/${editingAtkMasuk.id}`, form, config);
         }
       } else {
         response = await api.post('/sp/atk-in', form, config);
       }

      if (response.data.message === 'success') {
        getAtkMasuk();
        setShowAddModal(false);
        setEditingAtkMasuk(null);
        setIsEditMode(false);
        return response.data;
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Terjadi kesalahan saat menyimpan data');
      }
    }
  };

  const handleDelete = (item) => {
    setDeletingAtkMasuk(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAtkMasuk) return;

    setDeleteLoading(true);
     try {
       await api.delete(`/sp/atk-in/${deletingAtkMasuk.id}`);
       getAtkMasuk();
       setShowDeleteModal(false);
       setDeletingAtkMasuk(null);
     } catch (error) {
       console.error('Error deleting ATK Masuk:', error);
     } finally {
       setDeleteLoading(false);
     }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingAtkMasuk(null);
    setDeleteLoading(false);
  };

  const handleBulkDelete = (selectedIds) => {
    setBulkDeleteIds(selectedIds);
    setShowBulkDeleteModal(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return;

    setBulkDeleteLoading(true);
     try {
       const deletePromises = bulkDeleteIds.map(id => api.delete(`/sp/atk-in/${id}`));
       await Promise.all(deletePromises);
       getAtkMasuk();
       setShowBulkDeleteModal(false);
       setBulkDeleteIds([]);
     } catch (error) {
       console.error('Error bulk deleting ATK Masuk:', error);
     } finally {
       setBulkDeleteLoading(false);
     }
  };

  const handleAdd = () => {
    setEditingAtkMasuk(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setEditingAtkMasuk(item);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingAtkMasuk(null);
    setIsEditMode(false);
  };

  const handleAddSuccess = (newAtkMasuk) => {
    getAtkMasuk();
    setShowAddModal(false);
    setEditingAtkMasuk(null);
    setIsEditMode(false);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleDataChange = (params) => {
    if (params.page !== undefined) {
      setCurrentPage(params.page);
    }
    if (params.per_page !== undefined) {
      setItemsPerPage(params.per_page);
    }
    if (params.search !== undefined) {
      setSearchTerm(params.search);
    }
    if (params.filters !== undefined) {
      setFilters(params.filters);
    }
    if (params.sortField !== undefined) {
      setSortField(params.sortField);
    }
    if (params.sortDirection !== undefined) {
      setSortDirection(params.sortDirection);
    }

    getAtkMasuk(params);
  };

  useEffect(() => {
    getAtkMasuk();
  }, []);

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
        onAdd={handleAdd}
        onExport={handleExport}
        onBulkDelete={handleBulkDelete}
        pagination={true}
        itemsPerPageOptions={[5, 10, 25, 50]}
        defaultItemsPerPage={10}
        title="Data ATK Masuk"
        subtitle="Kelola data ATK Masuk"
        serverSide={true}
        onDataChange={handleDataChange}
        currentPage={currentPage}
        currentItemsPerPage={itemsPerPage}
        currentSearch={searchTerm}
        currentFilters={filters}
        currentSortField={sortField}
        currentSortDirection={sortDirection}
      />

      {/* Modal Delete Single */}
      <DeleteModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus ATK Masuk"
        message={`Apakah Anda yakin ingin menghapus "${deletingAtkMasuk?.nabar}"?`}
        loading={deleteLoading}
        size="sm"
      />

      {/* Modal Delete Multiple */}
      <DeleteModal
        show={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Multiple ATK Masuk"
        message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} ATK Masuk?`}
        loading={bulkDeleteLoading}
        size="sm"
      />

      {/* Modal Add/Edit */}
      {showAddModal && (
        <Modal
          show={showAddModal}
          onClose={handleCloseAddModal}
          title={isEditMode ? 'Edit ATK Masuk' : 'Tambah ATK Masuk Baru'}
          size="lg"
          closeOnOverlayClick={false}
        >
          <TambahAtkMasuk
            onClose={handleCloseAddModal}
            onSuccess={handleAddSuccess}
            postAtkMasuk={postAtkMasuk}
            editingAtkMasuk={editingAtkMasuk}
            isEditMode={isEditMode}
          />
        </Modal>
      )}

      {/* Modal Export */}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={data}
        columns={columns}
        filename="data-atk-masuk"
        title="Export Data ATK Masuk"
      />

      {/* Image Viewer */}
      <ImageView
        show={showImageView}
        onClose={() => {
          setShowImageView(false);
          setSelectedImage(null);
        }}
        images={selectedImage?.url}
        title={selectedImage?.title}
        alt={selectedImage?.title || 'ATK Masuk Photo'}
      />
    </div>
  );
}