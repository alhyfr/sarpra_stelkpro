'use client'

import { useCallback, useRef } from 'react'
import api from '@/app/utils/Api'

const DEFAULT_TTL_MS = 60_000
const DEFAULT_CACHE_MAX = 30

/**
 * Fetch list server-side dengan abort, skip request identik, dan cache singkat.
 * Dipakai semua DataTable serverSide agar search berulang tidak lambat.
 */
export default function useServerListFetch({
  ttlMs = DEFAULT_TTL_MS,
  cacheMax = DEFAULT_CACHE_MAX,
} = {}) {
  const fetchIdRef = useRef(0)
  const abortControllerRef = useRef(null)
  const lastQueryKeyRef = useRef('')
  const inFlightKeyRef = useRef(null)
  const cacheRef = useRef(new Map())

  const clearListCache = useCallback(() => {
    cacheRef.current.clear()
    lastQueryKeyRef.current = ''
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

      // Skip request identik yang baru saja selesai (anti double-fire DataTable)
      // Pastikan loading dimatikan agar tidak nyangkut
      if (!force && queryKey === lastQueryKeyRef.current && showLoading) {
        if (setLoading) setLoading(false)
        return null
      }

      const cached = cacheRef.current.get(queryKey)
      if (!force && cached && Date.now() - cached.ts < ttlMs) {
        lastQueryKeyRef.current = queryKey
        onSuccess?.(cached)
        if (setLoading) setLoading(false)
        return cached
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

          cacheRef.current.set(queryKey, payload)
          if (cacheRef.current.size > cacheMax) {
            const oldestKey = cacheRef.current.keys().next().value
            cacheRef.current.delete(oldestKey)
          }

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
    [ttlMs, cacheMax]
  )

  return { fetchList, clearListCache }
}
