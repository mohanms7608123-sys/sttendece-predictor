import express from 'express';
import {
  authenticateAttendanceToken,
  requireRole,
  enforceCollegeIsolation,
} from '../middleware/attendanceAuth.js';
import * as ctrl from '../controllers/attendanceController.js';

const router = express.Router();

// ==========================================
// 1. PUBLIC AUTHENTICATION ROUTES
// ==========================================
router.post('/super-admin/login', ctrl.superAdminLogin);
router.post('/college-admin/register', ctrl.collegeAdminRegister);
router.post('/college-admin/login', ctrl.collegeAdminLogin);
router.post('/student/register', ctrl.studentRegister);
router.post('/student/login', ctrl.studentLogin);

// Current user profile
router.get('/auth/me', authenticateAttendanceToken, ctrl.getMe);

// ==========================================
// 2. SUPER ADMIN ROUTES
// ==========================================
const superAdminAuth = [authenticateAttendanceToken, requireRole('super_admin')];

router.get('/super-admin/dashboard', superAdminAuth, ctrl.getSuperAdminDashboard);
router.get('/super-admin/colleges', superAdminAuth, ctrl.getColleges);
router.post('/super-admin/colleges', superAdminAuth, ctrl.addCollege);
router.put('/super-admin/colleges/:id', superAdminAuth, ctrl.updateCollege);

router.get('/super-admin/admins', superAdminAuth, ctrl.getAdmins);
router.get('/super-admin/admins/:id', superAdminAuth, ctrl.getAdminProfile);
router.put('/super-admin/admins/:id/status', superAdminAuth, ctrl.updateAdminStatus);
router.post('/super-admin/admins/:id/reset-password', superAdminAuth, ctrl.resetAdminPassword);

router.get('/super-admin/students', superAdminAuth, ctrl.getStudents);
router.get('/super-admin/students/:id', superAdminAuth, ctrl.getStudentProfile);
router.put('/super-admin/students/:id/status', superAdminAuth, ctrl.updateStudentStatus);
router.post('/super-admin/students/:id/reset-password', superAdminAuth, ctrl.resetStudentPassword);

router.get('/super-admin/subjects', superAdminAuth, ctrl.getSuperAdminSubjects);
router.get('/super-admin/attendance', superAdminAuth, ctrl.getSuperAdminAttendanceOverview);
router.get('/super-admin/complaints', superAdminAuth, ctrl.getSuperAdminComplaints);
router.get('/super-admin/reports', superAdminAuth, ctrl.getSuperAdminReports);
router.get('/super-admin/activity-logs', superAdminAuth, ctrl.getActivityLogs);

// ==========================================
// 3. COLLEGE ADMIN ROUTES
// ==========================================
const collegeAdminAuth = [
  authenticateAttendanceToken,
  requireRole('college_admin'),
  enforceCollegeIsolation,
];

router.get('/college-admin/dashboard', collegeAdminAuth, ctrl.getCollegeAdminDashboard);
router.get('/college-admin/subjects', collegeAdminAuth, ctrl.getCollegeSubjects);
router.post('/college-admin/subjects', collegeAdminAuth, ctrl.addSubject);
router.put('/college-admin/subjects/:id', collegeAdminAuth, ctrl.updateSubject);
router.put('/college-admin/subjects/:id/status', collegeAdminAuth, ctrl.toggleSubjectStatus);

router.get('/college-admin/students', collegeAdminAuth, ctrl.getCollegeStudents);
router.get('/college-admin/students/:studentId/attendance', collegeAdminAuth, ctrl.getStudentAttendanceDetails);
router.get('/college-admin/attendance-reports', collegeAdminAuth, ctrl.getCollegeAttendanceReports);

router.get('/college-admin/complaints', collegeAdminAuth, ctrl.getCollegeComplaints);
router.put('/college-admin/complaints/:id/reply', collegeAdminAuth, ctrl.replyToComplaint);

router.get('/college-admin/settings', collegeAdminAuth, ctrl.getCollegeSettings);
router.put('/college-admin/settings', collegeAdminAuth, ctrl.updateCollegeSettings);

// ==========================================
// 4. STUDENT ROUTES
// ==========================================
const studentAuth = [authenticateAttendanceToken, requireRole('student')];

router.get('/student/dashboard', studentAuth, ctrl.getStudentDashboard);
router.get('/student/subjects', studentAuth, ctrl.getStudentSubjects);
router.put('/student/attendance/:subjectId', studentAuth, ctrl.updateStudentAttendance);
router.get('/student/predictor', studentAuth, ctrl.getStudentPredictor);
router.get('/student/complaints', studentAuth, ctrl.getStudentComplaints);
router.post('/student/complaints', studentAuth, ctrl.submitStudentComplaint);
router.get('/student/profile', studentAuth, ctrl.getStudentProfileInfo);

export default router;
