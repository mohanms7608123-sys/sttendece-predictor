import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, KeyRound, Save } from 'lucide-react';
import { toast } from 'sonner';

export const SuperAdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    systemName: 'Smart Student Attendance and Predictor System',
    defaultMinimumAttendance: 75,
    allowDirectStudentRegistration: true,
    requireAdminCollegeVerification: true,
    auditLoggingEnabled: true,
    sessionTimeoutMinutes: 120,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('System configuration updated successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          Global Platform Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure default attendance thresholds, registration policies, and security parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Attendance & Prediction Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Platform Brand Title</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Minimum Attendance Target (%)</label>
              <input
                type="number"
                min={50}
                max={100}
                value={settings.defaultMinimumAttendance}
                onChange={(e) => setSettings({ ...settings, defaultMinimumAttendance: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            Security & Tenant Controls
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireAdminCollegeVerification}
                onChange={(e) => setSettings({ ...settings, requireAdminCollegeVerification: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="font-semibold text-slate-800">
                Enforce approved College Secret Code verification for College Admin and Student registration
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.auditLoggingEnabled}
                onChange={(e) => setSettings({ ...settings, auditLoggingEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="font-semibold text-slate-800">
                Record immutable activity logs for administrative status toggles and password resets
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
