'use client'

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Api from "@/app/utils/Api"

// ============================================
// 1. CREATE CONTEXT
// ============================================
// Membuat context untuk auth yang bisa diakses di seluruh aplikasi
const AuthContext = createContext()

// ============================================
// 2. AUTH PROVIDER COMPONENT
// ============================================
// Provider yang membungkus aplikasi dan menyediakan auth state & functions
export function AuthProvider({ children }) {
  // Router untuk navigation
  const router = useRouter()
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [user, setUser] = useState(null)                    // Data user yang login
  const [token, setToken] = useState(null)                  // Auth token
  const [isAuthenticated, setIsAuthenticated] = useState(false)  // Status login
  const [isLoading, setIsLoading] = useState(true)          // Loading state saat cek auth
  const [isRedirecting, setIsRedirecting] = useState(false) // Loading state saat redirect
  const [redirectType, setRedirectType] = useState(null)    // Type: 'login' atau 'logout'

  // ============================================
  // 3. CEK AUTHENTICATION SAAT APP LOAD
  // ============================================
  // Dipanggil sekali saat app pertama kali load
  useEffect(() => {
    checkAuth()
  }, [])

  // ============================================
  // 4. FUNCTION: CEK AUTH
  // ============================================
  // Cek apakah user sudah login dengan memeriksa token di localStorage
  const checkAuth = async () => {
    try {
      setIsLoading(true)
      
      const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || 'stelk_auth_token'
      
      // Ambil token dari localStorage atau cookie
      let savedToken = localStorage.getItem(tokenKey)
      
      // Jika tidak di localStorage, coba dari cookie
      if (!savedToken) {
        const cookieMatch = document.cookie.match(new RegExp('(^| )' + tokenKey + '=([^;]+)'))
        savedToken = cookieMatch ? cookieMatch[2] : null
      }
      
      // Jika tidak ada token, user belum login
      if (!savedToken) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      // Set token ke state dan axios header
      setToken(savedToken)
      Api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`

      // Ambil data user dari API
      const response = await Api.get('/current-user')
      
      // Set user data dan status authenticated
      setUser(response.data.data)
      setIsAuthenticated(true)
      
    } catch (error) {
      console.error('Auth check failed:', error)
      
      // Jika gagal (token expired/invalid), logout
      logout()
      
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // 5. FUNCTION: LOGIN
  // ============================================
  // Login user dengan email dan password
  const login = async (email, password, redirectUrl = '/dashboard') => {
    try {
      setIsLoading(true)
      
      // Log untuk debugging
    //   if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    //     console.log('Attempting login...', { email, redirectUrl })
    //   }
      
      // Panggil API login
      const response = await Api.post('/login', {
        email,
        password
      })

      // Log response untuk debugging
    //   if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    //     console.log('Login response:', response.data)
    //   }

      // Flexible response handling - support berbagai struktur response
      let authToken, userData
      
      // Cek berbagai struktur response yang mungkin
      if (response.data.data) {
        // Structure: { data: { token, user } }
        authToken = response.data.data.token || response.data.data.access_token
        userData = response.data.data.user || response.data.data
      } else if (response.data.token) {
        // Structure: { token, user }
        authToken = response.data.token || response.data.access_token
        userData = response.data.user || response.data
      } else {
        // Structure lainnya
        authToken = response.data.access_token
        userData = response.data
      }

      // Validasi token
      if (!authToken) {
        throw new Error('Token tidak ditemukan dalam response')
      }

      // Simpan token ke localStorage DAN cookie
      const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || 'stelk_auth_token'
      
      // Save to localStorage
      localStorage.setItem(tokenKey, authToken)
      
      // Save to cookie (untuk middleware)
      document.cookie = `${tokenKey}=${authToken}; path=/; max-age=${60 * 60 * 24 * 1}; SameSite=Lax`
      // max-age = 1 days

      // Set token ke axios header untuk request selanjutnya
      Api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`

      // Update state
      setToken(authToken)
      setUser(userData)
      setIsAuthenticated(true)

      // Log success
      if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
        console.log('Login successful, redirecting to:', redirectUrl)
        console.log('Auth state:', { 
          token: !!authToken, 
          user: !!userData, 
          isAuthenticated: true 
        })
      }

      // Set redirecting state untuk show loading
      setIsRedirecting(true)
      setRedirectType('login')
      
      // PENTING: Gunakan router.replace untuk avoid back button issues
      // Dan tambahkan delay untuk ensure state propagation
      setTimeout(() => {
        console.log('🚀 Executing redirect to:', redirectUrl)
        
        // Reset state dulu sebelum redirect
        setTimeout(() => {
          setIsRedirecting(false)
          setRedirectType(null)
        }, 100)
        
        router.replace(redirectUrl)
        
        // Force reload jika redirect tidak berjalan setelah 500ms
        setTimeout(() => {
          if (window.location.pathname !== redirectUrl) {
            console.log('⚠️ Redirect failed, forcing navigation')
            window.location.href = redirectUrl
          }
        }, 500)
      }, 800) // 800ms untuk show loading

      return { success: true, data: userData }
      
    } catch (error) {
      console.error('Login failed:', error)
      
      // Reset redirecting state on error
      setIsRedirecting(false)
      setRedirectType(null)
      
      // Extract error message dari berbagai format
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
  // Logout user dan clear semua data
  const logout = async () => {
    try {
      // Set redirecting state untuk show loading
      setIsRedirecting(true)
      setRedirectType('logout')
      
      // Log untuk debugging
    //   if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    //     console.log('Logging out...')
    //   }
      
      // Optional: Panggil API logout jika ada
      // await Api.post('/auth/logout')
      
      // Delay untuk show loading
      await new Promise(resolve => setTimeout(resolve, 800))
      
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear token dari localStorage DAN cookie
      const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || 'stelk_auth_token'
      
      localStorage.removeItem(tokenKey)
      
      // Clear cookie
      document.cookie = `${tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      
      // Clear token dari axios header
      delete Api.defaults.headers.common['Authorization']
      
      // Reset state
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      
      // Reset redirecting sebelum redirect
      setTimeout(() => {
        setIsRedirecting(false)
        setRedirectType(null)
      }, 100)
      
      // Log success
    //   if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    //     console.log('Logout successful, redirecting to login')
    //   }
      
      // Redirect ke login
      router.push('/login')
    }
  }

  // ============================================
  // 7. FUNCTION: UPDATE USER DATA
  // ============================================
  // Update user data setelah edit profile
  const updateUser = (newUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newUserData
    }))
  }

  // ============================================
  // 8. FUNCTION: REFRESH USER DATA
  // ============================================
  // Ambil ulang data user terbaru dari API
  const refreshUser = async () => {
    try {
      const response = await Api.get('/current-user')
      setUser(response.data.data)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Refresh user failed:', error)
      return { success: false, error: error.message }
    }
  }

  // ============================================
  // 9. CONTEXT VALUE
  // ============================================
  // Semua state dan functions yang bisa diakses oleh components
  const value = {
    // State
    user,              // Data user yang login
    token,             // Auth token
    isAuthenticated,   // Status apakah user sudah login
    isLoading,         // Loading state
    isRedirecting,     // Loading state saat redirect/logout
    redirectType,      // Type redirect: 'login' atau 'logout'
    
    // Functions
    login,             // Function untuk login
    logout,            // Function untuk logout
    checkAuth,         // Function untuk cek auth
    updateUser,        // Function untuk update user data
    refreshUser,       // Function untuk refresh user data dari API
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
// Hook untuk akses auth context dengan mudah
// Usage: const { user, login, logout } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  
  // Jika dipanggil di luar AuthProvider, throw error
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}

// Export default untuk backward compatibility
export default AuthContext
