import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import { MessageSquareWarning, Reply, CheckCircle2, Clock, AlertCircle, RefreshCw, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const CollegeComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply modal
  const [replyComplaint, setReplyComplaint] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [status, setStatus] = useState<'Pending' | 'In Progress' | 'Resolved'>('In Progress');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getCollegeComplaints();
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

  const handleOpenReply = (c: any) => {
    setReplyComplaint(c);
    setAdminResponse(c.adminResponse || '');
    setStatus(c.status || 'In Progress');
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyComplaint) return;

    setSubmitting(true);
    try {
      const res = await attendanceApi.replyToComplaint(replyComplaint._id, {
        adminResponse,
        status,
      });
      if (res.success) {
        toast.success('Complaint response recorded successfully!');
        setReplyComplaint(null);
        fetchComplaints();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit response.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-blue-600" />
            Student Complaints & Grievances
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review grievances submitted by enrolled students, update status, and record institutional responses.
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

      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No complaints submitted by students in your college.
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c._id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400">{c.complaintId}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : c.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {c.status === 'Resolved' && <CheckCircle2 className="w-3 h-3" />}
                    {c.status === 'In Progress' && <Clock className="w-3 h-3" />}
                    {c.status === 'Pending' && <AlertCircle className="w-3 h-3" />}
                    {c.status}
                  </span>

                  <button
                    onClick={() => handleOpenReply(c)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] rounded-lg shadow-xs transition-colors"
                  >
                    <Reply className="w-3 h-3" />
                    Reply / Update
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{c.description}</p>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Submitted by: <strong className="text-slate-700">{c.studentName}</strong> ({c.studentEmail})</span>
                <span className="font-mono">{new Date(c.submissionDate).toLocaleDateString()}</span>
              </div>

              {c.adminResponse && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs">
                  <p className="font-semibold text-blue-900 flex justify-between">
                    <span>Recorded Administrator Response:</span>
                    <span className="text-[10px] text-blue-600 font-normal">
                      By {c.respondedBy} on {new Date(c.respondedAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-blue-800 mt-1">{c.adminResponse}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setReplyComplaint(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Reply className="w-5 h-5 text-blue-600" />
              Respond to Complaint: {replyComplaint.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Student: <strong className="text-slate-800">{replyComplaint.studentName}</strong> ({replyComplaint.studentEmail})
            </p>

            <form onSubmit={handleSubmitReply} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Status *</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrator Response *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter response, resolution details, or guidance for the student..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyComplaint(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Submit Response</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
