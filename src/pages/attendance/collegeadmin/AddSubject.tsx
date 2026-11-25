import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceApi } from '@/services/attendanceApi';
import { PlusCircle, BookOpen, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const AddSubject: React.FC = () => {
  const [formData, setFormData] = useState({
    subjectId: '',
    subjectName: '',
    plannedClasses: 60,
    classesConducted: 0,
    minimumAttendance: 75,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId.trim() || !formData.subjectName.trim()) {
      toast.error('Subject ID and Subject Name are required.');
      return;
    }

    if (formData.classesConducted > formData.plannedClasses) {
      toast.error('Classes conducted cannot exceed planned classes.');
      return;
    }

    setLoading(true);
    try {
      const res = await attendanceApi.addSubject(formData);
      if (res.success) {
        toast.success('Subject added and assigned to all enrolled students!');
        navigate('/college-admin/manage-subjects');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/college-admin/manage-subjects')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Manage Subjects
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Add New Academic Subject</h1>
          <p className="text-xs text-slate-500 mt-1">
            Define curriculum parameters. Once created, attendance records will automatically be provisioned for all enrolled students in your college.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject ID / Course Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CS-201 or PY-101"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Python Programming"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Planned Classes (P) *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.plannedClasses}
                onChange={(e) => setFormData({ ...formData, plannedClasses: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Classes Conducted (H) *</label>
              <input
                type="number"
                min={0}
                required
                value={formData.classesConducted}
                onChange={(e) => setFormData({ ...formData, classesConducted: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-amber-700 mb-1">Minimum Attendance (M %) *</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={formData.minimumAttendance}
                onChange={(e) => setFormData({ ...formData, minimumAttendance: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-900">
              <p className="font-semibold">Automated Student Provisioning</p>
              <p className="text-blue-700">
                When you create this subject, the backend immediately associates all active students in your college with an initial attended count of 0.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/college-admin/manage-subjects')}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Subject...</span>
                </>
              ) : (
                <span>Save and Provision Subject</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
