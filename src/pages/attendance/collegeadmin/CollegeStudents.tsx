import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import {
  GraduationCap,
  Eye,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  X,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

export const CollegeStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Individual Student Attendance Report modal
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [attendanceReport, setAttendanceReport] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getCollegeStudents();
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
  }, []);

  const handleViewReport = async (student: any) => {
    setSelectedStudent(student);
    setReportLoading(true);
    try {
      const res = await attendanceApi.getStudentAttendanceDetails(student.studentId);
      if (res.success) {
        setAttendanceReport(res.attendance);
      }
    } catch (err: any) {
      toast.error('Failed to load attendance report: ' + err.message);
    } finally {
      setReportLoading(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Registered College Students
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Students enrolled via your unique College Secret Code with automated subject attendance tracking.
          </p>
        </div>
        <button
          onClick={fetchStudents}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search student by name, student ID, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4">Attendance Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No students registered in this college yet.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.studentId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.email}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {s.registrationDate ? new Date(s.registrationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.attendanceStatus === 'ELIGIBLE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.attendanceStatus === 'AT RISK'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {s.attendanceStatus === 'ELIGIBLE' && <CheckCircle2 className="w-3 h-3" />}
                        {s.attendanceStatus === 'AT RISK' && <AlertTriangle className="w-3 h-3" />}
                        {s.attendanceStatus === 'UNREACHABLE' && <XCircle className="w-3 h-3" />}
                        {s.attendanceStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewReport(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] rounded-lg shadow-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Attendance
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Attendance Report Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedStudent(null);
                setAttendanceReport([]);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Attendance Report: {selectedStudent.fullName} ({selectedStudent.studentId})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">{selectedStudent.email}</p>

            {reportLoading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : attendanceReport.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No attendance records found for this student.</p>
            ) : (
              <div className="space-y-3">
                {attendanceReport.map((att) => (
                  <div key={att.subjectId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{att.subjectName}</span>
                        <span className="text-slate-400 ml-2 font-mono">({att.subjectId})</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          att.attendancePredictionStatus === 'ELIGIBLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : att.attendancePredictionStatus === 'AT RISK'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.attendancePredictionStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mt-2">
                      <div>
                        <span className="text-slate-400 block">Conducted:</span>
                        <span className="font-bold">{att.classesConducted} / {att.plannedClasses}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Attended:</span>
                        <span className="font-bold text-blue-700">{att.classesAttended}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Current Attendance:</span>
                        <span className="font-black text-slate-900">{att.currentAttendancePercentage}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Min Required:</span>
                        <span className="font-bold text-amber-700">{att.minimumAttendancePercentage}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Remaining Classes:</span>
                        <span className="font-semibold">{att.remainingClasses}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Classes Required:</span>
                        <span className="font-bold text-indigo-700">{att.classesRequired}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Can Be Missed:</span>
                        <span className={`font-bold ${att.classesCanBeMissed < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {att.classesCanBeMissed}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Max Possible %:</span>
                        <span className="font-bold">{att.maximumPossibleAttendance}%</span>
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                      &ldquo;{att.predictionMessage}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
