import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getMongoConnectionStatus } from '../config/db.js';
import {
  SuperAdminModel,
  CollegeModel,
  AdminModel,
  StudentModel,
  SubjectModel,
  AttendanceModel,
  ComplaintModel,
  ActivityLogModel,
} from '../models/attendanceModels.js';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DATA_FILE = path.join(DATA_DIR, 'attendance_store.json');

// Memory cache for embedded store
let inMemoryStore = null;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadEmbeddedData() {
  ensureDataDirectory();
  if (inMemoryStore) return inMemoryStore;

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryStore = JSON.parse(raw);
      return inMemoryStore;
    } catch (err) {
      console.error('Error reading attendance store, reinitializing:', err.message);
    }
  }

  // Generate initial seeds
  const defaultSalt = bcrypt.genSaltSync(10);
  const superAdminPasswordHash = bcrypt.hashSync('Admin@12345', defaultSalt);
  const collegeAdminPasswordHash = bcrypt.hashSync('Admin@12345', defaultSalt);
  const studentPasswordHash = bcrypt.hashSync('Student@12345', defaultSalt);

  const initialData = {
    super_admins: [
      {
        _id: 'sa_01',
        adminId: 'SA-001',
        username: 'superadmin',
        fullName: 'System Super Administrator',
        email: 'superadmin@attendance.gov',
        password: superAdminPasswordHash,
        role: 'super_admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        registrationDate: new Date('2026-01-01').toISOString(),
      },
    ],
    colleges: [
      {
        _id: 'col_01',
        collegeId: 'COL-101',
        collegeName: 'Apex Institute of Technology',
        collegeEmail: 'contact@apex.edu',
        collegeAddress: '42 Academic Avenue, Tech District, CA',
        contactNumber: '+1 (555) 234-5678',
        collegeSecretCode: 'APEX2026',
        status: 'active',
        registrationDate: new Date('2026-01-10').toISOString(),
      },
      {
        _id: 'col_02',
        collegeId: 'COL-102',
        collegeName: 'Metro Global University',
        collegeEmail: 'info@metro.edu',
        collegeAddress: '100 University Plaza, Metro City, NY',
        contactNumber: '+1 (555) 876-5432',
        collegeSecretCode: 'METRO2026',
        status: 'active',
        registrationDate: new Date('2026-01-15').toISOString(),
      },
    ],
    admins: [
      {
        _id: 'adm_01',
        adminId: 'ADM-101',
        fullName: 'Dr. Robert Chen',
        username: 'robert_chen',
        email: 'admin@apex.edu',
        password: collegeAdminPasswordHash,
        collegeId: 'COL-101',
        collegeName: 'Apex Institute of Technology',
        collegeSecretCode: 'APEX2026',
        role: 'college_admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        registrationDate: new Date('2026-01-12').toISOString(),
      },
      {
        _id: 'adm_02',
        adminId: 'ADM-102',
        fullName: 'Prof. Sarah Jenkins',
        username: 'sarah_jenkins',
        email: 'admin@metro.edu',
        password: collegeAdminPasswordHash,
        collegeId: 'COL-102',
        collegeName: 'Metro Global University',
        collegeSecretCode: 'METRO2026',
        role: 'college_admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        registrationDate: new Date('2026-01-16').toISOString(),
      },
    ],
    subjects: [
      {
        _id: 'sub_01',
        subjectId: 'CS-101',
        subjectName: 'Data Structures & Algorithms',
        collegeId: 'COL-101',
        plannedClasses: 60,
        classesConducted: 40,
        minimumAttendance: 75,
        status: 'active',
        createdBy: 'ADM-101',
        createdAt: new Date('2026-01-20').toISOString(),
      },
      {
        _id: 'sub_02',
        subjectId: 'CS-102',
        subjectName: 'Database Management Systems',
        collegeId: 'COL-101',
        plannedClasses: 50,
        classesConducted: 36,
        minimumAttendance: 80,
        status: 'active',
        createdBy: 'ADM-101',
        createdAt: new Date('2026-01-20').toISOString(),
      },
      {
        _id: 'sub_03',
        subjectId: 'CS-103',
        subjectName: 'Operating Systems',
        collegeId: 'COL-101',
        plannedClasses: 55,
        classesConducted: 38,
        minimumAttendance: 75,
        status: 'active',
        createdBy: 'ADM-101',
        createdAt: new Date('2026-01-20').toISOString(),
      },
      {
        _id: 'sub_04',
        subjectId: 'CS-104',
        subjectName: 'Artificial Intelligence & ML',
        collegeId: 'COL-101',
        plannedClasses: 60,
        classesConducted: 42,
        minimumAttendance: 75,
        status: 'active',
        createdBy: 'ADM-101',
        createdAt: new Date('2026-01-20').toISOString(),
      },
      {
        _id: 'sub_05',
        subjectId: 'MTH-201',
        subjectName: 'Linear Algebra & Probability',
        collegeId: 'COL-102',
        plannedClasses: 60,
        classesConducted: 35,
        minimumAttendance: 75,
        status: 'active',
        createdBy: 'ADM-102',
        createdAt: new Date('2026-01-22').toISOString(),
      },
    ],
    students: [
      {
        _id: 'stu_01',
        studentId: 'STU-1001',
        fullName: 'Alex Rivera',
        username: 'alex_rivera',
        email: 'alex@apex.edu',
        phone: '+1 (555) 123-9988',
        password: studentPasswordHash,
        collegeId: 'COL-101',
        collegeName: 'Apex Institute of Technology',
        collegeSecretCode: 'APEX2026',
        role: 'student',
        status: 'active',
        lastLogin: new Date().toISOString(),
        registrationDate: new Date('2026-01-25').toISOString(),
      },
      {
        _id: 'stu_02',
        studentId: 'STU-1002',
        fullName: 'Priya Sharma',
        username: 'priya_sharma',
        email: 'priya@apex.edu',
        phone: '+1 (555) 456-1122',
        password: studentPasswordHash,
        collegeId: 'COL-101',
        collegeName: 'Apex Institute of Technology',
        collegeSecretCode: 'APEX2026',
        role: 'student',
        status: 'active',
        lastLogin: new Date().toISOString(),
        registrationDate: new Date('2026-01-26').toISOString(),
      },
      {
        _id: 'stu_03',
        studentId: 'STU-1003',
        fullName: 'Marcus Lee',
        username: 'marcus_lee',
        email: 'marcus@apex.edu',
        phone: '+1 (555) 789-3344',
        password: studentPasswordHash,
        collegeId: 'COL-101',
        collegeName: 'Apex Institute of Technology',
        collegeSecretCode: 'APEX2026',
        role: 'student',
        status: 'active',
        lastLogin: new Date().toISOString(),
        registrationDate: new Date('2026-01-28').toISOString(),
      },
      {
        _id: 'stu_04',
        studentId: 'STU-2001',
        fullName: 'Ananya Patel',
        username: 'ananya_patel',
        email: 'ananya@metro.edu',
        phone: '+1 (555) 678-5544',
        password: studentPasswordHash,
        collegeId: 'COL-102',
        collegeName: 'Metro Global University',
        collegeSecretCode: 'METRO2026',
        role: 'student',
        status: 'active',
        lastLogin: new Date().toISOString(),
        registrationDate: new Date('2026-02-01').toISOString(),
      },
    ],
    attendance: [
      // Alex Rivera (Consistent high attendance - ELIGIBLE)
      {
        _id: 'att_01',
        studentId: 'STU-1001',
        studentName: 'Alex Rivera',
        subjectId: 'CS-101',
        subjectName: 'Data Structures & Algorithms',
        collegeId: 'COL-101',
        classesAttended: 38, // 38/40 = 95%
        lastUpdated: new Date().toISOString(),
      },
      {
        _id: 'att_02',
        studentId: 'STU-1001',
        studentName: 'Alex Rivera',
        subjectId: 'CS-102',
        subjectName: 'Database Management Systems',
        collegeId: 'COL-101',
        classesAttended: 33, // 33/36 = 91.6%
        lastUpdated: new Date().toISOString(),
      },
      {
        _id: 'att_03',
        studentId: 'STU-1001',
        studentName: 'Alex Rivera',
        subjectId: 'CS-103',
        subjectName: 'Operating Systems',
        collegeId: 'COL-101',
        classesAttended: 35, // 35/38 = 92.1%
        lastUpdated: new Date().toISOString(),
      },
      {
        _id: 'att_04',
        studentId: 'STU-1001',
        studentName: 'Alex Rivera',
        subjectId: 'CS-104',
        subjectName: 'Artificial Intelligence & ML',
        collegeId: 'COL-101',
        classesAttended: 39, // 39/42 = 92.8%
        lastUpdated: new Date().toISOString(),
      },

      // Priya Sharma (Moderate attendance - AT RISK in CS-101)
      {
        _id: 'att_05',
        studentId: 'STU-1002',
        studentName: 'Priya Sharma',
        subjectId: 'CS-101',
        subjectName: 'Data Structures & Algorithms',
        collegeId: 'COL-101',
        classesAttended: 27, // 27/40 = 67.5% (Req: 45, remaining: 20, needed: 18 -> At Risk)
        lastUpdated: new Date().toISOString(),
      },
      {
        _id: 'att_06',
        studentId: 'STU-1002',
        studentName: 'Priya Sharma',
        subjectId: 'CS-102',
        subjectName: 'Database Management Systems',
        collegeId: 'COL-101',
        classesAttended: 30, // 30/36 = 83.3% -> Eligible
        lastUpdated: new Date().toISOString(),
      },
      {
        _id: 'att_07',
        studentId: 'STU-1002',
        studentName: 'Priya Sharma',
        subjectId: 'CS-103',
        subjectName: 'Operating Systems',
        collegeId: 'COL-101',
        classesAttended: 32, // 32/38 = 84.2% -> Eligible
        lastUpdated: new Date().toISOString(),
      },
      {
        _id: 'att_08',
        studentId: 'STU-1002',
        studentName: 'Priya Sharma',
        subjectId: 'CS-104',
        subjectName: 'Artificial Intelligence & ML',
        collegeId: 'COL-101',
        classesAttended: 35, // 35/42 = 83.3% -> Eligible
        lastUpdated: new Date().toISOString(),
      },

      // Marcus Lee (Low attendance - UNREACHABLE in CS-102, AT RISK in CS-101)
      {
        _id: 'att_09',
        studentId: 'STU-1003',
        studentName: 'Marcus Lee',
        subjectId: 'CS-101',
        subjectName: 'Data Structures & Algorithms',
        collegeId: 'COL-101',
        classesAttended: 26, // 26/40 = 65% (Req: 45, remaining: 20, needed: 19 -> At Risk)
        lastUpdated: new Date().toISOString(),
      },
      {
        _id: 'att_10',
        studentId: 'STU-1003',
        studentName: 'Marcus Lee',
        subjectId: 'CS-102',
        subjectName: 'Database Management Systems',
        collegeId: 'COL-101',
        // P=50, H=36, M=80% -> Required Attendance = 40. Remaining classes = 50 - 36 = 14.
        // If attended = 22, max possible = 22 + 14 = 36 < 40! UNREACHABLE!
        classesAttended: 22,
        lastUpdated: new Date().toISOString(),
      },
      {
        _id: 'att_11',
        studentId: 'STU-1003',
        studentName: 'Marcus Lee',
        subjectId: 'CS-103',
        subjectName: 'Operating Systems',
        collegeId: 'COL-101',
        classesAttended: 28, // 28/38 = 73.6% (Req: 42, remaining: 17, needed: 14 -> At Risk)
        lastUpdated: new Date().toISOString(),
      },
      {
        _id: 'att_12',
        studentId: 'STU-1003',
        studentName: 'Marcus Lee',
        subjectId: 'CS-104',
        subjectName: 'Artificial Intelligence & ML',
        collegeId: 'COL-101',
        classesAttended: 34, // 34/42 = 80.9%
        lastUpdated: new Date().toISOString(),
      },

      // Ananya Patel (Metro Global Univ)
      {
        _id: 'att_13',
        studentId: 'STU-2001',
        studentName: 'Ananya Patel',
        subjectId: 'MTH-201',
        subjectName: 'Linear Algebra & Probability',
        collegeId: 'COL-102',
        classesAttended: 31, // 31/35 = 88.5%
        lastUpdated: new Date().toISOString(),
      },
    ],
    complaints: [
      {
        _id: 'cmp_01',
        complaintId: 'CMP-1001',
        studentId: 'STU-1002',
        studentName: 'Priya Sharma',
        studentEmail: 'priya@apex.edu',
        collegeId: 'COL-101',
        collegeName: 'Apex Institute of Technology',
        title: 'Medical Leave Attendance Discrepancy in DSA',
        description: 'I was hospitalized for viral fever from Feb 10 to Feb 14 and submitted my medical certificate. Two classes were not marked as excused attendance.',
        status: 'In Progress',
        adminResponse: 'Medical certificate received and verified with health center. Updating records with course instructor.',
        respondedAt: new Date('2026-02-18').toISOString(),
        respondedBy: 'Dr. Robert Chen',
        submissionDate: new Date('2026-02-15').toISOString(),
      },
      {
        _id: 'cmp_02',
        complaintId: 'CMP-1002',
        studentId: 'STU-1003',
        studentName: 'Marcus Lee',
        studentEmail: 'marcus@apex.edu',
        collegeId: 'COL-101',
        collegeName: 'Apex Institute of Technology',
        title: 'Need guidance for DBMS Unreachable attendance target',
        description: 'Due to family emergency I missed classes and my target is marked as unreachable. Can I apply for remedial sessions or extra assignment credits?',
        status: 'Pending',
        adminResponse: '',
        respondedAt: null,
        respondedBy: '',
        submissionDate: new Date('2026-02-20').toISOString(),
      },
      {
        _id: 'cmp_03',
        complaintId: 'CMP-1003',
        studentId: 'STU-2001',
        studentName: 'Ananya Patel',
        studentEmail: 'ananya@metro.edu',
        collegeId: 'COL-102',
        collegeName: 'Metro Global University',
        title: 'Attendance synchronization delay after lab class',
        description: 'Lab class on Tuesday was not reflected in the conducted count immediately.',
        status: 'Resolved',
        adminResponse: 'Lab attendance synced successfully. Your overall percentage is updated.',
        respondedAt: new Date('2026-02-12').toISOString(),
        respondedBy: 'Prof. Sarah Jenkins',
        submissionDate: new Date('2026-02-10').toISOString(),
      },
    ],
    activity_logs: [
      {
        _id: 'act_01',
        action: 'COLLEGE_REGISTERED',
        performedBy: 'superadmin',
        role: 'super_admin',
        target: 'Apex Institute of Technology (COL-101)',
        collegeId: 'COL-101',
        details: { code: 'APEX2026' },
        timestamp: new Date('2026-01-10').toISOString(),
      },
      {
        _id: 'act_02',
        action: 'COLLEGE_ADMIN_REGISTERED',
        performedBy: 'admin@apex.edu',
        role: 'college_admin',
        target: 'Dr. Robert Chen',
        collegeId: 'COL-101',
        details: { adminId: 'ADM-101' },
        timestamp: new Date('2026-01-12').toISOString(),
      },
      {
        _id: 'act_03',
        action: 'SUBJECT_CREATED',
        performedBy: 'admin@apex.edu',
        role: 'college_admin',
        target: 'Data Structures & Algorithms (CS-101)',
        collegeId: 'COL-101',
        details: { planned: 60, minAttendance: 75 },
        timestamp: new Date('2026-01-20').toISOString(),
      },
      {
        _id: 'act_04',
        action: 'STUDENT_REGISTERED',
        performedBy: 'alex@apex.edu',
        role: 'student',
        target: 'Alex Rivera (STU-1001)',
        collegeId: 'COL-101',
        details: { collegeCode: 'APEX2026' },
        timestamp: new Date('2026-01-25').toISOString(),
      },
    ],
  };

  inMemoryStore = initialData;
  saveEmbeddedData();
  return inMemoryStore;
}

function saveEmbeddedData() {
  ensureDataDirectory();
  if (!inMemoryStore) return;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving attendance store:', err.message);
  }
}

// Database collection accessors
export const db = {
  // Query helper
  collection(name) {
    const data = loadEmbeddedData();
    if (!data[name]) {
      data[name] = [];
    }
    return {
      find(filter = {}) {
        return data[name].filter((item) => {
          for (const key of Object.keys(filter)) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
      },
      findOne(filter = {}) {
        return data[name].find((item) => {
          for (const key of Object.keys(filter)) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        }) || null;
      },
      insertOne(doc) {
        const item = {
          _id: doc._id || `id_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          createdAt: doc.createdAt || new Date().toISOString(),
          ...doc,
        };
        data[name].push(item);
        saveEmbeddedData();
        return item;
      },
      updateOne(filter, update) {
        const item = this.findOne(filter);
        if (!item) return null;
        const updates = update.$set ? update.$set : update;
        Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        saveEmbeddedData();
        return item;
      },
      deleteOne(filter) {
        const idx = data[name].findIndex((item) => {
          for (const key of Object.keys(filter)) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
        if (idx !== -1) {
          const removed = data[name].splice(idx, 1)[0];
          saveEmbeddedData();
          return removed;
        }
        return null;
      },
      count(filter = {}) {
        return this.find(filter).length;
      },
    };
  },

  // Helper to log an activity
  logActivity({ action, performedBy, role, target = '', collegeId = '', details = {} }) {
    return this.collection('activity_logs').insertOne({
      action,
      performedBy,
      role,
      target,
      collegeId,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

// Seed check on module load
loadEmbeddedData();
