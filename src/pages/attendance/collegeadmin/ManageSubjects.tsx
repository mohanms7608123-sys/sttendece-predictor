import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi } from '@/services/attendanceApi';
import {
  BookOpen,
  PlusCircle,
  Edit2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export const ManageSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editSubject, setEditSubject] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getCollegeSubjects();
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubject) return;

    if (editSubject.classesConducted > editSubject.plannedClasses) {
      toast.error('Classes conducted cannot exceed planned classes.');
      return;
    }

    setSaving(true);
    try {
      const res = await attendanceApi.updateSubject(editSubject._id, editSubject);
      if (res.success) {
        toast.success('Subject updated! Student prediction dashboards synchronized.');
        setEditSubject(null);
        fetchSubjects();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update subject.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (subject: any) => {
    const nextStatus = subject.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await attendanceApi.toggleSubjectStatus(subject._id, nextStatus);
      if (res.success) {
        toast.success(`Subject status set to ${nextStatus}.`);
        fetchSubjects();
      }
    } catch (err: any) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Manage Curriculum Subjects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update classes conducted, planned class hours, and required minimum attendance percentages.
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
            onClick={fetchSubjects}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Subject ID</th>
                <th className="py-3.5 px-4">Subject Name</th>
                <th className="py-3.5 px-4">Planned Classes (P)</th>
                <th className="py-3.5 px-4">Classes Conducted (H)</th>
                <th className="py-3.5 px-4">Remaining Classes</th>
                <th className="py-3.5 px-4">Min Attendance %</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No subjects configured yet. Click &quot;Add Subject&quot; above to create one.
                  </td>
                </tr>
              ) : (
                subjects.map((s) => {
                  const remaining = Math.max(0, s.plannedClasses - s.classesConducted);
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.subjectId}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.subjectName}</td>
                      <td className="py-3.5 px-4">{s.plannedClasses}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {s.classesConducted}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{remaining}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-700">{s.minimumAttendance}%</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            s.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {s.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setEditSubject({ ...s })}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[11px] rounded-lg transition-colors border border-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Update Conducted / Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Subject Modal */}
      {editSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditSubject(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              Update Subject: {editSubject.subjectName}
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Updating Classes Conducted instantly recalculates attendance and risk levels for all enrolled students.
            </p>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={editSubject.subjectName}
                  onChange={(e) => setEditSubject({ ...editSubject, subjectName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Planned Classes (P)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editSubject.plannedClasses}
                    onChange={(e) => setEditSubject({ ...editSubject, plannedClasses: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-blue-700 mb-1">Classes Conducted (H) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editSubject.classesConducted}
                    onChange={(e) => setEditSubject({ ...editSubject, classesConducted: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-blue-50 border border-blue-300 rounded-xl font-bold text-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-amber-700 mb-1">Minimum Attendance (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={editSubject.minimumAttendance}
                    onChange={(e) => setEditSubject({ ...editSubject, minimumAttendance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editSubject.status}
                    onChange={(e) => setEditSubject({ ...editSubject, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditSubject(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
