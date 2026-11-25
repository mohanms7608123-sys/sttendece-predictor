export interface AttendanceInput {
  plannedClasses: number;
  classesConducted: number;
  classesAttended: number;
  minimumAttendance: number;
}

export interface AttendanceMetrics {
  plannedClasses: number;
  classesConducted: number;
  classesAttended: number;
  classesMissed: number;
  minimumAttendance: number;
  currentAttendance: number;
  requiredAttendanceClasses: number;
  remainingClasses: number;
  classesRequired: number;
  classesCanBeMissed: number;
  maxPossibleAttendance: number;
  status: 'ELIGIBLE' | 'AT RISK' | 'UNREACHABLE';
  message: string;
  isEligible: boolean;
  isAtRisk: boolean;
  isUnreachable: boolean;
}

export function calculateAttendanceMetrics({
  plannedClasses,
  classesConducted,
  classesAttended,
  minimumAttendance,
}: AttendanceInput): AttendanceMetrics {
  const P = Math.max(0, Number(plannedClasses) || 0);
  const H = Math.max(0, Number(classesConducted) || 0);
  const A = Math.max(0, Math.min(H, Number(classesAttended) || 0));
  const M = Math.max(0, Math.min(100, Number(minimumAttendance) || 75));

  // Current Attendance Percentage: (A / H) * 100
  const currentAttendance = H === 0 ? 100 : Math.round((A / H) * 10000) / 100;

  // Required Attendance Classes: ceil(P * M / 100)
  const requiredAttendanceClasses = Math.ceil((P * M) / 100);

  // Remaining Classes: P - H
  const remainingClasses = Math.max(0, P - H);

  // Classes Required: max(0, Required Attendance Classes - A)
  const classesRequired = Math.max(0, requiredAttendanceClasses - A);

  // Classes That Can Be Missed: Remaining Classes - Classes Required
  const classesCanBeMissed = remainingClasses - classesRequired;

  // Maximum Possible Attendance: ((A + Remaining Classes) / P) * 100
  const maxPossibleAttendance = P === 0 ? 100 : Math.round(((A + remainingClasses) / P) * 10000) / 100;

  let status: 'ELIGIBLE' | 'AT RISK' | 'UNREACHABLE' = 'ELIGIBLE';
  let message = 'Congratulations! You have achieved the minimum attendance requirement.';

  if (classesRequired > remainingClasses || (A + remainingClasses) < requiredAttendanceClasses || maxPossibleAttendance < M) {
    status = 'UNREACHABLE';
    message = 'Attendance Target Unreachable. Even if you attend all remaining classes, you cannot achieve the required attendance percentage. Please contact your College Admin.';
  } else if (currentAttendance < M || (H === P && currentAttendance < M)) {
    status = 'AT RISK';
    message = `Your attendance is below the required percentage. You must attend ${classesRequired} more classes to reach the target.`;
  } else {
    status = 'ELIGIBLE';
    message = 'Congratulations! You have achieved the minimum attendance requirement.';
  }

  return {
    plannedClasses: P,
    classesConducted: H,
    classesAttended: A,
    classesMissed: Math.max(0, H - A),
    minimumAttendance: M,
    currentAttendance,
    requiredAttendanceClasses,
    remainingClasses,
    classesRequired,
    classesCanBeMissed,
    maxPossibleAttendance,
    status,
    message,
    isEligible: status === 'ELIGIBLE',
    isAtRisk: status === 'AT RISK',
    isUnreachable: status === 'UNREACHABLE',
  };
}
