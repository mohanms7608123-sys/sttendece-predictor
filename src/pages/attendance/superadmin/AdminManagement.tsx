import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import {
  Users,
  Eye,
  KeyRound,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  GraduationCap,
  BookOpen,
  MessageSquareWarning,
  Building2,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile modal state
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Reset password state
  const [resetModalAdmin, setResetModalAdmin] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getAdmins();
      if (res.success) {
        setAdmins(res.admins);
      }
    } catch (err: any) {
      toast.error('Failed to load administrators: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenProfile = async (adminId: string) => {
    setSelectedAdminId(adminId);
    setProfileLoading(true);
    try {
      const res = await attendanceApi.getAdminProfile(adminId);
      if (res.success) {
        setProfile(res.profile);
      }
    } catch (err: any) {
      toast.error('Failed to load admin profile: ' + err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleToggleStatus = async (admin: any) => {
    const nextStatus = admin.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await attendanceApi.updateAdminStatus(admin._id, nextStatus);
      if (res.success) {
        toast.success(res.message);
        fetchAdmins();
        if (profile && profile.personal.adminId === admin.adminId) {
          setProfile({
            ...profile,
            personal: { ...profile.personal, status: nextStatus },
          });
        }
      }
    } catch (err: any) {
      toast.error('Failed to update status.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalAdmin || !newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    try {
      const res = await attendanceApi.resetAdminPassword(resetModalAdmin._id, newPassword);
      if (res.success) {
        toast.success(res.message);
        setResetModalAdmin(null);
        setNewPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            College Admin Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee registered college administrators, inspect institution profiles, and control security access.
          </p>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Admin ID</th>
                <th className="py-3.5 px-4">Admin Name</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">College Name</th>
                <th className="py-3.5 px-4">Secret Code</th>
                <th className="py-3.5 px-4">Password</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No college administrators registered.
                  </td>
                </tr>
              ) : (
                admins.map((adm) => (
                  <tr key={adm._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{adm.adminId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{adm.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{adm.username}</td>
                    <td className="py-3.5 px-4 text-slate-700">{adm.email}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{adm.collegeName}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {adm.collegeSecretCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 font-bold tracking-widest">
                      ********
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {adm.registrationDate ? new Date(adm.registrationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(adm)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          adm.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to activate/deactivate"
                      >
                        {adm.status === 'active' ? (
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenProfile(adm._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] rounded-lg shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => setResetModalAdmin(adm)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Reset Password"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Admin Profile Modal */}
      {selectedAdminId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedAdminId(null);
                setProfile(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Complete College Administrator Profile
            </h2>

            {profileLoading || !profile ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="mt-4 space-y-6 text-xs text-slate-700">
                {/* 1. Personal Information */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                    1. Personal Information
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Admin ID</span>
                      <span className="font-mono font-bold text-slate-900">{profile.personal.adminId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Full Name</span>
                      <span className="font-bold text-slate-900">{profile.personal.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Username</span>
                      <span>{profile.personal.username}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Email</span>
                      <span>{profile.personal.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">College</span>
                      <span className="font-semibold text-slate-900">{profile.personal.collegeName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Registration Date</span>
                      <span>{new Date(profile.personal.registrationDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Last Login</span>
                      <span>{profile.personal.lastLogin ? new Date(profile.personal.lastLogin).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Status</span>
                      <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                        profile.personal.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {profile.personal.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. College Information */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    2. College Information
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">College ID</span>
                      <span className="font-mono font-bold text-slate-900">{profile.college.collegeId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">College Name</span>
                      <span className="font-bold text-slate-900">{profile.college.collegeName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Secret Code</span>
                      <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        {profile.college.collegeSecretCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Contact Details</span>
                      <span>{profile.college.collegeEmail || 'N/A'} {profile.college.contactNumber ? `| ${profile.college.contactNumber}` : ''}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Student Information */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      3. Student Information
                    </h3>
                    <div className="flex gap-2 text-[11px]">
                      <span className="font-bold">Total: {profile.students.total}</span>
                      <span className="text-emerald-600 font-bold">Active: {profile.students.active}</span>
                      <span className="text-slate-400">Inactive: {profile.students.inactive}</span>
                    </div>
                  </div>
                  {profile.students.list.length === 0 ? (
                    <p className="text-slate-400 italic">No registered students under this college.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-slate-200 bg-white">
                      {profile.students.list.map((stu: any) => (
                        <div key={stu.studentId} className="px-3 py-1.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-900">{stu.fullName} ({stu.studentId})</span>
                          <span className="text-slate-500">{stu.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Subject Information */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    4. Subject Information ({profile.subjects.total} Subjects)
                  </h3>
                  {profile.subjects.list.length === 0 ? (
                    <p className="text-slate-400 italic">No subjects configured by this admin yet.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 font-bold text-slate-600">
                          <tr>
                            <th className="p-2">Subject Name</th>
                            <th className="p-2">Planned Classes</th>
                            <th className="p-2">Conducted</th>
                            <th className="p-2">Min Attendance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {profile.subjects.list.map((sub: any) => (
                            <tr key={sub.subjectId}>
                              <td className="p-2 font-semibold text-slate-900">{sub.subjectName} ({sub.subjectId})</td>
                              <td className="p-2">{sub.plannedClasses}</td>
                              <td className="p-2 font-bold text-indigo-700">{sub.classesConducted}</td>
                              <td className="p-2 font-bold text-amber-700">{sub.minimumAttendance}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 5. Complaint Information */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <MessageSquareWarning className="w-3.5 h-3.5 text-rose-600" />
                    5. Complaint Information
                  </h3>
                  <div className="flex gap-4">
                    <span className="font-bold text-slate-800">Total: {profile.complaints.total}</span>
                    <span className="font-bold text-amber-600">Pending: {profile.complaints.pending}</span>
                    <span className="font-bold text-emerald-600">Resolved: {profile.complaints.resolved}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setResetModalAdmin(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
              Reset Admin Password
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Administrator: <strong className="text-slate-800">{resetModalAdmin.fullName}</strong> ({resetModalAdmin.email})
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Secure Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalAdmin(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
