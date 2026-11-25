import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi } from '@/services/attendanceApi';
import { useAttendanceAuth } from '@/contexts/AttendanceAuthContext';
import {
  School,
  GraduationCap,
  BookOpen,
  MessageSquareWarning,
  AlertTriangle,
  XCircle,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';

export const CollegeAdminDashboard: React.FC = () => {
  const { user } = useAttendanceAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getCollegeAdminDashboard();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err: any) {
      toast.error('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Institution Portal</span>
              <h1 className="text-2xl font-black text-white mt-1">
                {user?.collegeName || 'Institution Administration'}
              </h1>
              <p className="text-xs text-blue-200 mt-1 flex items-center gap-2">
                <span>College Secret Code:</span>
                <span className="font-mono font-bold bg-blue-950/80 px-2 py-0.5 rounded text-amber-300 border border-blue-700">
                  {user?.collegeSecretCode}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/college-admin/add-subject"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Subject
              </Link>
              <button
                onClick={fetchDashboard}
                className="p-2 bg-blue-950/60 hover:bg-blue-950 text-blue-200 rounded-xl border border-blue-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Required Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {/* Total Students */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalStudents ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Enrolled under code</p>
        </div>

        {/* Total Subjects */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Subjects</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalSubjects ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Active curriculum courses</p>
        </div>

        {/* Total Complaints */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Complaints</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalComplaints ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Student submissions</p>
        </div>

        {/* Pending Complaints */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Complaints</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.pendingComplaints ?? 0}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Awaiting admin review</p>
        </div>

        {/* Students At Risk */}
        <div className="p-5 bg-white rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Students At Risk</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800">{stats.studentsAtRisk ?? 0}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Below target, but recoverable</p>
        </div>

        {/* Students With Unreachable Attendance Targets */}
        <div className="p-5 bg-white rounded-2xl border border-rose-200 bg-rose-50/40 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Unreachable Targets</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-800">{stats.studentsUnreachable ?? 0}</div>
          <p className="text-[11px] text-rose-700 font-medium mt-1">Critically short of minimum %</p>
        </div>
      </div>

      {/* Action Shortcut Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/college-admin/manage-subjects"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-xs transition-all group flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Update Classes Conducted
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Changes instantly propagate to every enrolled student&apos;s predictor dashboard.
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
            <BookOpen className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/college-admin/reports"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-xs transition-all group flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Student Attendance Reports
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Inspect comprehensive risk analyses and export college attendance rosters.
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </Link>
      </div>
    </div>
  );
};
