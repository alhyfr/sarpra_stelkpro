'use client';

import { useState } from 'react';
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

export default function Header({ onMenuClick }) {
  const { user, logout, isRedirecting } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    {
      title: 'Congratulations',
      message: 'Your profile has been Verified',
      time: '23 Mins ago',
      avatar: '🎉'
    },
    {
      title: 'Ronald Richards',
      message: 'You can stitch between artboards',
      time: '23 Mins ago',
      avatar: 'RR'
    },
    {
      title: 'Arlene McCoy',
      message: 'Invite you to prototyping',
      time: '23 Mins ago',
      avatar: 'AM'
    },
    {
      title: 'Annette Black',
      message: 'Invite you to prototyping',
      time: '23 Mins ago',
      avatar: 'AB'
    },
    {
      title: 'Darlene Robertson',
      message: 'Invite you to prototyping',
      time: '23 Mins ago',
      avatar: 'DR'
    },
  ];

  const messages = [
    {
      name: 'Kathryn Murphy',
      message: "hey! there i'm...",
      time: '12:30 PM',
      unread: 8,
      avatar: 'KM'
    },
    {
      name: 'Kathryn Murphy',
      message: "hey! there i'm...",
      time: '12:30 PM',
      unread: 2,
      avatar: 'KM'
    },
    {
      name: 'Kathryn Murphy',
      message: "hey! there i'm...",
      time: '12:30 PM',
      unread: 0,
      avatar: 'KM'
    },
  ];

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
          <div className="relative">
            <button
              onClick={() => {
                setShowLanguage(!showLanguage);
                setShowNotifications(false);
                setShowMessages(false);
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

          {/* Messages */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMessages(!showMessages);
                setShowNotifications(false);
                setShowLanguage(false);
                setShowProfile(false);
              }}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showMessages && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold">Message</h3>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                    05
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {msg.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{msg.name}</h4>
                            <span className="text-xs text-gray-500">{msg.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {msg.message}
                          </p>
                        </div>
                        {msg.unread > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {msg.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    See All Message
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowMessages(false);
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
                    05
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {notif.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{notif.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notif.message}
                          </p>
                          <span className="text-xs text-gray-500 mt-1">{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    See All Notification
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
                setShowMessages(false);
                setShowLanguage(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                SI
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.role || 'Admin'}</div>
              </div>
              <ChevronDown className="w-4 h-4 hidden lg:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-semibold">{user?.name || 'User'}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <button className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left flex items-center gap-2">
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
                    className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left flex items-center gap-2 text-red-600 dark:text-red-400"
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

