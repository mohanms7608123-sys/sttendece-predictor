import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import {
  MessageSquareWarning,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  Loader2,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

export const StudentComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Complaint Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getStudentComplaints();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await attendanceApi.submitStudentComplaint({
        title: title.trim(),
        description: description.trim(),
      });
      if (res.success) {
        toast.success('Complaint submitted to your College Admin!');
        setTitle('');
        setDescription('');
        setShowModal(false);
        fetchComplaints();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-emerald-600" />
            My Complaints & Inquiries
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit attendance discrepancy reports, medical leave certificates, or target shortfall inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            File New Complaint
          </button>
          <button
            onClick={fetchComplaints}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            You haven&apos;t submitted any complaints.
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c._id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
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

              <p className="text-slate-700 leading-relaxed">{c.description}</p>
              <span className="text-[10px] text-slate-400 font-mono block">
                Submitted on: {new Date(c.submissionDate).toLocaleDateString()}
              </span>

              {/* Administrator Response Section */}
              {c.adminResponse ? (
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <p className="font-semibold text-emerald-950 flex justify-between">
                    <span>College Administrator Response:</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      By {c.respondedBy || 'Admin'} on {new Date(c.respondedAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-emerald-900 mt-1">{c.adminResponse}</p>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 italic text-[11px]">
                  Awaiting review and reply from your college administrator.
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              File a Grievance or Attendance Complaint
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Your inquiry will be routed directly to your College Administrator console.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complaint Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Medical leave attendance adjustment in Operating Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete explanation, dates missed, course name, and reasons..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Submit to College Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
