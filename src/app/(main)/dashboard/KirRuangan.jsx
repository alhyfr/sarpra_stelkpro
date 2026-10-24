'use client'

import { useEffect, useState } from 'react'
import { DoorOpen, FileDown, Loader2 } from 'lucide-react'
import api from '@/app/utils/Api'
import { downloadKirPdf } from './pdf/kir'

export default function KirRuangan() {
  const [rooms, setRooms] = useState([])
  const [roomId, setRoomId] = useState('')
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/sp/kir-ruangan')
        const list = res.data?.status === 'success' ? res.data.data || [] : []
        setRooms(list)
        if (list[0]?.id) setRoomId(String(list[0].id))
      } catch (error) {
        console.error('Error loading KIR rooms:', error)
        setRooms([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!roomId) {
      setDetail(null)
      return
    }
    let active = true
    const loadDetail = async () => {
      setLoadingDetail(true)
      try {
        const res = await api.get(`/sp/kir-ruangan/${roomId}`)
        if (!active) return
        setDetail(res.data?.status === 'success' ? res.data.data : null)
      } catch (error) {
        console.error('Error loading KIR detail:', error)
        if (active) setDetail(null)
      } finally {
        if (active) setLoadingDetail(false)
      }
    }
    loadDetail()
    return () => {
      active = false
    }
  }, [roomId])

  const handlePrint = async () => {
    if (!detail?.ruangan) return
    setPrinting(true)
    try {
      await downloadKirPdf(detail)
    } catch (error) {
      console.error('Error creating KIR pdf:', error)
    } finally {
      setPrinting(false)
    }
  }

  const items = detail?.items || []
  const preview = items.slice(0, 5)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 h-full">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Kartu Inventaris Ruangan
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ruangan yang sudah terhubung dengan data inventaris
          </p>
        </div>
        <span className="inline-flex p-2 rounded-lg bg-red-50 text-[#B91C1C]">
          <DoorOpen className="w-4 h-4" />
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Memuat ruangan...</p>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-gray-500">
          Belum ada ruangan yang namanya sama dengan ruangan pada inventaris.
        </p>
      ) : (
        <>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Filter ruangan
          </label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full mb-4 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.gedung} — {room.ruangan} ({room.jumlah_barang})
              </option>
            ))}
          </select>

          {loadingDetail || !detail ? (
            <p className="text-sm text-gray-500">Memuat barang ruangan...</p>
          ) : (
            <>
              <div className="mb-3 text-sm text-gray-700 dark:text-gray-200">
                <div className="font-medium">{detail.ruangan.ruangan}</div>
                <div className="text-xs text-gray-500">
                  {detail.ruangan.gedung} · {items.length} barang
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                {preview.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-2 text-xs border-b border-gray-100 dark:border-gray-700 pb-2"
                  >
                    <span className="text-gray-800 dark:text-gray-100">
                      {item.desc || item.kode}
                    </span>
                    <span className="shrink-0 text-gray-500">{item.kode}</span>
                  </li>
                ))}
              </ul>
              {items.length > preview.length && (
                <p className="text-[11px] text-gray-500 mb-4">
                  +{items.length - preview.length} barang lainnya ada di PDF
                </p>
              )}
              <button
                type="button"
                onClick={handlePrint}
                disabled={printing || items.length === 0}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#B91C1C] text-white hover:bg-[#991B1B] disabled:opacity-60"
              >
                {printing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                Cetak PDF
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
