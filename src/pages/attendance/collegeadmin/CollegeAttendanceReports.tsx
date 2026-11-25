import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import { FileSpreadsheet, Download, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export const CollegeAttendanceReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getCollegeAttendanceReports();
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
    const headers = ['Student ID', 'Full Name', 'Email', 'Overall Attendance %', 'Status', 'Subjects Enrolled'];
    const rows = reports.map((r) => [
      r.studentId,
      `"${r.fullName}"`,
      r.email,
      r.overallPercentage + '%',
      r.overallStatus,
      r.subjectsCount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `college_student_attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendance report exported successfully');
  };

  const filtered = reports.filter(
    (r) =>
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Student Attendance Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated institutional report classifying students into Eligible, At Risk, and Unreachable target tiers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
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

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by student name, ID, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Subjects Enrolled</th>
                <th className="py-3.5 px-4">Overall Attendance %</th>
                <th className="py-3.5 px-4">Risk Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No student reports found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.studentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{r.studentId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.email}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{r.subjectsCount} subjects</td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-slate-900 text-sm">{r.overallPercentage}%</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.overallStatus === 'ELIGIBLE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.overallStatus === 'AT RISK'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.overallStatus === 'ELIGIBLE' && <CheckCircle2 className="w-3 h-3" />}
                        {r.overallStatus === 'AT RISK' && <AlertTriangle className="w-3 h-3" />}
                        {r.overallStatus === 'UNREACHABLE' && <XCircle className="w-3 h-3" />}
                        {r.overallStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
