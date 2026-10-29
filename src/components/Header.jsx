'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';
import api from '@/app/utils/Api';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import "dayjs/locale/id";
import { getStorageUrl } from '@/helper/storageUrl';

dayjs.extend(relativeTime);
dayjs.locale('id');
export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifikasi, setNotifikasi] = useState([]);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const toNotifikasi = useRouter();
  const handleNotifikasi = () => {
    toNotifikasi.push('/users/notifikasi');
    setShowNotifications(false);
  }

  const getNotifikasi = async () => {
    try {
      const response = await api.get('/sp/notifikasi');
      setNotifikasi(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifikasi([]);
    }
  }
  useEffect(() => {
    getNotifikasi();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const router = useRouter();
  const handleAkun = () => {
    router.push('/profile/akun');
    setShowProfile(false);
  }

  const userInitials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  const avatarUrl = user?.foto ? getStorageUrl(user.foto) : null;

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Menu Button - Visible on all screens */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
            title="Toggle Sidebar"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Brand hint on tablet when sidebar closed */}
          <div className="lg:hidden min-w-0">
            <p className="text-sm font-semibold text-red-800 dark:text-white truncate">Stelk Property</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {Array.isArray(notifikasi) && notifikasi.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                    {Array.isArray(notifikasi) ? notifikasi.length : 0}
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {Array.isArray(notifikasi) && notifikasi.length > 0 ? (
                    notifikasi.map((notif, index) => {
                      const isCoe = notif.source === 'coe' || notif.username === 'COE';
                      return (
                      <div
                        key={notif.id || index}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                        onClick={() => {
                          if (isCoe) {
                            toNotifikasi.push('/coe/tahunan');
                            setShowNotifications(false);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                            isCoe
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                              : 'bg-gradient-to-br from-green-500 to-teal-600'
                          }`}>
                            {isCoe ? 'CE' : (notif.username ? notif.username.substring(0, 2).toUpperCase() : '??')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">
                              {isCoe ? 'Calendar of Events' : notif.username}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {notif.aktifitas}
                            </p>
                            <span className="text-xs text-gray-500 mt-1">
                              {isCoe && notif.created_at
                                ? dayjs(notif.created_at).format('DD MMM YYYY')
                                : dayjs(notif.created_at).locale("id").fromNow()}
                            </span>
                          </div>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                      Tidak ada notifikasi
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                  <button onClick={handleNotifikasi} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Lihat Semua Notifikasi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:pr-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={user?.name || 'Profil'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <div className="hidden md:block text-left max-w-[9rem] lg:max-w-[12rem]">
                <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500 truncate">
                  {Number(user?.level) === 1 ? "Super Admin" : Number(user?.level) === 2 ? "Operator" : "User"}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 hidden md:block shrink-0" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-[min(14rem,calc(100vw-1.5rem))] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-semibold truncate">{user?.name || 'User'}</div>
                  <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                </div>
                <button onClick={handleAkun} className="w-full cursor-pointer px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profil Saya</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <button
                    onClick={logout}
                    className="w-full cursor-pointer px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

