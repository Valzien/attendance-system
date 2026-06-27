import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  UserCheck,
  ClipboardList,
  Lock,
  Contact,
  CalendarDays,
  History,
  Bell,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import logobanten from '../../assets/images/logobanten.png';
import logosman from '../../assets/images/logosman.jpg';

const navItems = [
  {
    to: '/admin/home',
    title: 'Dashboard',
    icon: LayoutDashboard,
  },
  // {
  //   to: '/admin/rekap',
  //   title: 'Rekap Absensi',
  //   icon: UserCheck,
  // },
  {
    to: '/admin/pengajuan',
    title: 'Data Pengajuan',
    icon: ClipboardList,
  },
  {
    to: '/admin/reset-password',
    title: 'Reset Password',
    icon: Lock,
  },
  {
    to: '/admin/data-guru',
    title: 'Data Guru',
    icon: Contact,
  },
  {
  to: '/admin/manage-admin',
  title: 'Kelola Admin',
  icon: UserCheck,
  },
  {
    to: '/admin/data-siswa',
    title: 'Data Siswa',
    icon: Contact,
  },
  {
    to: '/admin/jadwal',
    title: 'Jadwal Pelajaran',
    icon: CalendarDays,
  },
  {
    to: '/admin/history-absensi',
    title: 'History Absensi',
    icon: History,
  },
];

export default function Layout({ children, showHeader = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
          className={`
            fixed top-0 left-0 h-screen z-30
            w-[240px]
            bg-white border-r border-gray-100
            flex flex-col
            shadow-[2px_0_16px_rgb(0,0,0,0.04)]
            overflow-y-auto
            transition-transform duration-300

            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}

            lg:translate-x-0
          `}
        >
        {/* Brand */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-gray-100">
          <img src={logobanten} alt="Logo Banten" className="h-9 object-contain" />
          <img src={logosman} alt="Logo SMAN" className="h-9 object-contain" />
          <div className="ml-1">
            <p className="text-[13px] font-black text-[#1d2433] leading-tight">SMAN 10 Tangsel</p>
            <p className="text-[10px] text-gray-400 font-medium">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 group transition-all duration-150
                  ${isActive
                    ? 'bg-[#1d2433] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#1d2433]'
                  }
                `}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                <span className={`text-[13px] font-${isActive ? 'bold' : 'medium'} flex-1`}>
                  {item.title}
                </span>
                {isActive && <ChevronRight size={13} className="opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer user */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#e8eaf0] flex items-center justify-center text-[11px] font-black text-[#1d2433] flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-[#1d2433] truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-[12px] font-semibold"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[240px]">

        {/* Top bar */}
        {showHeader && (
          <header className="bg-white border-b border-gray-100 px-5 lg:px-8 py-4 flex items-center justify-between shadow-[0_1px_8px_rgb(0,0,0,0.03)] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile */}
              <button
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} className="text-gray-700" />
              </button>

              {/* Page title from nav */}
              <div>
                <p className="text-[15px] font-black text-[#1d2433]">
                  {navItems.find((n) => n.to === location.pathname)?.title || 'Admin Panel'}
                </p>
                <p className="text-[11px] text-gray-400 hidden sm:block">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/admin/notifications')}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors relative ${
                  location.pathname === '/admin/notifications'
                    ? 'bg-gray-200'
                    : 'bg-[#f0f1f3] hover:bg-gray-200'
                }`}
              >
                <Bell size={17} className="text-gray-700" />
              </button>

              <button
                onClick={() => navigate('/admin/profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f0f1f3] hover:bg-gray-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#1d2433] flex items-center justify-center text-[10px] font-black text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="text-[12px] font-bold text-gray-700 hidden sm:block">
                  {user?.name || 'Admin'}
                </span>
              </button>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 lg:px-8 py-6">
          {children}
        </main>

        <footer className="py-5 text-center">
          <p className="text-[10px] text-gray-300 font-medium">Supported by Universitas Pamulang</p>
          <Link to="/copyright" className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">
            &copy; Copyright Srikandi
          </Link>
        </footer>
      </div>
    </div>
  );
}
