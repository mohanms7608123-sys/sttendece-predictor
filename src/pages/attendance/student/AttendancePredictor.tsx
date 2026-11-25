import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/attendanceApi';
import { calculateAttendanceMetrics } from '@/utils/attendanceCalculator';
import {
  Calculator,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sliders,
  TrendingUp,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const AttendancePredictor: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Simulation state
  const [simulateAttendCount, setSimulateAttendCount] = useState<number>(0);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getStudentSubjects();
      if (res.success && res.subjects.length > 0) {
        setSubjects(res.subjects);
        setSelectedSubjectId(res.subjects[0].subjectId);
      }
    } catch (err: any) {
      toast.error('Failed to load subjects for prediction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const selectedSubject = subjects.find((s) => s.subjectId === selectedSubjectId);

  // Run simulation calculation
  const remaining = selectedSubject ? selectedSubject.remainingClasses : 0;
  const currentAttended = selectedSubject ? selectedSubject.classesAttended : 0;
  const currentConducted = selectedSubject ? selectedSubject.classesConducted : 0;
  const planned = selectedSubject ? selectedSubject.plannedClasses : 0;
  const minPercent = selectedSubject ? selectedSubject.minimumAttendancePercentage : 75;

  const simulatedConducted = Math.min(planned, currentConducted + simulateAttendCount);
  const simulatedAttended = Math.min(simulatedConducted, currentAttended + simulateAttendCount);

  const simulatedMetrics = calculateAttendanceMetrics({
    plannedClasses: planned,
    classesConducted: simulatedConducted,
    classesAttended: simulatedAttended,
    minimumAttendance: minPercent,
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-600" />
            Attendance Prediction & Simulation Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate future attendance, discover how many classes you must attend, and prevent unreachable target deficits.
          </p>
        </div>
        <button
          onClick={fetchSubjects}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Subject Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {subjects.map((sub) => (
          <button
            key={sub.subjectId}
            onClick={() => {
              setSelectedSubjectId(sub.subjectId);
              setSimulateAttendCount(0);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedSubjectId === sub.subjectId
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sub.subjectName} ({sub.subjectId})
          </button>
        ))}
      </div>

      {selectedSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current State Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                <h2 className="text-base font-bold text-slate-900">{selectedSubject.subjectName}</h2>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  selectedSubject.attendancePredictionStatus === 'ELIGIBLE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : selectedSubject.attendancePredictionStatus === 'AT RISK'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {selectedSubject.attendancePredictionStatus}
              </span>
            </div>

            {/* Current Math Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Attendance</span>
                <span className="text-lg font-black text-slate-900">{selectedSubject.currentAttendancePercentage}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Attended / Conducted</span>
                <span className="text-lg font-bold text-slate-900">
                  {selectedSubject.classesAttended} / {selectedSubject.classesConducted}
                </span>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/50">
                <span className="text-amber-700 text-[10px] uppercase font-bold block">Min Required %</span>
                <span className="text-lg font-bold text-amber-800">{selectedSubject.minimumAttendancePercentage}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Remaining Classes</span>
                <span className="text-lg font-bold text-slate-900">{selectedSubject.remainingClasses}</span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="text-indigo-700 text-[10px] uppercase font-bold block">Classes Required</span>
                <span className="text-lg font-black text-indigo-800">{selectedSubject.classesRequired}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Can Be Missed</span>
                <span
                  className={`text-lg font-bold ${
                    selectedSubject.classesCanBeMissed < 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {selectedSubject.classesCanBeMissed}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-900 block mb-0.5">Maximum Possible Attendance:</span>
              <span className="text-base font-bold text-slate-900">{selectedSubject.maximumPossibleAttendance}%</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Even if you attend 100% of all {selectedSubject.remainingClasses} remaining classes, your maximum possible attendance will be {selectedSubject.maximumPossibleAttendance}%.
              </p>
            </div>

            <div
              className={`p-3.5 rounded-xl text-xs ${
                selectedSubject.attendancePredictionStatus === 'UNREACHABLE'
                  ? 'bg-rose-50 text-rose-900 border border-rose-200'
                  : selectedSubject.attendancePredictionStatus === 'AT RISK'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              }`}
            >
              <p className="font-semibold italic">&ldquo;{selectedSubject.predictionMessage}&rdquo;</p>
            </div>
          </div>

          {/* Interactive Simulation / What-If Slider Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Hypothetical Simulator
                </span>
                <h2 className="text-base font-bold text-slate-900">What-If Attendance Calculator</h2>
              </div>
            </div>

            {remaining === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All planned classes ({selectedSubject.plannedClasses}) have been conducted for this course.
              </p>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>What if I attend the next:</span>
                    <span className="text-sm font-black text-emerald-600 font-mono">
                      +{simulateAttendCount} classes
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={remaining}
                    value={simulateAttendCount}
                    onChange={(e) => setSimulateAttendCount(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0 classes</span>
                    <span>All {remaining} remaining classes</span>
                  </div>
                </div>

                {/* Simulated Outcome Display */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Projected Attendance Outcome
                  </span>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900">{simulatedMetrics.currentAttendance}%</span>
                      <span className="text-xs text-slate-500 ml-2">
                        ({simulatedMetrics.classesAttended} / {simulatedMetrics.classesConducted} classes)
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        simulatedMetrics.status === 'ELIGIBLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : simulatedMetrics.status === 'AT RISK'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {simulatedMetrics.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Future Classes Still Required:</span>
                      <span className="font-bold text-slate-800">{simulatedMetrics.classesRequired}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Future Classes Can Be Missed:</span>
                      <span
                        className={`font-bold ${
                          simulatedMetrics.classesCanBeMissed < 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {simulatedMetrics.classesCanBeMissed}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-xl text-xs ${
                    simulatedMetrics.status === 'UNREACHABLE'
                      ? 'bg-rose-50 text-rose-900 border border-rose-200'
                      : simulatedMetrics.status === 'AT RISK'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  <p className="font-semibold italic">&ldquo;{simulatedMetrics.message}&rdquo;</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
