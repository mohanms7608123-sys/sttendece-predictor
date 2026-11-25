import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import {
  GraduationCap,
  Eye,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
  RotateCcw,
  Building2,
  BookOpen,
  MessageSquareWarning,
  Calculator,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');

  // Student Profile Modal state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password reset modal state
  const [resetModalStudent, setResetModalStudent] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getStudents({ search, collegeName: collegeFilter });
      if (res.success) {
        setStudents(res.students);
      }
    } catch (err: any) {
      toast.error('Failed to load students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, collegeFilter]);

  const handleOpenProfile = async (id: string) => {
    setSelectedStudentId(id);
    setProfileLoading(true);
    try {
      const res = await attendanceApi.getStudentProfile(id);
      if (res.success) {
        setProfile(res.profile);
      }
    } catch (err: any) {
      toast.error('Failed to load student profile: ' + err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleToggleStatus = async (student: any) => {
    const nextStatus = student.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await attendanceApi.updateStudentStatus(student._id, nextStatus);
      if (res.success) {
        toast.success(res.message);
        fetchStudents();
        if (profile && profile.personal.studentId === student.studentId) {
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
    if (!resetModalStudent || !newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    try {
      const res = await attendanceApi.resetStudentPassword(resetModalStudent._id, newPassword);
      if (res.success) {
        toast.success(res.message);
        setResetModalStudent(null);
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
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            Student Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse all enrolled students across colleges, examine attendance records, and inspect prediction histories.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Student Name, Student ID, Email, or College..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Filter by College Name..."
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Password</th>
                <th className="py-3.5 px-4">College Name</th>
                <th className="py-3.5 px-4">Secret Code</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No students match your query.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{stu.studentId}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenProfile(stu._id)}
                        className="font-bold text-slate-900 hover:text-indigo-600 hover:underline cursor-pointer text-left"
                      >
                        {stu.fullName}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{stu.username}</td>
                    <td className="py-3.5 px-4 text-slate-700">{stu.email}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 font-bold tracking-widest">
                      ********
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{stu.collegeName}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {stu.collegeSecretCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {stu.registrationDate ? new Date(stu.registrationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(stu)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          stu.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {stu.status === 'active' ? (
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
                          onClick={() => handleOpenProfile(stu._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] rounded-lg shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => setResetModalStudent(stu)}
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

      {/* Complete Student Profile Modal */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedStudentId(null);
                setProfile(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              Complete Student Profile & Attendance Predictor Audit
            </h2>

            {profileLoading || !profile ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="mt-4 space-y-6 text-xs text-slate-700">
                {/* PERSONAL INFORMATION */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    PERSONAL INFORMATION
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Student ID</span>
                      <span className="font-mono font-bold text-slate-900">{profile.personal.studentId}</span>
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
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Phone</span>
                      <span>{profile.personal.phone || 'N/A'}</span>
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
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Account Status</span>
                      <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                        profile.personal.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {profile.personal.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* COLLEGE INFORMATION */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    COLLEGE INFORMATION
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">College Name</span>
                      <span className="font-bold text-slate-900">{profile.college.collegeName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">College ID</span>
                      <span className="font-mono font-bold text-slate-900">{profile.college.collegeId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Secret Code</span>
                      <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        {profile.college.collegeSecretCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Associated College Admin</span>
                      <span>{profile.college.associatedAdmin}</span>
                    </div>
                  </div>
                </div>

                {/* ATTENDANCE INFORMATION */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                    ATTENDANCE INFORMATION & PREDICTION STATUS
                  </h3>

                  {profile.attendance.length === 0 ? (
                    <p className="text-slate-400 italic">No subjects assigned.</p>
                  ) : (
                    <div className="space-y-3">
                      {profile.attendance.map((att: any) => (
                        <div key={att.subjectId} className="p-3.5 bg-white rounded-xl border border-slate-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                            <div>
                              <span className="font-bold text-slate-900 text-sm">{att.subjectName}</span>
                              <span className="text-slate-400 ml-2 font-mono">({att.subjectId})</span>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                att.attendancePredictionStatus === 'ELIGIBLE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : att.attendancePredictionStatus === 'AT RISK'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {att.attendancePredictionStatus === 'ELIGIBLE' && <CheckCircle2 className="w-3 h-3" />}
                              {att.attendancePredictionStatus === 'AT RISK' && <AlertTriangle className="w-3 h-3" />}
                              {att.attendancePredictionStatus === 'UNREACHABLE' && <XCircle className="w-3 h-3" />}
                              {att.attendancePredictionStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block">Planned (P):</span>
                              <span className="font-bold">{att.plannedClasses}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Conducted (H):</span>
                              <span className="font-bold">{att.classesConducted}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Attended (A):</span>
                              <span className="font-bold text-indigo-700">{att.classesAttended}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Missed:</span>
                              <span className="font-bold text-rose-600">{att.classesMissed}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Current %:</span>
                              <span className="font-black text-slate-900">{att.currentAttendancePercentage}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Min Required %:</span>
                              <span className="font-bold text-amber-700">{att.minimumAttendancePercentage}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Remaining Classes:</span>
                              <span className="font-bold">{att.remainingClasses}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Classes Required:</span>
                              <span className="font-bold text-indigo-600">{att.classesRequired}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Can Be Missed:</span>
                              <span className={`font-bold ${att.classesCanBeMissed < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {att.classesCanBeMissed}
                              </span>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-slate-400 block">Max Possible %:</span>
                              <span className="font-bold text-slate-800">{att.maximumPossibleAttendance}%</span>
                            </div>
                          </div>

                          <div className="mt-2.5 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 italic">
                            &ldquo;{att.predictionMessage}&rdquo;
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* COMPLAINT INFORMATION */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                    <MessageSquareWarning className="w-3.5 h-3.5 text-rose-600" />
                    COMPLAINT INFORMATION ({profile.complaints.length})
                  </h3>
                  {profile.complaints.length === 0 ? (
                    <p className="text-slate-400 italic">No complaints filed by this student.</p>
                  ) : (
                    <div className="space-y-2">
                      {profile.complaints.map((c: any) => (
                        <div key={c.complaintId} className="p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900">{c.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{c.description}</p>
                          <div className="mt-1 text-[10px] text-slate-400">
                            Submitted: {new Date(c.submissionDate).toLocaleDateString()} &bull; Admin Reply: {c.adminResponse}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setResetModalStudent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
              Reset Student Password
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Student: <strong className="text-slate-800">{resetModalStudent.fullName}</strong> ({resetModalStudent.email})
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalStudent(null)}
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
