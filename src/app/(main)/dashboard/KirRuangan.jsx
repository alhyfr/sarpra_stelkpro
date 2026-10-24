'use client'

import { useEffect, useState } from 'react'
import { DoorOpen, FileDown, Loader2 } from 'lucide-react'
import api from '@/app/utils/Api'
import Modal from '@/components/Modal'
import { downloadKirPdf } from './pdf/kir'

const EMPTY_SIGNERS = {
  kepalaNama: '',
  kepalaNip: '',
  pjNama: '',
  pjNip: '',
  wakasekNama: '',
  wakasekNip: '',
}

const SIGNER_FIELDS = [
  { label: 'Kepala Sekolah', role: 'kepala', namaKey: 'kepalaNama', nipKey: 'kepalaNip' },
  { label: 'Penanggung Jawab Ruangan', role: 'pj', namaKey: 'pjNama', nipKey: 'pjNip' },
  { label: 'Wakasek IT, LAB dan Sarpra', role: 'wakasek', namaKey: 'wakasekNama', nipKey: 'wakasekNip' },
]

const SIGNER_CACHE_KEY = 'kir-signer-cache'
const EMPTY_HISTORY = { kepala: [], pj: [], wakasek: [] }

function readSignerCache() {
  try {
    const data = JSON.parse(localStorage.getItem(SIGNER_CACHE_KEY) || '{}')
    return {
      last: { ...EMPTY_SIGNERS, ...(data.last || {}) },
      history: {
        kepala: Array.isArray(data.kepala) ? data.kepala : [],
        pj: Array.isArray(data.pj) ? data.pj : [],
        wakasek: Array.isArray(data.wakasek) ? data.wakasek : [],
      },
    }
  } catch {
    return { last: EMPTY_SIGNERS, history: EMPTY_HISTORY }
  }
}

function rememberSigner(list, person) {
  const nama = String(person.nama || '').trim()
  const nip = String(person.nip || '').trim()
  if (!nama && !nip) return list
  const next = [{ nama, nip }, ...list.filter((item) => item.nama !== nama || item.nip !== nip)]
  return next.slice(0, 8)
}

function saveSignerCache(signers) {
  const current = readSignerCache()
  const history = {
    kepala: rememberSigner(current.history.kepala, { nama: signers.kepalaNama, nip: signers.kepalaNip }),
    pj: rememberSigner(current.history.pj, { nama: signers.pjNama, nip: signers.pjNip }),
    wakasek: rememberSigner(current.history.wakasek, { nama: signers.wakasekNama, nip: signers.wakasekNip }),
  }
  localStorage.setItem(SIGNER_CACHE_KEY, JSON.stringify({ last: signers, ...history }))
  return history
}

export default function KirRuangan() {
  const [rooms, setRooms] = useState([])
  const [roomId, setRoomId] = useState('')
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [signOpen, setSignOpen] = useState(false)
  const [signers, setSigners] = useState(EMPTY_SIGNERS)
  const [history, setHistory] = useState(EMPTY_HISTORY)

  useEffect(() => {
    const cache = readSignerCache()
    setSigners(cache.last)
    setHistory(cache.history)
  }, [])

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

  const setSigner = (key) => (event) => {
    setSigners((current) => ({ ...current, [key]: event.target.value }))
  }

  const handlePrint = async () => {
    if (!detail?.ruangan) return
    setPrinting(true)
    try {
      setHistory(saveSignerCache(signers))
      await downloadKirPdf({
        ...detail,
        signers: {
          kepala: { nama: signers.kepalaNama, nip: signers.kepalaNip },
          pj: { nama: signers.pjNama, nip: signers.pjNip },
          wakasek: { nama: signers.wakasekNama, nip: signers.wakasekNip },
        },
      })
      setSignOpen(false)
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
                onClick={() => setSignOpen(true)}
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

      <Modal
        isOpen={signOpen}
        onClose={() => { if (!printing) setSignOpen(false) }}
        title="Data penanda tangan"
        size="lg"
        closeOnOverlayClick={!printing}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Isi nama dan NIP bila ingin dicetak. Data yang pernah dipakai tersimpan di browser ini dan bisa dipilih lagi. Kolom yang dikosongkan tidak ikut tercetak.
        </p>
        <div className="space-y-4">
          {SIGNER_FIELDS.map(({ label, role, namaKey, nipKey }) => (
            <div key={role}>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">{label}</div>
              {history[role].length > 0 && (
                <select
                  defaultValue=""
                  onChange={(event) => {
                    const picked = history[role][Number(event.target.value)]
                    event.target.value = ''
                    if (!picked) return
                    setSigners((current) => ({
                      ...current,
                      [namaKey]: picked.nama,
                      [nipKey]: picked.nip,
                    }))
                  }}
                  className="mb-2 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                >
                  <option value="">Pilih dari riwayat</option>
                  {history[role].map((item, index) => (
                    <option key={`${item.nama}-${item.nip}-${index}`} value={index}>
                      {[item.nama, item.nip].filter(Boolean).join(' — ')}
                    </option>
                  ))}
                </select>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-xs text-gray-600 dark:text-gray-300">
                  Nama
                  <input
                    value={signers[namaKey]}
                    onChange={setSigner(namaKey)}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  />
                </label>
                <label className="block text-xs text-gray-600 dark:text-gray-300">
                  NIP
                  <input
                    value={signers[nipKey]}
                    onChange={setSigner(nipKey)}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setSignOpen(false)}
            disabled={printing}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={printing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#B91C1C] text-white hover:bg-[#991B1B] disabled:opacity-60"
          >
            {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Cetak PDF
          </button>
        </div>
      </Modal>
    </div>
  )
}
