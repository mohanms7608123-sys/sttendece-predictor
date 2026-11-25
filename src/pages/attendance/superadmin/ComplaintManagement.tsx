import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import { MessageSquareWarning, RefreshCw, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ComplaintManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getSuperAdminComplaints();
      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (err: any) {
      toast.error('Failed to load complaints: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.collegeName.toLowerCase().includes(search.toLowerCase()) ||
      c.complaintId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-indigo-600" />
            Platform-Wide Complaint Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit student grievances, monitor resolution turnaround times, and review institutional responses.
          </p>
        </div>
        <button
          onClick={fetchComplaints}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, student, college, or complaint ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="Pending">Pending Only</option>
          <option value="In Progress">In Progress Only</option>
          <option value="Resolved">Resolved Only</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No complaints found.
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c._id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400">{c.complaintId}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold w-fit ${
                    c.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : c.status === 'In Progress'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {c.status === 'Resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {c.status === 'In Progress' && <Clock className="w-3.5 h-3.5" />}
                  {c.status === 'Pending' && <AlertCircle className="w-3.5 h-3.5" />}
                  {c.status}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{c.description}</p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-900">Student:</span> {c.studentName} ({c.studentEmail})
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="font-semibold text-slate-900">College:</span> {c.collegeName} ({c.collegeId})
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Submitted: {new Date(c.submissionDate).toLocaleDateString()}
                </span>
              </div>

              {c.adminResponse && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
                  <p className="font-semibold text-indigo-900 flex items-center justify-between">
                    <span>College Administrator Response:</span>
                    <span className="text-[10px] text-indigo-600 font-normal">
                      By {c.respondedBy || 'Admin'} {c.respondedAt ? `on ${new Date(c.respondedAt).toLocaleDateString()}` : ''}
                    </span>
                  </p>
                  <p className="text-indigo-800 mt-1">{c.adminResponse}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
