import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import { BarChart3, Building2, Download, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ReportsAnalytics: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getSuperAdminReports();
      if (res.success) {
        setReports(res.reports);
      }
    } catch (err: any) {
      toast.error('Failed to load reports: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (reports.length === 0) return;
    const headers = ['College ID', 'College Name', 'Secret Code', 'Students', 'Subjects', 'Complaints', 'Eligible', 'At Risk', 'Unreachable'];
    const rows = reports.map((r) => [
      r.collegeId,
      `"${r.collegeName}"`,
      r.secretCode,
      r.totalStudents,
      r.totalSubjects,
      r.totalComplaints,
      r.eligible,
      r.atRisk,
      r.unreachable,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_college_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('College report exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comparative performance, attendance benchmarks, and target achievement breakdown per college.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchReports}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* College Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => {
          const totalKnown = r.eligible + r.atRisk + r.unreachable;
          const eligiblePct = totalKnown > 0 ? Math.round((r.eligible / totalKnown) * 100) : 100;

          return (
            <div key={r.collegeId} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400">{r.collegeId}</span>
                  <h3 className="font-bold text-base text-slate-900">{r.collegeName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Secret Code: <code className="font-bold text-amber-700 font-mono">{r.secretCode}</code></p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  r.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {r.status}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700">
                  <span>Student Compliance Rate</span>
                  <span>{eligiblePct}% Eligible</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(r.eligible / (totalKnown || 1)) * 100}%` }} className="bg-emerald-500" />
                  <div style={{ width: `${(r.atRisk / (totalKnown || 1)) * 100}%` }} className="bg-amber-500" />
                  <div style={{ width: `${(r.unreachable / (totalKnown || 1)) * 100}%` }} className="bg-rose-500" />
                </div>
              </div>

              {/* Breakdown stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Eligible</span>
                  <span className="text-lg font-black text-emerald-800">{r.eligible}</span>
                </div>
                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">At Risk</span>
                  <span className="text-lg font-black text-amber-800">{r.atRisk}</span>
                </div>
                <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Unreachable</span>
                  <span className="text-lg font-black text-rose-800">{r.unreachable}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Total Students: <strong className="text-slate-800">{r.totalStudents}</strong></span>
                <span>Subjects: <strong className="text-slate-800">{r.totalSubjects}</strong></span>
                <span>Complaints: <strong className="text-slate-800">{r.totalComplaints}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
