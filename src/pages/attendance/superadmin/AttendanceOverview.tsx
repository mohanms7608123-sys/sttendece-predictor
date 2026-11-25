import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import { CalendarCheck, CheckCircle2, AlertTriangle, XCircle, Search, RefreshCw, Filter } from 'lucide-react';
import { toast } from 'sonner';

export const AttendanceOverview: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getSuperAdminAttendance();
      if (res.success) {
        setRecords(res.overview);
      }
    } catch (err: any) {
      toast.error('Failed to load attendance records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase()) ||
      r.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      r.collegeId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.metrics?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            Cross-College Attendance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-tenant attendance status and risk classification across all active institutions.
          </p>
        </div>
        <button
          onClick={fetchOverview}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, subject, or college ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ELIGIBLE">Eligible Only</option>
            <option value="AT RISK">At Risk Only</option>
            <option value="UNREACHABLE">Unreachable Target Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Student ID / Name</th>
                <th className="py-3.5 px-4">Subject Name</th>
                <th className="py-3.5 px-4">College</th>
                <th className="py-3.5 px-4">Conducted</th>
                <th className="py-3.5 px-4">Attended</th>
                <th className="py-3.5 px-4">Current %</th>
                <th className="py-3.5 px-4">Required Classes</th>
                <th className="py-3.5 px-4">Can Miss</th>
                <th className="py-3.5 px-4">Prediction Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No attendance records match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const m = r.metrics;
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{r.studentName}</span>
                        <span className="font-mono text-[11px] text-slate-400">{r.studentId}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{r.subjectName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{r.collegeId}</td>
                      <td className="py-3.5 px-4">{m?.classesConducted ?? 0}</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-700">{m?.classesAttended ?? 0}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">{m?.currentAttendance ?? 0}%</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{m?.classesRequired ?? 0}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${(m?.classesCanBeMissed ?? 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {m?.classesCanBeMissed ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            m?.status === 'ELIGIBLE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : m?.status === 'AT RISK'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {m?.status === 'ELIGIBLE' && <CheckCircle2 className="w-3 h-3" />}
                          {m?.status === 'AT RISK' && <AlertTriangle className="w-3 h-3" />}
                          {m?.status === 'UNREACHABLE' && <XCircle className="w-3 h-3" />}
                          {m?.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
