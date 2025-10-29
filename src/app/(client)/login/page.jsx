'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import AInput from '@/components/AInput';
import Logo from '@/assets/logo.png';
import Logori from '@/assets/logo_ori.png';
import Image from 'next/image';
import { Suspense } from 'react';

function LoginContent() {
  const { login, isLoading: authLoading, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const redirectUrl = searchParams.get('redirect') || '/dashboard';
    const result = await login(formData.email, formData.password, redirectUrl);
    if (!result.success) {
      setErrors({ general: result.error || 'Login gagal. Silakan coba lagi.' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors.general) {
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image src={Logori} alt="Logo" width={100} height={100} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Selamat Datang Kembali
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Silakan login untuk melanjutkan ke dashboard
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <AInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
              error={errors.email}
            />
            <AInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
              error={errors.password}
            />
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{errors.general}</span>
              </div>
            )}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#B91C1C] focus:ring-[#B91C1C] border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                Ingat saya
              </label>
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-[#B91C1C] hover:bg-[#991B1B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B91C1C] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base"
            >
              {authLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </div>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
          </div>
        </div>
      </div>
      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#B91C1C] via-[#991B1B] to-[#7F1D1D] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
        <div className="relative z-10 text-white max-w-md">
          <div className="mb-8">
            <Image src={Logo} alt="Logo" width={100} height={100} />
            <h1 className="text-4xl font-bold mb-4">
              Stelk<br />Property
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              sistem pengelolaan sarana dan prasarana SMK Telkom Makassar
            </p>
          </div>
          <div className="space-y-4 mt-12">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/90">Manajemen Inventaris</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/90">Laporan Real-time</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/90">Informasi Terkait Sarana dan Prasarana</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B91C1C] mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat halaman login...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}