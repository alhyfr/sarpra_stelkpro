'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Loading from '@/components/Loading';
import {
  Menu,
  Search,
  Bell,
  Mail,
  Globe,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Inbox
} from 'lucide-react';
import api from '@/app/utils/Api';
import { useRouter } from 'next/navigation';
import { Combo } from 'next/font/google';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale('id');
export default function Header({ onMenuClick }) {
  const { user, logout, isRedirecting } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const[notifikasi,setNotifikasi] = useState([]);
  
  const notificationsRef = useRef(null);
  const languageRef = useRef(null);
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
      console.log(response.data);
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
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguage(false);
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



  const languages = [
    { name: 'English', flag: '🇬🇧' },
    { name: 'Japan', flag: '🇯🇵' },
    { name: 'France', flag: '🇫🇷' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'South Korea', flag: '🇰🇷' },
    { name: 'Bangladesh', flag: '🇧🇩' },
    { name: 'India', flag: '🇮🇳' },
    { name: 'Canada', flag: '🇨🇦' },
  ];
  const router = useRouter();
  const handleAkun = () => {
    router.push('/profile/akun');
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Menu Button - Visible on all screens */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 w-64 lg:w-96">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search Button for Mobile */}
          <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Language Selector */}
          <div className="relative" ref={languageRef}>
            <button
              onClick={() => {
                setShowLanguage(!showLanguage);
                setShowNotifications(false);
                setShowProfile(false);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {showLanguage && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-sm">Choose Your Language</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {languages.map((lang, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left flex items-center gap-2"
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowLanguage(false);
                setShowProfile(false);
              }}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                    {Array.isArray(notifikasi) ? notifikasi.length : 0}
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {Array.isArray(notifikasi) && notifikasi.length > 0 ? (
                    notifikasi.map((notif, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {notif.username ? notif.username.substring(0, 2).toUpperCase() : '??'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{notif.username}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notif.aktifitas}
                          </p>
                          <span className="text-xs text-gray-500 mt-1">{dayjs(notif.created_at).locale("id").fromNow()}</span>
                        </div>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                      Tidak ada notifikasi
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                  <button onClick={handleNotifikasi} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    See All Notification
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
                setShowLanguage(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                SI
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.level === 1 ? 'Admin' : 'User'}</div>
              </div>
              <ChevronDown className="w-4 h-4 hidden lg:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-semibold">{user?.name || 'User'}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <button onClick={handleAkun} className="w-full cursor-pointer px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">My Profile</span>
                </button>
                <button className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left flex items-center gap-2">
                  <Inbox className="w-4 h-4" />
                  <span className="text-sm">Inbox</span>
                </button>
                <button className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Setting</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <button
                    onClick={logout}
                    className="w-full cursor-pointer px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Log Out</span>
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

