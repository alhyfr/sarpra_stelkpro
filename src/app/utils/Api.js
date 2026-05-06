import axios from "axios";

const Api = axios.create({
  // Base URL dari environment variable
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',

  // Timeout untuk request (30 detik)
  timeout: process.env.NEXT_PUBLIC_API_TIMEOUT || 30000,

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
    // Log error di development mode
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.error('Response Error:', error.response?.status, error.message);
    }

    // Jika 401 (Unauthorized) → redirect ke login
    // Cookie akan dihapus oleh backend saat logout, tidak perlu clear manual di sini
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Jika 403 (Forbidden)
    if (error.response?.status === 403) {
      console.error('Access Denied');
    }

    // Jika 500 (Server Error)
    if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default Api;
