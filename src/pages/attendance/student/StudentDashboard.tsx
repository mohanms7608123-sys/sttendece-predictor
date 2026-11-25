import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi } from '@/services/attendanceApi';
import { useAttendanceAuth } from '@/contexts/AttendanceAuthContext';
import {
  GraduationCap,
  KeyRound,
  BookOpenCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  TrendingUp,
  Calculator,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export const StudentDashboard: React.FC = () => {
  const { user } = useAttendanceAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getStudentDashboard();
      if (res.success) {
        setData(res);
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
      {/* Student Welcome Header Card - Exact Spec Requirement */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">Student Console</span>
            {/* Display: Welcome, [Student Name]! */}
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Welcome, {data?.studentName || user?.fullName || 'Student'}!
            </h1>
            {/* Below student's name, display: College Code: [Code] */}
            <p className="text-xs text-emerald-200 mt-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>College Code:</span>
              <span className="font-mono font-bold bg-emerald-950 px-2.5 py-0.5 rounded text-amber-300 border border-emerald-700 tracking-wider">
                {data?.collegeSecretCode || user?.collegeSecretCode || 'N/A'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/student/predictor"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Run Attendance Predictor
            </Link>
            <button
              onClick={fetchDashboard}
              className="p-2 bg-emerald-950/60 hover:bg-emerald-950 text-emerald-200 rounded-xl border border-emerald-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Required Spec Dashboard Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* College Name */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            College Name
          </span>
          <p className="text-xs font-bold text-slate-900 truncate" title={data?.collegeName}>
            {data?.collegeName || user?.collegeName}
          </p>
        </div>

        {/* Student ID */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Student ID
          </span>
          <p className="text-sm font-mono font-bold text-indigo-700 truncate">
            {data?.studentId || user?.studentId}
          </p>
        </div>

        {/* Total Subjects */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Subjects
          </span>
          <p className="text-xl font-black text-slate-900">
            {data?.totalSubjects ?? 0}
          </p>
        </div>

        {/* Overall Attendance */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Overall Attendance
          </span>
          <p className="text-xl font-black text-slate-900">
            {data?.overallAttendance ?? 100}%
          </p>
        </div>

        {/* Subjects At Risk */}
        <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Subjects At Risk
          </span>
          <p className="text-xl font-black text-amber-800">
            {data?.subjectsAtRisk ?? 0}
          </p>
        </div>

        {/* Unreachable Attendance Targets */}
        <div className="p-4 bg-white rounded-2xl border border-rose-200 bg-rose-50/40 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Unreachable Targets
          </span>
          <p className="text-xl font-black text-rose-800">
            {data?.subjectsUnreachable ?? 0}
          </p>
        </div>
      </div>

      {/* Critical Status Alert Banners */}
      {data?.subjectsUnreachable > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">Attendance Target Unreachable in {data.subjectsUnreachable} subject(s)!</p>
            <p className="text-rose-700 mt-0.5">
              Even if you attend all remaining classes, you cannot achieve the required attendance percentage. Please contact your College Admin immediately.
            </p>
          </div>
        </div>
      )}

      {data?.subjectsAtRisk > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">Attention: {data.subjectsAtRisk} subject(s) currently At Risk!</p>
            <p className="text-amber-700 mt-0.5">
              Your attendance in these courses is below the minimum percentage. Attend your upcoming scheduled classes to restore eligibility.
            </p>
          </div>
        </div>
      )}

      {/* Subject Summary Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-emerald-600" />
            My Active Course Attendance
          </h2>
          <Link
            to="/student/subjects"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Update Attended Classes &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data?.subjectsSummary || []).map((sub: any) => (
            <div key={sub.subjectId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{sub.subjectName}</h3>
                  <span className="font-mono text-[10px] text-slate-400">{sub.subjectId}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    sub.status === 'ELIGIBLE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sub.status === 'AT RISK'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {sub.status === 'ELIGIBLE' && <CheckCircle2 className="w-3 h-3" />}
                  {sub.status === 'AT RISK' && <AlertTriangle className="w-3 h-3" />}
                  {sub.status === 'UNREACHABLE' && <XCircle className="w-3 h-3" />}
                  {sub.status}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Attendance: {sub.classesAttended} / {sub.classesConducted} classes</span>
                  <span>{sub.currentPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, sub.currentPercentage)}%` }}
                    className={`h-full rounded-full ${
                      sub.status === 'ELIGIBLE'
                        ? 'bg-emerald-500'
                        : sub.status === 'AT RISK'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
