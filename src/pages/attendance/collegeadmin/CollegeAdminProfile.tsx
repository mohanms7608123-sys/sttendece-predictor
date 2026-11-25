import React from 'react';
import { useAttendanceAuth } from '@/contexts/AttendanceAuthContext';
import { User, School, KeyRound, Mail, Calendar, ShieldCheck } from 'lucide-react';

export const CollegeAdminProfile: React.FC = () => {
  const { user } = useAttendanceAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Administrator Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Personal credentials and college affiliation details.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 font-black text-xl flex items-center justify-center border border-blue-200">
            {user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              College Administrator
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Admin Details</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Admin ID:</span>
              <span className="font-mono font-bold text-slate-900">{user?.adminId || 'ADM-N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role:</span>
              <span className="font-semibold text-blue-700 capitalize">College Admin</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">College Affiliation</span>
            <div className="flex justify-between">
              <span className="text-slate-500">College:</span>
              <span className="font-bold text-slate-900">{user?.collegeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">College ID:</span>
              <span className="font-mono font-bold text-slate-900">{user?.collegeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Secret Code:</span>
              <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                {user?.collegeSecretCode}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
