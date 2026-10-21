'use client'

import { useCallback, useRef } from 'react'
import api from '@/app/utils/Api'

const DEDUPE_MS = 400

/**
 * Fetch list server-side dengan abort dan cegah request dobel yang hampir bersamaan.
 * Hasil tidak di-cache lama: setelah create/update/delete, refetch query yang sama
 * harus mengambil data baru, bukan daftar sebelum perubahan.
 */
export default function useServerListFetch() {
  const fetchIdRef = useRef(0)
  const abortControllerRef = useRef(null)
  const lastQueryKeyRef = useRef('')
  const lastQueryAtRef = useRef(0)
  const inFlightKeyRef = useRef(null)

  const clearListCache = useCallback(() => {
    lastQueryKeyRef.current = ''
    lastQueryAtRef.current = 0
  }, [])

  const fetchList = useCallback(
    async ({
      endpoint,
      page = 1,
      per_page = 10,
      search = '',
      filters = {},
      showLoading = true,
      setLoading,
      onSuccess,
      onError,
      extraParams = {},
      force = false,
    }) => {
      const queryParams = new URLSearchParams({
        page: String(page),
        per_page: String(per_page),
      })

      const searchValue = typeof search === 'string' ? search.trim() : ''
      if (searchValue) {
        queryParams.append('search', searchValue)
      }

      if (filters && typeof filters === 'object') {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value)
          }
        })
      }

      Object.entries(extraParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value)
        }
      })

      const queryKey = `${endpoint}?${queryParams.toString()}`

      // Query yang sama sedang di-fetch — jangan dobel; loading dikelola request aktif
      if (!force && inFlightKeyRef.current === queryKey) {
        return null
      }

      // Hanya cegah double-fire DataTable dalam jendela singkat.
      // Jangan menahan refetch setelah CRUD pada query yang sama.
      if (
        !force &&
        queryKey === lastQueryKeyRef.current &&
        Date.now() - lastQueryAtRef.current < DEDUPE_MS
      ) {
        if (setLoading) setLoading(false)
        return null
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      const controller = new AbortController()
      abortControllerRef.current = controller
      const fetchId = ++fetchIdRef.current
      lastQueryKeyRef.current = queryKey
      inFlightKeyRef.current = queryKey

      try {
        if (showLoading && setLoading) setLoading(true)

        const response = await api.get(queryKey, { signal: controller.signal })
        if (fetchId !== fetchIdRef.current) return null

        const body = response.data || {}
        const ok =
          body.status === 'success' ||
          body.message === 'success' ||
          Array.isArray(body.data)

        if (ok) {
          const pagination = body.pagination || {}
          const payload = {
            data: body.data || [],
            total:
              body.total ??
              pagination.total ??
              (Array.isArray(body.data) ? body.data.length : 0),
            page: body.page ?? pagination.current_page ?? page,
            per_page: body.per_page ?? pagination.per_page ?? per_page,
            raw: body,
            ts: Date.now(),
          }

          lastQueryKeyRef.current = queryKey
          lastQueryAtRef.current = Date.now()
          onSuccess?.(payload)
          return payload
        }

        onError?.(new Error(body.message || 'Gagal memuat data'))
        return null
      } catch (error) {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
          return null
        }
        if (fetchId === fetchIdRef.current) {
          lastQueryKeyRef.current = ''
          onError?.(error)
        }
        return null
      } finally {
        if (fetchId === fetchIdRef.current) {
          inFlightKeyRef.current = null
          // Selalu matikan loading untuk request terbaru (hindari spinner macet)
          if (setLoading) setLoading(false)
        }
      }
    },
    []
  )

  return { fetchList, clearListCache }
}
