import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import { useAttendanceAuth } from '@/contexts/AttendanceAuthContext';
import { User, GraduationCap, Building2, KeyRound, Mail, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const StudentProfile: React.FC = () => {
  const { user } = useAttendanceAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceApi
      .getMyStudentProfile()
      .then((res) => {
        if (res.success) {
          setProfile(res.profile);
        }
      })
      .catch((err) => {
        toast.error('Failed to load profile.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-600" />
          My Student Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your enrolled institutional credentials and account details.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center border border-emerald-200">
            {profile?.fullName?.slice(0, 2).toUpperCase() || 'ST'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{profile?.fullName}</h2>
            <p className="text-slate-500">{profile?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Student ID: {profile?.studentId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Student Details</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Full Name:</span>
              <span className="font-semibold text-slate-900">{profile?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-mono font-bold text-slate-900">{profile?.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-900">{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="text-slate-900">{profile?.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Enrolled On:</span>
              <span className="text-slate-700 font-mono">
                {profile?.registrationDate ? new Date(profile.registrationDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">College Affiliation</span>
            <div className="flex justify-between">
              <span className="text-slate-500">College:</span>
              <span className="font-bold text-slate-900">{profile?.collegeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">College Code:</span>
              <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                {profile?.collegeSecretCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">College ID:</span>
              <span className="font-mono font-bold text-slate-900">{profile?.collegeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Admin Lead:</span>
              <span className="text-slate-700">{profile?.associatedAdmin}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
