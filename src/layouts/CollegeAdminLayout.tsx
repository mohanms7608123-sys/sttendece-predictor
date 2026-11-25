import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAttendanceAuth } from '@/contexts/AttendanceAuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  MessageSquareWarning,
  Sliders,
  User,
  LogOut,
  Menu,
  X,
  School,
  KeyRound,
} from 'lucide-react';

export const CollegeAdminLayout: React.FC = () => {
  const { user, logout } = useAttendanceAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/college-admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/college-admin/dashboard', icon: LayoutDashboard },
    { label: 'Add Subject', path: '/college-admin/add-subject', icon: PlusCircle },
    { label: 'Manage Subjects', path: '/college-admin/manage-subjects', icon: BookOpen },
    { label: 'View Students', path: '/college-admin/students', icon: GraduationCap },
    { label: 'Student Attendance Reports', path: '/college-admin/reports', icon: FileSpreadsheet },
    { label: 'Complaints', path: '/college-admin/complaints', icon: MessageSquareWarning },
    { label: 'College Settings', path: '/college-admin/settings', icon: Sliders },
    { label: 'Profile', path: '/college-admin/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-blue-950 text-slate-100 border-r border-blue-900 shrink-0">
        <div className="p-5 border-b border-blue-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <School className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-base tracking-tight text-white truncate">College Admin</h1>
            <p className="text-xs text-blue-300 font-medium truncate">{user?.collegeName || 'Institution Portal'}</p>
          </div>
        </div>

        {/* College Code Banner */}
        <div className="mx-4 my-3 px-3.5 py-2.5 rounded-lg bg-blue-900/60 border border-blue-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-semibold text-blue-200">Secret Code:</span>
          </div>
          <span className="font-mono text-xs font-bold text-amber-300 tracking-wider bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700/50">
            {user?.collegeSecretCode || 'N/A'}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-blue-200 hover:text-white hover:bg-blue-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-3 border-t border-blue-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-blue-950 text-slate-100 flex flex-col h-full z-10 shadow-2xl">
            <div className="p-4 border-b border-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-white text-sm">College Admin</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 py-2 bg-blue-900/50 text-xs flex justify-between items-center">
              <span className="text-blue-200">Secret Code:</span>
              <span className="font-mono font-bold text-amber-300">{user?.collegeSecretCode}</span>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                        isActive ? 'bg-blue-600 text-white font-semibold' : 'text-blue-200 hover:text-white hover:bg-blue-900/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-3 border-t border-blue-900">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">{user?.collegeName || 'Institution'}</span>
              <span className="text-[11px] text-slate-500">Administrator Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-medium">
              <span>Code:</span>
              <span className="font-mono font-bold">{user?.collegeSecretCode}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-800 block">{user?.fullName || 'College Admin'}</span>
              <span className="text-[10px] text-slate-400 block">{user?.email}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
