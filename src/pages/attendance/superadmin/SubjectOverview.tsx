import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import { BookOpen, Search, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const SubjectOverview: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getSuperAdminSubjects();
      if (res.success) {
        setSubjects(res.subjects);
      }
    } catch (err: any) {
      toast.error('Failed to load subjects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filtered = subjects.filter(
    (s) =>
      s.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      s.subjectId.toLowerCase().includes(search.toLowerCase()) ||
      s.collegeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Platform Subject Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global catalog of academic courses, planned hours, classes conducted, and required minimum attendance percentages.
          </p>
        </div>
        <button
          onClick={fetchSubjects}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by Subject Name, Code, or College ID..."
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
                <th className="py-3.5 px-4">Subject ID</th>
                <th className="py-3.5 px-4">Subject Name</th>
                <th className="py-3.5 px-4">College ID</th>
                <th className="py-3.5 px-4">Planned Classes (P)</th>
                <th className="py-3.5 px-4">Conducted (H)</th>
                <th className="py-3.5 px-4">Min Attendance %</th>
                <th className="py-3.5 px-4">Remaining</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No subjects found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.subjectId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.subjectName}</td>
                    <td className="py-3.5 px-4 font-mono text-indigo-600 font-bold">{s.collegeId}</td>
                    <td className="py-3.5 px-4">{s.plannedClasses}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.classesConducted}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">{s.minimumAttendance}%</td>
                    <td className="py-3.5 px-4">{Math.max(0, s.plannedClasses - s.classesConducted)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {s.status}
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
