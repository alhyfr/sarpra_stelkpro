'use client'

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Api from "@/app/utils/Api"

// ============================================
// 1. CREATE CONTEXT
// ============================================
const AuthContext = createContext()

// ============================================
// 2. AUTH PROVIDER COMPONENT
// ============================================
export function AuthProvider({ children }) {
  const router = useRouter()

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [redirectType, setRedirectType] = useState(null)

  // ============================================
  // 3. CEK AUTHENTICATION SAAT APP LOAD
  // ============================================
  useEffect(() => {
    checkAuth()
  }, [])

  // ============================================
  // 4. FUNCTION: CEK AUTH
  // ============================================
  // Cek apakah user sudah login dengan memanggil /current-user.
  // HttpOnly cookie dikirim otomatis oleh browser (withCredentials: true).
  // Tidak perlu membaca localStorage atau document.cookie.
  const checkAuth = async () => {
    try {
      setIsLoading(true)

      const response = await Api.get('/current-user')

      setUser(response.data.data)
      setIsAuthenticated(true)

    } catch (error) {
      if (error.response?.status === 401) {
        // 401 = memang belum login / token expired → reset auth
        setUser(null)
        setIsAuthenticated(false)
      } else {
        // Network error, 5xx, CORS, dll.
        // Jangan reset isAuthenticated agar tidak trigger redirect loop.
        // Biarkan user tetap di halaman yang sekarang.
        // isAuthenticated tetap false (initial state) dan isLoading selesai,
        // sehingga ProtectedRoute akan tetap redirect ke login jika memang belum login.
        setUser(null)
        setIsAuthenticated(false)
        if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
          console.error('checkAuth: non-401 error', error.message)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // 5. FUNCTION: LOGIN
  // ============================================
  // Kirim kredensial ke backend. Backend akan set HttpOnly cookie secara otomatis.
  // Frontend tidak perlu menyimpan token di localStorage maupun document.cookie.
  const login = async (email, password, redirectUrl = '/dashboard') => {
    try {
      setIsLoading(true)

      const response = await Api.post('/login', { email, password })

      // Backend mengembalikan data user (token tidak perlu diambil)
      let userData

      if (response.data.data?.user) {
        userData = response.data.data.user
      } else if (response.data.data) {
        userData = response.data.data
      } else {
        userData = response.data.user || response.data
      }

      // Update state
      setUser(userData)
      setIsAuthenticated(true)

      // Set redirecting state untuk tampilkan loading
      setIsRedirecting(true)
      setRedirectType('login')

      setTimeout(() => {
        setTimeout(() => {
          setIsRedirecting(false)
          setRedirectType(null)
        }, 100)

        router.replace(redirectUrl)

        setTimeout(() => {
          if (window.location.pathname !== redirectUrl) {
            window.location.href = redirectUrl
          }
        }, 500)
      }, 800)

      return { success: true, data: userData }

    } catch (error) {
      setIsRedirecting(false)
      setRedirectType(null)

      let errorMessage = 'Login gagal. Silakan coba lagi.'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      return { success: false, error: errorMessage }

    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // 6. FUNCTION: LOGOUT
  // ============================================
  // Panggil endpoint logout di backend agar backend menghapus HttpOnly cookie.
  // Frontend tidak perlu menghapus apapun secara manual.
  const logout = async () => {
    try {
      setIsRedirecting(true)
      setRedirectType('logout')

      await Api.post('/logout')

      await new Promise(resolve => setTimeout(resolve, 800))

    } catch (error) {
      // Tetap lanjutkan logout meski API gagal
    } finally {
      // Reset state
      setUser(null)
      setIsAuthenticated(false)

      setTimeout(() => {
        setIsRedirecting(false)
        setRedirectType(null)
      }, 100)

      router.push('/login')
    }
  }

  // ============================================
  // 7. FUNCTION: UPDATE USER DATA
  // ============================================
  const updateUser = (newUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newUserData
    }))
  }

  // ============================================
  // 8. FUNCTION: REFRESH USER DATA
  // ============================================
  const refreshUser = async () => {
    try {
      const response = await Api.get('/current-user')
      setUser(response.data.data)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ============================================
  // 9. CONTEXT VALUE
  // ============================================
  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    isRedirecting,
    redirectType,

    // Functions
    login,
    logout,
    checkAuth,
    updateUser,
    refreshUser,
  }

  // ============================================
  // 10. RETURN PROVIDER
  // ============================================
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================
// 11. CUSTOM HOOK: useAuth
// ============================================
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

// Export default untuk backward compatibility
export default AuthContext
