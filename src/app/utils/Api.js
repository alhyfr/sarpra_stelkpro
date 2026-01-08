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

  // Kirim cookies dengan request (untuk CORS)
  // withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
// Dijalankan sebelum request dikirim
Api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem(
      process.env.NEXT_PUBLIC_TOKEN_KEY || 'stelk_auth_token'
    );

    // Jika ada token, tambahkan ke header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }



    return config;
  },
  (error) => {
    // Handle error sebelum request dikirim
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
// Dijalankan setelah response diterima
Api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error response

    // Log error di development mode
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.error('Response Error:', error.response?.status, error.message);
    }

    // Jika 401 (Unauthorized), redirect ke login
    if (error.response?.status === 401) {
      // Clear token
      localStorage.removeItem(
        process.env.NEXT_PUBLIC_TOKEN_KEY || 'stelk_auth_token'
      );

      // Clear cookie juga agar konsisten
      const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || 'stelk_auth_token';
      document.cookie = `${tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      // Redirect ke login (jika tidak sedang di halaman login)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Jika 403 (Forbidden), bisa redirect ke halaman access denied
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
