import axios from "axios";
import { armForbiddenUi } from "./forbiddenUi";

// NEXT_PUBLIC_* di-bake saat Next start/build.
// Minimal 120 detik agar upload inventaris (gambar+bukti) tidak timeout.
const parsedTimeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT, 10)
const API_TIMEOUT = Number.isFinite(parsedTimeout) && parsedTimeout > 0
  ? Math.max(parsedTimeout, 120000)
  : 120000

const Api = axios.create({
  // Base URL dari environment variable
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',

  timeout: API_TIMEOUT,

  // Default headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Kirim HttpOnly cookie secara otomatis di setiap request (CORS credentials)
  withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
Api.interceptors.request.use(
  (config) => {
    // Token kini dikelola via HttpOnly cookie oleh browser secara otomatis.
    // Tidak perlu menyuntikkan Authorization header dari localStorage.
    // Upload inventaris: pastikan timeout panjang per-request juga
    if (config.data instanceof FormData) {
      config.timeout = Math.max(config.timeout || 0, API_TIMEOUT)
      if (config.headers) {
        delete config.headers['Content-Type']
        delete config.headers['content-type']
      }
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
Api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Request dibatalkan (abort / race search) — bukan error nyata
    if (
      axios.isCancel?.(error) ||
      error?.code === 'ERR_CANCELED' ||
      error?.name === 'CanceledError' ||
      error?.name === 'AbortError'
    ) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const onLoginPage =
      typeof window !== 'undefined' &&
      window.location.pathname.includes('/login');

    // 401 = belum login / session habis — expected, jangan console.error
    // (Next.js overlay terpicu oleh console.error)
    if (status === 401) {
      if (typeof window !== 'undefined' && !onLoginPage) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Log error lain di development mode (skip 401)
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.error('Response Error:', status, error.message);
    }

    // 403 = hak akses tidak cukup (RBAC) — dialog via ApiForbiddenListener
    // armForbiddenUi mencegah catch form memanggil alert() browser
    if (status === 403 && typeof window !== 'undefined') {
      const body = error.response?.data || {};
      const message =
        body.message ||
        'Anda tidak memiliki hak untuk melakukan tindakan ini.';
      const detail = {
        title:
          body.code === 'FORBIDDEN_LEVEL'
            ? 'Hak Akses Tidak Cukup'
            : 'Akses Ditolak',
        message,
        code: body.code,
      };
      error.sipForbiddenHandled = true;
      armForbiddenUi(detail);
      window.dispatchEvent(new CustomEvent('sip:forbidden', { detail }));
    }

    // Jika 500 (Server Error)
    if (status === 500) {
      console.error('Server Error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default Api;
