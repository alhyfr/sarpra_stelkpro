'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/assets/logo_ori.png';
import Image from 'next/image';
import {
  LayoutDashboard,
  Mail,
  MessageSquare,
  Calendar,
  FlaskRound,
  Package,
  PackageSearch,
  Layers,
  Settings,
  ChevronDown,
  Users,
  Hammer,
  X
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  {
    title: 'Inventaris',
    icon: Package,
    submenu: [
      { title: 'Aset Tetap', href: '/inventaris/master' },
      { title: 'ATK', href: '/inventaris/atk' },
      { title: 'Barang Non ATK', href: '/inventaris/habis-pakai' },
      { title: 'Aset Pending', href: '/inventaris/pending' }
    ]
  },
  {
    title: 'Alat Tulis Kantor',
    icon: Layers,
    submenu: [
      { title: 'ATK Masuk', href: '/atk/masuk' },
      { title: 'ATK Keluar', href: '/atk/keluar' },
    ]
  },
  {
    title: 'Monitoring',
    icon: Calendar,
    href: '/monitoring'
  },
  {
    title: 'Users',
    icon: Users,
    submenu: [
      { title: 'User Account', href: '/users/acount' },
      { title: 'Team', href: '/users/teams' },
      { title: 'Support', href: '/users/support' },
      { title: 'Member', href: '/users/member' },
    ]
  },
  {
    title: 'Peminjaman',
    icon: PackageSearch,
    submenu: [
      { title: 'Barang Pinjaman', href: '/peminjaman/barang-pinjaman' },
      { title: 'Peminjaman Barang', href: '/peminjaman/barang' },
      { title: 'Peminjaman Ruangan', href: '/peminjaman/ruangan' },
      { title: 'Peminjaman external', href: '/peminjaman/eksternal' },
    ]
  },
  {
    title: 'Laboratorium',
    icon: FlaskRound,
    submenu: [
      { title: 'Daftar Laboratorium', href: '/lab/daftar' },
      { title: 'Invantaris Laboratorium', href: '/lab/inv' },
      { title: 'Bahan Praktikum', href: '/lab/bahan' },
      { title: 'Jadwal Penggunaan', href: '/lab/jadwal' },
    ]
  },
  {
    title: 'Sarpra',
    icon: Hammer,
    submenu: [
      { title: 'perawatan aset', href: '/sarpra/perawatan/aset' },
      { title: 'perawatan bangunan', href: '/sarpra/perawatan/bangunan' },
      { title: 'gedung', href: '/sarpra/gedung' },
      { title: 'ruangan', href: '/sarpra/ruangan' },
    ]
  },
  {
    title: 'Calendar Of Event',
    icon: Calendar,
    submenu: [
      { title: 'Tahunan', href: '/coe/tahunan' },
      { title: 'Eksternal', href: '/coe/eksternal' },
    ]
  },
  {
    title: 'Settings',
    icon: Settings,
    submenu: [
      { title: 'satuan', href: '/settings/satuan' },
      { title: 'Sumber Dana', href: '/settings/sumber' },
      { title: 'Kategori Aset', href: '/settings/kategori' },
    ]
  },
];

export default function Sidebar({ isOpen, onClose, onToggle }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});

  // Auto-open menu if current path matches a submenu item
  useEffect(() => {
    menuItems.forEach((item, index) => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some(subItem =>
          pathname === subItem.href || pathname.startsWith(subItem.href + '/')
        );
        if (hasActiveSubmenu) {
          setOpenMenus(prev => ({ ...prev, [index]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleSubmenu = (index) => {
    setOpenMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Check if current path matches
  const isActiveLink = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Check if any submenu item is active
  const hasActiveSubmenu = (submenu) => {
    return submenu?.some(subItem => isActiveLink(subItem.href));
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src={Logo} alt="Logo" width={30} height={30} />
          <span className="font-bold text-2xl text-red-800 dark:text-white">Stelk</span>
          <span className="font-bold text-2xl text-gray-400 dark:text-white">Property</span>
        </Link>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((item, index) => (
          <div key={index} className="mb-1">
            {item.submenu ? (
              <div>
                <button
                  onClick={() => toggleSubmenu(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${hasActiveSubmenu(item.submenu)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${openMenus[index] ? 'rotate-180' : 'rotate-0'
                      }`}
                  />
                </button>
                <div
                  className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${openMenus[index]
                    ? 'max-h-96 opacity-100 mt-1'
                    : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="space-y-1">
                    {item.submenu.map((subItem, subIndex) => {
                      const isActive = isActiveLink(subItem.href);
                      return (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                            ? 'bg-red-800 text-white font-medium shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transform hover:translate-x-1'
                            }`}
                        >
                          {subItem.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActiveLink(item.href)
                  ? 'bg-red-800 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          © 2024 WowDash. All Rights Reserved.
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar - Overlay */}
      <div className="lg:hidden">
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />

            {/* Drawer */}
            <aside className="fixed left-0 top-0 w-64 h-screen z-50 transform transition-transform duration-300">
              {sidebarContent}
            </aside>
          </>
        )}
      </div>
    </>
  );
}

