import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  MessageSquareWarning,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  History,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export const SuperAdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getSuperAdminDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      toast.error('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Super Administrator Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global monitoring of academic colleges, administrators, student populations, and attendance metrics.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Main 7 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Colleges */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Colleges</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalColleges ?? 0}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Active: {stats.activeColleges ?? 0}
          </p>
        </div>

        {/* Total College Admins */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">College Admins</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalCollegeAdmins ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Institutional Leads</p>
        </div>

        {/* Total Students */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalStudents ?? 0}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Active: {stats.activeStudents ?? 0}
          </p>
        </div>

        {/* Total Subjects */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Subjects</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalSubjects ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Across all colleges</p>
        </div>

        {/* Active Colleges */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Colleges</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-700">{stats.activeColleges ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Operational Institutions</p>
        </div>

        {/* Active Students */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Students</span>
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-700">{stats.activeStudents ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Currently Attending</p>
        </div>

        {/* Total Complaints */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Complaints</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-slate-900">{stats.totalComplaints ?? 0}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {stats.pendingComplaints ?? 0} Pending
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Platform Student Grievances</p>
        </div>
      </div>

      {/* Attendance Prediction Distribution Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          Cross-College Student Attendance Prediction Health
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-800">{stats.eligibleCount ?? 0}</p>
              <p className="text-xs font-semibold text-emerald-700">Eligible Students</p>
              <p className="text-[10px] text-emerald-600">Meeting or exceeding targets</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-amber-800">{stats.atRiskCount ?? 0}</p>
              <p className="text-xs font-semibold text-amber-700">Students At Risk</p>
              <p className="text-[10px] text-amber-600">Below min %, but recoverable</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-lg">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-rose-800">{stats.unreachableCount ?? 0}</p>
              <p className="text-xs font-semibold text-rose-700">Target Unreachable</p>
              <p className="text-[10px] text-rose-600">Cannot attain minimum percentage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent System Activities */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          Recent Platform Audit Activity
        </h3>

        {recentActivities.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No recent activities recorded.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivities.map((act: any, idx: number) => (
              <div key={act._id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <div>
                    <span className="font-semibold text-slate-900">{act.action}</span>
                    <span className="text-slate-500 ml-2">by {act.performedBy} ({act.role})</span>
                    {act.target && (
                      <span className="text-slate-600 font-medium block text-[11px] mt-0.5">
                        Target: {act.target}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {act.timestamp ? new Date(act.timestamp).toLocaleString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
