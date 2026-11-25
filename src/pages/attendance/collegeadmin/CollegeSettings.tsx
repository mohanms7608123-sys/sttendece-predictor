import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import { useAttendanceAuth } from '@/contexts/AttendanceAuthContext';
import { Sliders, Building2, KeyRound, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const CollegeSettings: React.FC = () => {
  const { user } = useAttendanceAuth();
  const [formData, setFormData] = useState({
    collegeName: '',
    collegeEmail: '',
    collegeAddress: '',
    contactNumber: '',
    collegeSecretCode: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    attendanceApi.getCollegeSettings().then((res) => {
      if (res.success && res.college) {
        setFormData({
          collegeName: res.college.collegeName || '',
          collegeEmail: res.college.collegeEmail || '',
          collegeAddress: res.college.collegeAddress || '',
          contactNumber: res.college.contactNumber || '',
          collegeSecretCode: res.college.collegeSecretCode || '',
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await attendanceApi.updateCollegeSettings(formData);
      if (res.success) {
        toast.success('College settings updated successfully.');
      }
    } catch (err: any) {
      toast.error('Failed to update settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-blue-600" />
          College Institutional Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage institution contact details and review your College Secret Code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        {/* College Code Banner */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-700" />
            <div>
              <p className="font-bold text-amber-900 text-sm">College Secret Code</p>
              <p className="text-[11px] text-amber-700">Students and administrators use this code during registration.</p>
            </div>
          </div>
          <span className="font-mono text-sm font-black text-amber-900 bg-white px-3 py-1 rounded-lg border border-amber-300">
            {formData.collegeSecretCode || user?.collegeSecretCode}
          </span>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">College Name</label>
          <input
            type="text"
            required
            value={formData.collegeName}
            onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official College Email</label>
            <input
              type="email"
              required
              value={formData.collegeEmail}
              onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Campus Address</label>
          <textarea
            rows={3}
            value={formData.collegeAddress}
            onChange={(e) => setFormData({ ...formData, collegeAddress: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
