'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/assets/logo_ori.png';
import Image from 'next/image';
import {
  LayoutDashboard,
  Calendar,
  FlaskRound,
  Package,
  PackageSearch,
  Layers,
  Settings,
  ChevronDown,
  Users,
  Hammer,
  X,
  Handshake,
  LockKeyhole,
  MonitorSmartphone,
  BrickWall,
  FileText,
  FileArchive
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { LEVEL } from '@/constants/rbac';

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
      { title: 'Aset Pending', href: '/inventaris/pending' },
    ]
  },
  {
    title: 'Penghapusan Aset',
    icon: FileArchive,
    submenu: [
      { title: 'Daftar Penghapusan', href: '/inventaris/penghapusan' },
      { title: 'Arsip Penghapusan', href: '/inventaris/arsip' },
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
      { title: 'User Account', href: '/users/acount', minLevel: LEVEL.SUPER_ADMIN },
      { title: 'Team', href: '/users/teams' },
      { title: 'Support', href: '/users/support' },
      { title: 'Member', href: '/users/member' },
      { title: 'Token', href: '/users/token', minLevel: LEVEL.SUPER_ADMIN },
    ]
  },
  {
    title: 'Peminjaman',
    icon: PackageSearch,
    submenu: [
      { title: 'Barang Pinjaman', href: '/peminjaman/barang-pinjaman' },
      { title: 'Peminjaman Barang', href: '/peminjaman/barang' },
      { title: 'Peminjaman Ruangan', href: '/peminjaman/ruangan' },
      { title: 'BA Peminjaman Barang', href: '/peminjaman/eksternal' },
    ]
  },
  {
    title: 'Laboratorium',
    icon: FlaskRound,
    submenu: [
      { title: 'Daftar Laboratorium', href: '/lab/daftar' },
      { title: 'Invantaris Laboratorium', href: '/lab/inv' },
      { title: 'Bahan Praktikum', href: '/lab/bahan' },
      { title: 'Bahan Masuk', href: '/lab/bahan-masuk' },
      { title: 'Peminjaman Barang', href: '/lab/pinjam-barang' },
      { title: 'Barang Rusak', href: '/lab/rusak' },
      { title: 'Jadwal Penggunaan', href: '/lab/jadwal' },
    ]
  },
  {
    title: 'Sarpra',
    icon: Hammer,
    submenu: [
      { title: 'laporan perawatan aset', href: '/sarpra/perawatan/aset' },
      { title: 'laporan perawatan bangunan', href: '/sarpra/perawatan/bangunan' },
      { title: 'gedung', href: '/sarpra/gedung' },
      { title: 'ruangan', href: '/sarpra/ruangan' },
      { title: 'persediaan barang', href: '/sarpra/persediaan' },
      { title: 'laporan kartu persediaan', href: '/sarpra/kartu-persediaan' },
      { title: 'perawatan AC', href: '/sarpra/ac' },
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
    title: 'Material',
    icon: BrickWall,
    submenu: [
      { title: 'material masuk', href: '/material/masuk' },
      { title: 'laporan material keluar', href: '/material/keluar' },
      { title: 'stok gudang', href: '/material/stok' },
    ]

  },
  {
    title: 'Dokumen',
    icon: FileText,
    href: '/dokumen'
  },
  {
    title: 'Serah Terima',
    icon: Handshake,
    href: '/serah-terima'
  },
  {
    title: 'Audit Keamanan',
    icon: LockKeyhole,
    href: '/audit/keamanan'
  },
  {
    title: 'Perawatan Perangkat IT',
    icon: MonitorSmartphone,
    href: '/audit/perawatan-it'
  },
  {
    title: 'Settings',
    icon: Settings,
    minLevel: LEVEL.SUPER_ADMIN,
    submenu: [
      { title: 'satuan', href: '/settings/satuan', minLevel: LEVEL.SUPER_ADMIN },
      { title: 'Sumber Dana', href: '/settings/sumber', minLevel: LEVEL.SUPER_ADMIN },
      { title: 'Kategori Aset', href: '/settings/kategori', minLevel: LEVEL.SUPER_ADMIN },
      { title: 'Kategori IT', href: '/settings/kategori-it', minLevel: LEVEL.SUPER_ADMIN },
    ]
  },
];

/** minLevel: LEVEL.SUPER_ADMIN → hanya super admin yang melihat item. */
function filterMenuByLevel(items, userLevel) {
  const level = Number(userLevel);
  return items
    .map((item) => {
      if (item.minLevel != null && level !== Number(item.minLevel)) {
        return null;
      }
      if (item.submenu) {
        const submenu = filterMenuByLevel(item.submenu, userLevel);
        if (submenu.length === 0 && !item.href) return null;
        return { ...item, submenu };
      }
      return item;
    })
    .filter(Boolean);
}

export default function Sidebar({ isOpen, onClose, onToggle }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState({});
  const visibleMenu = useMemo(
    () => filterMenuByLevel(menuItems, user?.level ?? LEVEL.USER),
    [user?.level]
  );

  // Check if current path matches
  const isActiveLink = (href) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Check if any submenu item (termasuk nested) is active
  const hasActiveSubmenu = (submenu) => {
    return submenu?.some((subItem) =>
      subItem.submenu ? hasActiveSubmenu(subItem.submenu) : isActiveLink(subItem.href)
    );
  };

  // Auto-open menu if current path matches a submenu item (termasuk nested)
  useEffect(() => {
    const next = {};
    menuItems.forEach((item, index) => {
      if (!item.submenu) return;
      if (hasActiveSubmenu(item.submenu)) {
        next[index] = true;
      }
      item.submenu.forEach((subItem, subIndex) => {
        if (subItem.submenu && hasActiveSubmenu(subItem.submenu)) {
          next[`${index}-${subIndex}`] = true;
        }
      });
    });
    if (Object.keys(next).length) {
      setOpenMenus((prev) => ({ ...prev, ...next }));
    }
  }, [pathname]);

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Tutup drawer hanya di mobile/tablet (< lg). Desktop sidebar tetap terbuka.
  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose?.();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 gap-2 border-b border-gray-200 dark:border-gray-800">
        <Link
          href="/dashboard"
          onClick={handleNavClick}
          className="flex items-center gap-1.5 min-w-0"
        >
          <Image src={Logo} alt="Logo" width={28} height={28} className="shrink-0" />
          <span className="font-bold text-lg sm:text-xl text-red-800 dark:text-white truncate">Stelk</span>
          <span className="font-bold text-lg sm:text-xl text-gray-400 dark:text-gray-300 truncate hidden xs:inline sm:inline">Property</span>
        </Link>
        {/* Close button for mobile / tablet */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shrink-0"
          aria-label="Tutup menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {visibleMenu.map((item, index) => (
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
                    ? 'max-h-[40rem] opacity-100 mt-1'
                    : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="space-y-1">
                    {item.submenu.map((subItem, subIndex) => {
                      if (subItem.submenu) {
                        const nestedKey = `${index}-${subIndex}`;
                        const nestedOpen = !!openMenus[nestedKey];
                        const nestedActive = hasActiveSubmenu(subItem.submenu);
                        return (
                          <div key={subIndex}>
                            <button
                              type="button"
                              onClick={() => toggleSubmenu(nestedKey)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                nestedActive
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              <span>{subItem.title}</span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                                  nestedOpen ? 'rotate-180' : 'rotate-0'
                                }`}
                              />
                            </button>
                            <div
                              className={`ml-3 overflow-hidden transition-all duration-300 ease-in-out ${
                                nestedOpen
                                  ? 'max-h-40 opacity-100 mt-1'
                                  : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className="space-y-1">
                                {subItem.submenu.map((nestedItem, nestedIndex) => {
                                  const isActive = isActiveLink(nestedItem.href);
                                  return (
                                    <Link
                                      key={nestedIndex}
                                      href={nestedItem.href}
                                      onClick={handleNavClick}
                                      className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                        isActive
                                          ? 'bg-red-800 text-white font-medium shadow-sm'
                                          : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transform hover:translate-x-1'
                                      }`}
                                    >
                                      {nestedItem.title}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const isActive = isActiveLink(subItem.href);
                      return (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          onClick={handleNavClick}
                          className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 capitalize ${isActive
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
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActiveLink(item.href)
                  ? 'bg-red-800 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium truncate">{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          © {new Date().getFullYear()} Stelk Property
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

            {/* Drawer — lebar aman untuk iPad mini */}
            <aside className="fixed left-0 top-0 w-[min(16rem,85vw)] h-screen z-50 transform transition-transform duration-300 shadow-xl">
              {sidebarContent}
            </aside>
          </>
        )}
      </div>
    </>
  );
}

