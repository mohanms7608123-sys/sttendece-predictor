import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAttendanceAuth } from '@/contexts/AttendanceAuthContext';
import { Loader2 } from 'lucide-react';

export const RequireSuperAdmin: React.FC = () => {
  const { user, role, isLoading } = useAttendanceAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user || role !== 'super_admin') {
    return <Navigate to="/super-admin/login" replace />;
  }

  return <Outlet />;
};

export const RequireCollegeAdmin: React.FC = () => {
  const { user, role, isLoading } = useAttendanceAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user || role !== 'college_admin') {
    return <Navigate to="/college-admin/login" replace />;
  }

  return <Outlet />;
};

export const RequireStudent: React.FC = () => {
  const { user, role, isLoading } = useAttendanceAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user || role !== 'student') {
    return <Navigate to="/student/login" replace />;
  }

  return <Outlet />;
};
