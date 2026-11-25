import mongoose from 'mongoose';

// 1. Super Admin
const SuperAdminSchema = new mongoose.Schema({
  adminId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'super_admin' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: { type: Date, default: null },
  registrationDate: { type: Date, default: Date.now },
}, { timestamps: true });

// 2. College
const CollegeSchema = new mongoose.Schema({
  collegeId: { type: String, required: true, unique: true },
  collegeName: { type: String, required: true },
  collegeEmail: { type: String, required: true },
  collegeAddress: { type: String, required: true },
  contactNumber: { type: String, required: true },
  collegeSecretCode: { type: String, required: true, unique: true, uppercase: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  registrationDate: { type: Date, default: Date.now },
}, { timestamps: true });

// 3. College Admin
const AdminSchema = new mongoose.Schema({
  adminId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  collegeId: { type: String, required: true, ref: 'College' },
  collegeName: { type: String, required: true },
  collegeSecretCode: { type: String, required: true },
  role: { type: String, default: 'college_admin' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: { type: Date, default: null },
  registrationDate: { type: Date, default: Date.now },
}, { timestamps: true });

// 4. Student
const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  collegeId: { type: String, required: true, ref: 'College' },
  collegeName: { type: String, required: true },
  collegeSecretCode: { type: String, required: true },
  role: { type: String, default: 'student' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: { type: Date, default: null },
  registrationDate: { type: Date, default: Date.now },
}, { timestamps: true });

// 5. Subject
const SubjectSchema = new mongoose.Schema({
  subjectId: { type: String, required: true },
  subjectName: { type: String, required: true },
  collegeId: { type: String, required: true, ref: 'College' },
  plannedClasses: { type: Number, required: true, default: 60 },
  classesConducted: { type: Number, required: true, default: 0 },
  minimumAttendance: { type: Number, required: true, default: 75 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: String, default: 'system' },
}, { timestamps: true });

// 6. Attendance
const AttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  subjectId: { type: String, required: true },
  subjectName: { type: String, required: true },
  collegeId: { type: String, required: true, ref: 'College' },
  classesAttended: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// 7. Complaint
const ComplaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  collegeId: { type: String, required: true, ref: 'College' },
  collegeName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  adminResponse: { type: String, default: '' },
  respondedAt: { type: Date, default: null },
  respondedBy: { type: String, default: '' },
  submissionDate: { type: Date, default: Date.now },
}, { timestamps: true });

// 8. Activity Log
const ActivityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  role: { type: String, required: true },
  target: { type: String, default: '' },
  collegeId: { type: String, default: '' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

export const SuperAdminModel = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema, 'super_admins');
export const CollegeModel = mongoose.models.College || mongoose.model('College', CollegeSchema, 'colleges');
export const AdminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema, 'admins');
export const StudentModel = mongoose.models.Student || mongoose.model('Student', StudentSchema, 'students');
export const SubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema, 'subjects');
export const AttendanceModel = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema, 'attendance');
export const ComplaintModel = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema, 'complaints');
export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema, 'activity_logs');
