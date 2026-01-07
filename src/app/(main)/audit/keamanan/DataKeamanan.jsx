'use client'
import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import DeleteModal from "@/components/Delete";
import ExportModal from "@/components/ExportModal";
import { Trash2 } from "lucide-react";
import api from "@/app/utils/Api";
import dayjs from "dayjs";
export default function DataKeamanan() {
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
    const [deletingAudit, setDeletingAudit] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const columns = [
        {
            key: "tgl",
            title: "Tanggal Mulai",
            searchable: true,
            filterable: true,
            type: "dateRange",
            format: "DD-MM-YYYY",
            render: (value) => dayjs(value).format("DD-MM-YYYY"),
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
            key: "nip",
            title: "NIP",
            searchable: true,
            filterable: true,
        },
        {
            key: "gupeg",
            title: "Nama",
            searchable: true,
            filterable: true,
        },
        {
            key: "lokasi",
            title: "lokasi",
            searchable: true,
            filterable: true,
        },
        {
            key: "jenis_perangkat",
            title: "Perangkat",
            searchable: true,
            filterable: true,
        },
        {
            key: "petugas",
            title: "Auditor",
            searchable: true,
            filterable: true,
        },
        {
            key: "hasil",
            title: "Hasil",
            searchable: true,
            filterable: true,
        },
        {
            key: "actions",
            title: "Actions",
            type: "actions",
            sortable: false,
            actions: [
                {
                    icon: Trash2,
                    title: "Delete",
                    onClick: (item) => handleDelete(item),
                },
            ],
        }

    ]
    const getAudits = async (params = {}, showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 800));
            const queryParams = new URLSearchParams({
                page: params.page || currentPage,
                per_page: params.per_page || itemsPerPage,
            });
            const searchValue =
                params.search !== undefined ? params.search : searchTerm;
            if (searchValue && searchValue.trim() !== "") {
                queryParams.append("search", searchValue);
            }
            if (params.filters) {
                Object.entries(params.filters).forEach(([key, value]) => {
                    if (value) {
                        queryParams.append(key, value);
                    }
                });
            }

            const [response] = await Promise.all([
                api.get(`/sp/hasil-audit-keamanan?${queryParams}`),
                minLoadingTime,
            ]);

            if (response && response.data && response.data.status === "success") {
                setData(response.data.data || []);
                setTotal(response.data.total || 0);
                setCurrentPage(response.data.page || 1);
                setItemsPerPage(response.data.per_page || 10);
                // console.log(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setData([]);
            setTotal(0);
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };
    const handleDelete = (item) => {
        setDeletingAudit(item);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingAudit) return;

        setDeleteLoading(true);
        try {
            await api.delete(`/sp/hasil-audit-keamanan/${deletingAudit.id}`); // Fix: gunakan id dari object
            // Refresh data after delete
            getAudits(); // Fix: nama function yang benar
            setShowDeleteModal(false);
            setDeletingAudit(null); // Fix: nama variable yang benar
        } catch (error) {
            console.error("Error deleting event:", error); // Fix: pesan error
        } finally {
            setDeleteLoading(false);
        }
    };
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingAudit(null);
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
            // Delete multiple users
            const deletePromises = bulkDeleteIds.map((id) =>
                api.delete(`/sp/hasil-audit-keamanan/${id}`)
            ); // 🔧 GANTI: endpoint delete
            await Promise.all(deletePromises);
            getAudits();
            setShowBulkDeleteModal(false);
            setBulkDeleteIds([]);
        } catch (error) {
            console.error("Error bulk deleting  :", error);
        } finally {
            setBulkDeleteLoading(false);
        }
    };
    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };
    const handleExport = () => {
        setShowExportModal(true);
    };
    const handleDataChange = (params) => {
        // Update state berdasarkan perubahan dari DataTable
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
        // Fetch data dengan params baru
        getAudits(params);
    };
    useEffect(() => {
        getAudits();
    }, []);
    return (
        <div>
            <DataTable
                // Data & Loading
                data={data}
                total={total}
                loading={loading}
                // Columns Configuration
                columns={columns}
                // Search & Filter
                searchable={true}
                filterable={true}
                sortable={true}
                // Selection & Actions
                selectable={true}
                onExport={handleExport}
                onBulkDelete={handleBulkDelete}
                // Pagination
                pagination={true}
                itemsPerPageOptions={[5, 10, 25, 50]}
                defaultItemsPerPage={10}
                // Title
                title="Data Audit Keamanan"
                subtitle="Kelola data audit keamanan perangkat"
                // Server-side Mode (PENTING!)
                serverSide={true}
                onDataChange={handleDataChange} // ⚡ INI YANG PENTING - menghubungkan search/filter dengan API
                // Controlled State (sync dengan parent)
                currentPage={currentPage}
                currentItemsPerPage={itemsPerPage}
                currentSearch={searchTerm}
                currentFilters={filters}
                currentSortField={sortField}
                currentSortDirection={sortDirection}
            />
            <DeleteModal
                show={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Hapus Audit"
                message={`Apakah Anda yakin ingin menghapus audit "${deletingAudit?.gupeg}"?`}
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
                title="Hapus Multiple Audit"
                message={`Apakah Anda yakin ingin menghapus ${bulkDeleteIds.length} audit?`}
                loading={bulkDeleteLoading}
                size="sm"
            />
            <ExportModal
                show={showExportModal}
                onClose={() => setShowExportModal(false)}
                data={data}
                columns={columns}
                filename="data-audit-keamanan"
                title="Export Data Audit Keamanan"
            />
        </div>
    )
}