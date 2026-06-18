'use client'

import { useState, useEffect } from 'react'
import DataTable from '@/components/DataTable'
import api from '@/app/utils/Api'
import dayjs from 'dayjs'
import Aswitch from '@/components/Aswitch'

export default function DataAc() {
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortField, setSortField] = useState('')
    const [sortDirection, setSortDirection] = useState('asc')
    const [filters, setFilters] = useState({})
    const [updatingStatusId, setUpdatingStatusId] = useState(null)

    const handleStatusChange = async (item, newStatus) => {
        setUpdatingStatusId(item.id)
        try {
            await api.put(`/sp/perawatan-ac-status/${item.id}`, {
                status: newStatus,
            })
            getPerawatanAc()
        } catch (error) {
            console.error('Error updating status perawatan AC:', error)
            alert(
                error.response?.data?.message ||
                error.message ||
                'Gagal memperbarui status perawatan AC'
            )
        } finally {
            setUpdatingStatusId(null)
        }
    }

    const columns = [
        {
            key: 'kode',
            title: 'Kode',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'inventaris_desc',
            title: 'Nama Barang',
            sortable: true,
            searchable: true,
            filterable: true,
            wrap: true,
            minWidth: '180px',
        },
        {
            key: 'merk',
            title: 'Merk',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'gedung',
            title: 'Gedung',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'ruang',
            title: 'Ruang',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'jenis_perawatan',
            title: 'Jenis Perawatan',
            sortable: true,
            searchable: true,
            filterable: true,
            wrap: true,
            minWidth: '160px',
        },
        {
            key: 'keluhan_awal',
            title: 'Keluhan Awal',
            sortable: true,
            searchable: true,
            wrap: true,
            minWidth: '180px',
        },
        {
            key: 'tindakan',
            title: 'Tindakan',
            sortable: true,
            searchable: true,
            wrap: true,
            minWidth: '180px',
        },
        {
            key: 'penggantian_sparepart',
            title: 'Sparepart',
            sortable: true,
            searchable: true,
            wrap: true,
            minWidth: '140px',
        },
        {
            key: 'tanggal_perawatan',
            title: 'Tanggal Perawatan',
            sortable: true,
            searchable: true,
            filterable: true,
            render: (value) => value ? dayjs(value).format('DD-MM-YYYY') : '-',
        },
        {
            key: 'teknisi',
            title: 'Teknisi',
            sortable: true,
            searchable: true,
            filterable: true,
        },
        {
            key: 'catatan',
            title: 'Catatan',
            sortable: true,
            searchable: true,
            wrap: true,
            minWidth: '160px',
        },
        {
            key: 'status',
            title: 'Status',
            sortable: true,
            searchable: true,
            filterable: true,
            filterOptions: [
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
            ],
            render: (value, item) => (
                <Aswitch
                    key={`${item.id}-${value || 'pending'}`}
                    value={value || 'pending'}
                    onChange={(newStatus) => handleStatusChange(item, newStatus)}
                    size="sm"
                    onValue="completed"
                    offValue="pending"
                    disabled={updatingStatusId === item.id}
                    showIcons={true}
                    labels={{
                        on: 'Completed',
                        off: 'Pending',
                    }}
                />
            ),
        },
    ]

    const getPerawatanAc = async (params = {}, showLoading = true) => {
        try {
            if (showLoading) setLoading(true)

            const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 800))
            const queryParams = new URLSearchParams({
                page: params.page || currentPage,
                per_page: params.per_page || itemsPerPage,
            })

            const searchValue = params.search !== undefined ? params.search : searchTerm
            if (searchValue && searchValue.trim() !== '') {
                queryParams.append('search', searchValue)
            }

            if (params.filters) {
                Object.entries(params.filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value)
                })
            }

            const [response] = await Promise.all([
                api.get(`/sp/perawatan-ac?${queryParams}`),
                minLoadingTime,
            ])

            if (response.data?.message === 'success') {
                const result = response.data.data

                if (Array.isArray(result)) {
                    setData(result)
                    setTotal(response.data.pagination?.total || response.data.total || result.length)
                    setCurrentPage(response.data.pagination?.current_page || response.data.page || 1)
                    setItemsPerPage(response.data.pagination?.per_page || response.data.per_page || 10)
                } else if (result?.data) {
                    setData(result.data)
                    setTotal(result.pagination?.total || response.data.total || result.data.length)
                    setCurrentPage(result.pagination?.current_page || response.data.page || 1)
                    setItemsPerPage(result.pagination?.per_page || response.data.per_page || 10)
                } else {
                    setData([])
                    setTotal(0)
                }
            }
        } catch (error) {
            console.error('Error fetching perawatan AC:', error)
            setData([])
            setTotal(0)
        } finally {
            if (showLoading) setLoading(false)
        }
    }

    const handleDataChange = (params) => {
        if (params.page !== undefined) setCurrentPage(params.page)
        if (params.per_page !== undefined) setItemsPerPage(params.per_page)
        if (params.search !== undefined) setSearchTerm(params.search)
        if (params.filters !== undefined) setFilters(params.filters)
        if (params.sortField !== undefined) setSortField(params.sortField)
        if (params.sortDirection !== undefined) setSortDirection(params.sortDirection)

        getPerawatanAc(params)
    }

    useEffect(() => {
        getPerawatanAc()
    }, [])

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
                selectable={false}
                onExport={null}
                pagination={true}
                itemsPerPageOptions={[5, 10, 25, 50]}
                defaultItemsPerPage={10}
                title="Data Perawatan AC"
                subtitle="Kelola status perawatan AC"
                serverSide={true}
                onDataChange={handleDataChange}
                currentPage={currentPage}
                currentItemsPerPage={itemsPerPage}
                currentSearch={searchTerm}
                currentFilters={filters}
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                hideAddButton={true}
            />
        </div>
    )
}
