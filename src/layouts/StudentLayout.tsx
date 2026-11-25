import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAttendanceAuth } from '@/contexts/AttendanceAuthContext';
import {
  LayoutDashboard,
  BookOpenCheck,
  Calculator,
  MessageSquareWarning,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAttendanceAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Subjects', path: '/student/subjects', icon: BookOpenCheck },
    { label: 'Attendance Predictor', path: '/student/predictor', icon: Calculator },
    { label: 'My Complaints', path: '/student/complaints', icon: MessageSquareWarning },
    { label: 'My Profile', path: '/student/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-emerald-950 text-slate-100 border-r border-emerald-900 shrink-0">
        <div className="p-5 border-b border-emerald-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-base tracking-tight text-white truncate">Student Portal</h1>
            <p className="text-xs text-emerald-300 font-medium truncate">{user?.collegeName || 'Student Console'}</p>
          </div>
        </div>

        {/* Student Welcome Card */}
        <div className="p-4 mx-3 my-3 bg-emerald-900/60 rounded-xl border border-emerald-800/80">
          <p className="text-xs text-emerald-300 font-medium">Welcome,</p>
          <p className="text-sm font-bold text-white truncate mt-0.5">{user?.fullName || 'Student'}</p>
          <div className="mt-2.5 pt-2.5 border-t border-emerald-800/80 flex items-center justify-between text-xs">
            <span className="text-emerald-300 text-[11px] flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              College Code:
            </span>
            <span className="font-mono font-bold text-amber-300 tracking-wider bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60">
              {user?.collegeSecretCode || 'N/A'}
            </span>
          </div>
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
                      ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* AI Predictor Callout */}
        <div className="p-3 mx-3 mb-2 rounded-lg bg-emerald-900/40 border border-emerald-800 text-[11px] text-emerald-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Attendance prediction updates automatically in real-time.</span>
        </div>

        {/* Logout button */}
        <div className="p-3 border-t border-emerald-900">
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
          <div className="relative w-72 max-w-[80%] bg-emerald-950 text-slate-100 flex flex-col h-full z-10 shadow-2xl">
            <div className="p-4 border-b border-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-white text-sm">Student Portal</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-emerald-900/50 border-b border-emerald-800 text-xs">
              <p className="text-white font-bold">{user?.fullName}</p>
              <p className="text-amber-300 font-mono text-[11px]">Code: {user?.collegeSecretCode}</p>
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
                        isActive
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-3 border-t border-emerald-900">
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
              <span className="text-xs font-bold text-slate-800">{user?.collegeName || 'College Attendance'}</span>
              <span className="text-[11px] text-slate-500">Student Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-medium">
              <span>Code:</span>
              <span className="font-mono font-bold text-amber-900">{user?.collegeSecretCode}</span>
            </div>
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800">{user?.fullName || 'Student'}</span>
              <span className="text-[10px] text-slate-500">{user?.studentId}</span>
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
