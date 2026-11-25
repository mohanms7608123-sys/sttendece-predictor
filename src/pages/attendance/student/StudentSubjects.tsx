import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import {
  BookOpenCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit3,
  RefreshCw,
  X,
  Loader2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export const StudentSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Update Attended Classes Modal
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [attendedInput, setAttendedInput] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getStudentSubjects();
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

  const handleOpenUpdate = (sub: any) => {
    setEditingSubject(sub);
    setAttendedInput(sub.classesAttended);
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    const val = Number(attendedInput);
    if (isNaN(val) || val < 0) {
      toast.error('Please enter a valid non-negative number.');
      return;
    }

    // Validation: Classes attended cannot exceed classes conducted!
    if (val > editingSubject.classesConducted) {
      toast.error(
        `Validation Error: Classes attended (${val}) cannot exceed classes conducted (${editingSubject.classesConducted}).`
      );
      return;
    }

    setUpdating(true);
    try {
      const res = await attendanceApi.updateStudentAttendance(editingSubject.subjectId, val);
      if (res.success) {
        toast.success('Your attended classes have been updated and predictions recalculated!');
        setEditingSubject(null);
        fetchSubjects();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update attendance.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-emerald-600" />
            My Assigned Subjects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your courses. You may log your attended classes; all other curriculum parameters are locked by your college administrator.
          </p>
        </div>
        <button
          onClick={fetchSubjects}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((sub) => {
          const isEligible = sub.attendancePredictionStatus === 'ELIGIBLE';
          const isAtRisk = sub.attendancePredictionStatus === 'AT RISK';
          const isUnreachable = sub.attendancePredictionStatus === 'UNREACHABLE';

          return (
            <div
              key={sub.subjectId}
              className={`p-6 rounded-2xl border bg-white shadow-xs space-y-4 transition-all ${
                isUnreachable
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isAtRisk
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400">{sub.subjectId}</span>
                  <h3 className="font-bold text-base text-slate-900">{sub.subjectName}</h3>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                    isEligible
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isAtRisk
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isEligible && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isAtRisk && <AlertTriangle className="w-3.5 h-3.5" />}
                  {isUnreachable && <XCircle className="w-3.5 h-3.5" />}
                  {sub.attendancePredictionStatus}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Current Attendance</span>
                  <span className="text-sm font-black text-slate-900">{sub.currentAttendancePercentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                  <div
                    style={{ width: `${Math.min(100, sub.currentAttendancePercentage)}%` }}
                    className={`h-full rounded-full transition-all ${
                      isEligible ? 'bg-emerald-500' : isAtRisk ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                  {/* Minimum threshold indicator marker */}
                  <div
                    style={{ left: `${sub.minimumAttendancePercentage}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900"
                    title={`Required Minimum: ${sub.minimumAttendancePercentage}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0%</span>
                  <span className="font-semibold text-amber-700">Min Target: {sub.minimumAttendancePercentage}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Course Metrics Table Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Planned (P)</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    {sub.plannedClasses}
                    <Lock className="w-3 h-3 text-slate-400" title="Locked by College Admin" />
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Conducted (H)</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    {sub.classesConducted}
                    <Lock className="w-3 h-3 text-slate-400" title="Locked by College Admin" />
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Min Required (M)</span>
                  <span className="font-bold text-amber-700 flex items-center gap-1">
                    {sub.minimumAttendancePercentage}%
                    <Lock className="w-3 h-3 text-slate-400" title="Locked by College Admin" />
                  </span>
                </div>

                <div>
                  <span className="text-emerald-700 block text-[10px] uppercase font-bold">Attended (A)</span>
                  <span className="font-black text-indigo-700 text-sm">{sub.classesAttended}</span>
                </div>
              </div>

              {/* Predictive Forecast Insights */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">Remaining</span>
                  <span className="font-bold text-slate-800">{sub.remainingClasses} classes</span>
                </div>

                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="text-[10px] text-indigo-700 block font-semibold">Classes Required</span>
                  <span className="font-black text-indigo-800">{sub.classesRequired}</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">Can Be Missed</span>
                  <span className={`font-bold ${sub.classesCanBeMissed < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {sub.classesCanBeMissed}
                  </span>
                </div>
              </div>

              {/* Status explanation alert */}
              <div
                className={`p-3 rounded-xl text-xs ${
                  isUnreachable
                    ? 'bg-rose-50 text-rose-900 border border-rose-200'
                    : isAtRisk
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}
              >
                <p className="font-medium italic">&ldquo;{sub.predictionMessage}&rdquo;</p>
              </div>

              {/* Action Button: Students ONLY able to enter or update their own attended-class count */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleOpenUpdate(sub)}
                  className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Log / Update Attended Classes ({sub.classesAttended})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Attended Classes Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingSubject(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              Update Attended Classes
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Subject: <strong className="text-slate-800">{editingSubject.subjectName}</strong> ({editingSubject.subjectId})
            </p>

            <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Classes Conducted:</span>
                  <span className="font-bold text-slate-900">{editingSubject.classesConducted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Planned Classes for Semester:</span>
                  <span className="font-bold text-slate-900">{editingSubject.plannedClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Minimum Required Attendance:</span>
                  <span className="font-bold text-amber-700">{editingSubject.minimumAttendancePercentage}%</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  How many classes have you attended? *
                </label>
                <input
                  type="number"
                  min={0}
                  max={editingSubject.classesConducted}
                  required
                  value={attendedInput}
                  onChange={(e) => setAttendedInput(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-sm font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Validation rule: Cannot exceed classes conducted ({editingSubject.classesConducted}).
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Attended Classes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
