import bcrypt from 'bcryptjs';
import { db } from '../db/attendanceDb.js';
import { generateToken } from '../middleware/attendanceAuth.js';
import { calculateAttendanceMetrics } from '../utils/attendanceCalculator.js';

// ==========================================
// 1. AUTHENTICATION CONTROLLERS
// ==========================================

// Super Admin Login
export async function superAdminLogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const admin = db.collection('super_admins').findOne({ username: username.trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid Super Admin credentials.' });
    }

    if (admin.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Super Admin account is deactivated.' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Super Admin credentials.' });
    }

    // Update last login
    db.collection('super_admins').updateOne({ _id: admin._id }, { lastLogin: new Date().toISOString() });
    db.logActivity({
      action: 'SUPER_ADMIN_LOGIN',
      performedBy: admin.username,
      role: 'super_admin',
      target: admin.adminId,
    });

    const token = generateToken({
      id: admin._id,
      adminId: admin.adminId,
      username: admin.username,
      fullName: admin.fullName,
      email: admin.email,
      role: 'super_admin',
    });

    return res.json({
      success: true,
      message: 'Super Admin authentication successful.',
      token,
      user: {
        id: admin._id,
        adminId: admin.adminId,
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email,
        role: 'super_admin',
      },
    });
  } catch (err) {
    console.error('Super Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// College Admin Registration
export async function collegeAdminRegister(req, res) {
  try {
    const {
      adminName,
      email,
      password,
      confirmPassword,
      collegeName,
      collegeEmail,
      collegeSecretCode,
    } = req.body;

    if (!adminName || !email || !password || !confirmPassword || !collegeSecretCode) {
      return res.status(400).json({ success: false, message: 'All required registration fields must be provided.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    const normalizedCode = collegeSecretCode.trim().toUpperCase();

    // Check college approval / existence
    const college = db.collection('colleges').findOne({ collegeSecretCode: normalizedCode });
    if (!college) {
      return res.status(400).json({
        success: false,
        message: 'Invalid college code. College must be created and approved by Super Admin first.',
      });
    }

    if (college.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'This college account is currently deactivated. Please contact Super Admin.',
      });
    }

    // Check duplicate admin email
    const existingAdmin = db.collection('admins').findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'An administrator with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newAdmin = db.collection('admins').insertOne({
      adminId: `ADM-${Math.floor(100 + Math.random() * 900)}`,
      fullName: adminName.trim(),
      username: email.split('@')[0],
      email: email.toLowerCase().trim(),
      password: passwordHash,
      collegeId: college.collegeId,
      collegeName: college.collegeName,
      collegeSecretCode: normalizedCode,
      role: 'college_admin',
      status: 'active',
      lastLogin: new Date().toISOString(),
      registrationDate: new Date().toISOString(),
    });

    db.logActivity({
      action: 'COLLEGE_ADMIN_REGISTERED',
      performedBy: newAdmin.email,
      role: 'college_admin',
      target: newAdmin.fullName,
      collegeId: college.collegeId,
      details: { collegeName: college.collegeName, secretCode: normalizedCode },
    });

    const token = generateToken({
      id: newAdmin._id,
      adminId: newAdmin.adminId,
      fullName: newAdmin.fullName,
      email: newAdmin.email,
      collegeId: newAdmin.collegeId,
      collegeName: newAdmin.collegeName,
      collegeSecretCode: newAdmin.collegeSecretCode,
      role: 'college_admin',
    });

    return res.status(201).json({
      success: true,
      message: 'College Admin registered successfully.',
      token,
      user: {
        id: newAdmin._id,
        adminId: newAdmin.adminId,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        collegeId: newAdmin.collegeId,
        collegeName: newAdmin.collegeName,
        collegeSecretCode: newAdmin.collegeSecretCode,
        role: 'college_admin',
      },
    });
  } catch (err) {
    console.error('College Admin registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// College Admin Login
export async function collegeAdminLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = db.collection('admins').findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (admin.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your administrator account has been deactivated.' });
    }

    // Check college status
    const college = db.collection('colleges').findOne({ collegeId: admin.collegeId });
    if (college && college.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your college account is currently deactivated.' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    db.collection('admins').updateOne({ _id: admin._id }, { lastLogin: new Date().toISOString() });
    db.logActivity({
      action: 'COLLEGE_ADMIN_LOGIN',
      performedBy: admin.email,
      role: 'college_admin',
      target: admin.adminId,
      collegeId: admin.collegeId,
    });

    const token = generateToken({
      id: admin._id,
      adminId: admin.adminId,
      fullName: admin.fullName,
      email: admin.email,
      collegeId: admin.collegeId,
      collegeName: admin.collegeName,
      collegeSecretCode: admin.collegeSecretCode,
      role: 'college_admin',
    });

    return res.json({
      success: true,
      message: 'College Admin authentication successful.',
      token,
      user: {
        id: admin._id,
        adminId: admin.adminId,
        fullName: admin.fullName,
        email: admin.email,
        collegeId: admin.collegeId,
        collegeName: admin.collegeName,
        collegeSecretCode: admin.collegeSecretCode,
        role: 'college_admin',
      },
    });
  } catch (err) {
    console.error('College Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// Student Registration
export async function studentRegister(req, res) {
  try {
    const { fullName, email, password, confirmPassword, collegeSecretCode } = req.body;

    if (!collegeSecretCode || !collegeSecretCode.trim()) {
      return res.status(400).json({ success: false, message: 'College registration code is required.' });
    }

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All registration fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const normalizedCode = collegeSecretCode.trim().toUpperCase();
    const college = db.collection('colleges').findOne({ collegeSecretCode: normalizedCode });

    if (!college) {
      return res.status(400).json({
        success: false,
        message: 'Invalid college code. Please contact your college administrator.',
      });
    }

    if (college.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'This college is currently inactive. Student registration is disabled.',
      });
    }

    const existingStudent = db.collection('students').findOne({ email: email.toLowerCase().trim() });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'A student with this email is already registered.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;

    const newStudent = db.collection('students').insertOne({
      studentId,
      fullName: fullName.trim(),
      username: email.split('@')[0],
      email: email.toLowerCase().trim(),
      phone: req.body.phone || '',
      password: passwordHash,
      collegeId: college.collegeId,
      collegeName: college.collegeName,
      collegeSecretCode: normalizedCode,
      role: 'student',
      status: 'active',
      lastLogin: new Date().toISOString(),
      registrationDate: new Date().toISOString(),
    });

    // Automatically assign active subjects belonging to this college
    const collegeSubjects = db.collection('subjects').find({ collegeId: college.collegeId, status: 'active' });
    collegeSubjects.forEach((sub) => {
      db.collection('attendance').insertOne({
        studentId: newStudent.studentId,
        studentName: newStudent.fullName,
        subjectId: sub.subjectId,
        subjectName: sub.subjectName,
        collegeId: college.collegeId,
        classesAttended: 0,
        lastUpdated: new Date().toISOString(),
      });
    });

    db.logActivity({
      action: 'STUDENT_REGISTERED',
      performedBy: newStudent.email,
      role: 'student',
      target: `${newStudent.fullName} (${newStudent.studentId})`,
      collegeId: college.collegeId,
      details: { collegeCode: normalizedCode, assignedSubjects: collegeSubjects.length },
    });

    const token = generateToken({
      id: newStudent._id,
      studentId: newStudent.studentId,
      fullName: newStudent.fullName,
      email: newStudent.email,
      collegeId: newStudent.collegeId,
      collegeName: newStudent.collegeName,
      collegeSecretCode: newStudent.collegeSecretCode,
      role: 'student',
    });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      token,
      user: {
        id: newStudent._id,
        studentId: newStudent.studentId,
        fullName: newStudent.fullName,
        email: newStudent.email,
        collegeId: newStudent.collegeId,
        collegeName: newStudent.collegeName,
        collegeSecretCode: newStudent.collegeSecretCode,
        role: 'student',
      },
    });
  } catch (err) {
    console.error('Student registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// Student Login
export async function studentLogin(req, res) {
  try {
    const { email, password, collegeSecretCode } = req.body;

    if (!email || !password || !collegeSecretCode) {
      return res.status(400).json({ success: false, message: 'Email, password, and College Secret Code are required.' });
    }

    const normalizedCode = collegeSecretCode.trim().toUpperCase();
    const student = db.collection('students').findOne({ email: email.toLowerCase().trim() });

    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (student.collegeSecretCode !== normalizedCode) {
      return res.status(401).json({ success: false, message: 'College secret code does not match student records.' });
    }

    if (student.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Student account has been deactivated. Please contact your college administrator.' });
    }

    // Verify college is active
    const college = db.collection('colleges').findOne({ collegeId: student.collegeId });
    if (college && college.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your college account is currently deactivated.' });
    }

    const isMatch = bcrypt.compareSync(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    db.collection('students').updateOne({ _id: student._id }, { lastLogin: new Date().toISOString() });
    db.logActivity({
      action: 'STUDENT_LOGIN',
      performedBy: student.email,
      role: 'student',
      target: student.studentId,
      collegeId: student.collegeId,
    });

    const token = generateToken({
      id: student._id,
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email,
      collegeId: student.collegeId,
      collegeName: student.collegeName,
      collegeSecretCode: student.collegeSecretCode,
      role: 'student',
    });

    return res.json({
      success: true,
      message: 'Student authentication successful.',
      token,
      user: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        collegeId: student.collegeId,
        collegeName: student.collegeName,
        collegeSecretCode: student.collegeSecretCode,
        role: 'student',
      },
    });
  } catch (err) {
    console.error('Student login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// Get Current User Profile
export async function getMe(req, res) {
  try {
    const user = req.userRecord;
    const safeUser = { ...user };
    delete safeUser.password;
    return res.json({ success: true, user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving user profile.' });
  }
}

// ==========================================
// 2. SUPER ADMIN CONTROLLERS
// ==========================================

export async function getSuperAdminDashboard(req, res) {
  try {
    const totalColleges = db.collection('colleges').count();
    const activeColleges = db.collection('colleges').count({ status: 'active' });
    const totalCollegeAdmins = db.collection('admins').count();
    const totalStudents = db.collection('students').count();
    const activeStudents = db.collection('students').count({ status: 'active' });
    const totalSubjects = db.collection('subjects').count();
    const totalComplaints = db.collection('complaints').count();
    const pendingComplaints = db.collection('complaints').count({ status: 'Pending' });

    // Recent activities
    const recentActivities = db.collection('activity_logs').find().slice(-10).reverse();

    // Prediction summary across all students
    let eligibleCount = 0;
    let atRiskCount = 0;
    let unreachableCount = 0;

    const allStudents = db.collection('students').find();
    allStudents.forEach((student) => {
      const studentAttendance = db.collection('attendance').find({ studentId: student.studentId });
      let studentAtRisk = false;
      let studentUnreachable = false;

      studentAttendance.forEach((att) => {
        const sub = db.collection('subjects').findOne({ subjectId: att.subjectId, collegeId: att.collegeId });
        if (sub) {
          const metrics = calculateAttendanceMetrics({
            plannedClasses: sub.plannedClasses,
            classesConducted: sub.classesConducted,
            classesAttended: att.classesAttended,
            minimumAttendance: sub.minimumAttendance,
          });
          if (metrics.status === 'UNREACHABLE') studentUnreachable = true;
          if (metrics.status === 'AT RISK') studentAtRisk = true;
        }
      });

      if (studentUnreachable) unreachableCount++;
      else if (studentAtRisk) atRiskCount++;
      else eligibleCount++;
    });

    return res.json({
      success: true,
      stats: {
        totalColleges,
        activeColleges,
        totalCollegeAdmins,
        totalStudents,
        activeStudents,
        totalSubjects,
        totalComplaints,
        pendingComplaints,
        eligibleCount,
        atRiskCount,
        unreachableCount,
      },
      recentActivities,
    });
  } catch (err) {
    console.error('Super Admin dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving Super Admin dashboard.' });
  }
}

// College Management
export async function getColleges(req, res) {
  try {
    const colleges = db.collection('colleges').find();
    const collegesWithCounts = colleges.map((col) => {
      const adminCount = db.collection('admins').count({ collegeId: col.collegeId });
      const studentCount = db.collection('students').count({ collegeId: col.collegeId });
      const subjectCount = db.collection('subjects').count({ collegeId: col.collegeId });
      return {
        ...col,
        adminCount,
        studentCount,
        subjectCount,
      };
    });
    return res.json({ success: true, colleges: collegesWithCounts });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving colleges.' });
  }
}

export async function addCollege(req, res) {
  try {
    const { collegeId, collegeName, collegeEmail, collegeAddress, contactNumber, collegeSecretCode } = req.body;

    if (!collegeName || !collegeEmail || !collegeSecretCode) {
      return res.status(400).json({ success: false, message: 'College name, email, and secret code are required.' });
    }

    const normalizedCode = collegeSecretCode.trim().toUpperCase();

    // Check unique secret code
    const existingCode = db.collection('colleges').findOne({ collegeSecretCode: normalizedCode });
    if (existingCode) {
      return res.status(400).json({ success: false, message: 'College secret code must be unique. This code is already in use.' });
    }

    const assignedId = collegeId && collegeId.trim() ? collegeId.trim() : `COL-${Math.floor(100 + Math.random() * 900)}`;

    const newCollege = db.collection('colleges').insertOne({
      collegeId: assignedId,
      collegeName: collegeName.trim(),
      collegeEmail: collegeEmail.trim(),
      collegeAddress: collegeAddress || '',
      contactNumber: contactNumber || '',
      collegeSecretCode: normalizedCode,
      status: 'active',
      registrationDate: new Date().toISOString(),
    });

    db.logActivity({
      action: 'COLLEGE_CREATED',
      performedBy: req.user.username || 'superadmin',
      role: 'super_admin',
      target: `${newCollege.collegeName} (${newCollege.collegeId})`,
      collegeId: newCollege.collegeId,
      details: { secretCode: normalizedCode },
    });

    return res.status(201).json({ success: true, message: 'College registered successfully.', college: newCollege });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error creating college.' });
  }
}

export async function updateCollege(req, res) {
  try {
    const { id } = req.params;
    const { collegeName, collegeEmail, collegeAddress, contactNumber, status } = req.body;

    const college = db.collection('colleges').findOne({ _id: id });
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found.' });
    }

    const updated = db.collection('colleges').updateOne(
      { _id: id },
      {
        collegeName: collegeName !== undefined ? collegeName : college.collegeName,
        collegeEmail: collegeEmail !== undefined ? collegeEmail : college.collegeEmail,
        collegeAddress: collegeAddress !== undefined ? collegeAddress : college.collegeAddress,
        contactNumber: contactNumber !== undefined ? contactNumber : college.contactNumber,
        status: status !== undefined ? status : college.status,
      }
    );

    db.logActivity({
      action: 'COLLEGE_UPDATED',
      performedBy: req.user.username || 'superadmin',
      role: 'super_admin',
      target: `${updated.collegeName} (${updated.collegeId})`,
      collegeId: updated.collegeId,
      details: { status: updated.status },
    });

    return res.json({ success: true, message: 'College updated successfully.', college: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating college.' });
  }
}

// Admin Management
export async function getAdmins(req, res) {
  try {
    const admins = db.collection('admins').find();
    const safeAdmins = admins.map((adm) => ({
      _id: adm._id,
      adminId: adm.adminId,
      fullName: adm.fullName,
      username: adm.username,
      email: adm.email,
      collegeId: adm.collegeId,
      collegeName: adm.collegeName,
      collegeSecretCode: adm.collegeSecretCode,
      password: '****************', // Strictly masked
      registrationDate: adm.registrationDate,
      lastLogin: adm.lastLogin,
      status: adm.status,
    }));
    return res.json({ success: true, admins: safeAdmins });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving administrators.' });
  }
}

export async function getAdminProfile(req, res) {
  try {
    const { id } = req.params;
    const admin = db.collection('admins').findOne({ _id: id });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Administrator not found.' });
    }

    const college = db.collection('colleges').findOne({ collegeId: admin.collegeId });
    const students = db.collection('students').find({ collegeId: admin.collegeId });
    const subjects = db.collection('subjects').find({ collegeId: admin.collegeId });
    const complaints = db.collection('complaints').find({ collegeId: admin.collegeId });

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'active').length;
    const inactiveStudents = totalStudents - activeStudents;

    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter((c) => c.status === 'Pending').length;
    const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;

    const safeStudents = students.map((s) => ({
      studentId: s.studentId,
      fullName: s.fullName,
      email: s.email,
      status: s.status,
      registrationDate: s.registrationDate,
    }));

    return res.json({
      success: true,
      profile: {
        personal: {
          adminId: admin.adminId,
          fullName: admin.fullName,
          username: admin.username,
          email: admin.email,
          collegeName: admin.collegeName,
          registrationDate: admin.registrationDate,
          lastLogin: admin.lastLogin,
          status: admin.status,
        },
        college: {
          collegeId: college ? college.collegeId : admin.collegeId,
          collegeName: college ? college.collegeName : admin.collegeName,
          collegeSecretCode: college ? college.collegeSecretCode : admin.collegeSecretCode,
          collegeEmail: college ? college.collegeEmail : '',
          collegeAddress: college ? college.collegeAddress : '',
          contactNumber: college ? college.contactNumber : '',
        },
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents,
          list: safeStudents,
        },
        subjects: {
          total: subjects.length,
          list: subjects.map((sub) => ({
            subjectId: sub.subjectId,
            subjectName: sub.subjectName,
            plannedClasses: sub.plannedClasses,
            classesConducted: sub.classesConducted,
            minimumAttendance: sub.minimumAttendance,
            status: sub.status,
          })),
        },
        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          resolved: resolvedComplaints,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving administrator profile.' });
  }
}

export async function updateAdminStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.collection('admins').updateOne({ _id: id }, { status });
    if (!updated) return res.status(404).json({ success: false, message: 'Admin not found.' });

    db.logActivity({
      action: 'ADMIN_STATUS_CHANGED',
      performedBy: req.user.username || 'superadmin',
      role: 'super_admin',
      target: `${updated.fullName} (${updated.adminId})`,
      collegeId: updated.collegeId,
      details: { newStatus: status },
    });

    return res.json({ success: true, message: `Admin account set to ${status}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating admin status.' });
  }
}

export async function resetAdminPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    const updated = db.collection('admins').updateOne({ _id: id }, { password: passwordHash });
    if (!updated) return res.status(404).json({ success: false, message: 'Admin not found.' });

    db.logActivity({
      action: 'ADMIN_PASSWORD_RESET',
      performedBy: req.user.username || 'superadmin',
      role: 'super_admin',
      target: `${updated.fullName} (${updated.adminId})`,
      collegeId: updated.collegeId,
    });

    return res.json({ success: true, message: 'Admin password has been reset successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error resetting password.' });
  }
}

// Student Management
export async function getStudents(req, res) {
  try {
    const { search, collegeName } = req.query;
    let students = db.collection('students').find();

    if (collegeName && collegeName.trim()) {
      students = students.filter((s) => s.collegeName.toLowerCase().includes(collegeName.toLowerCase().trim()));
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      students = students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.collegeName.toLowerCase().includes(q)
      );
    }

    const safeStudents = students.map((s) => ({
      _id: s._id,
      studentId: s.studentId,
      fullName: s.fullName,
      username: s.username,
      email: s.email,
      phone: s.phone,
      collegeId: s.collegeId,
      collegeName: s.collegeName,
      collegeSecretCode: s.collegeSecretCode,
      password: '****************', // Strictly masked
      registrationDate: s.registrationDate,
      status: s.status,
    }));

    return res.json({ success: true, students: safeStudents });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving students.' });
  }
}

export async function getStudentProfile(req, res) {
  try {
    const { id } = req.params;
    const student = db.collection('students').findOne({ _id: id }) || db.collection('students').findOne({ studentId: id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const college = db.collection('colleges').findOne({ collegeId: student.collegeId });
    const admin = db.collection('admins').findOne({ collegeId: student.collegeId });
    const attendanceRecords = db.collection('attendance').find({ studentId: student.studentId });
    const complaints = db.collection('complaints').find({ studentId: student.studentId });

    // Compute subject attendance metrics
    const attendanceDetails = attendanceRecords.map((att) => {
      const sub = db.collection('subjects').findOne({ subjectId: att.subjectId, collegeId: att.collegeId });
      const metrics = calculateAttendanceMetrics({
        plannedClasses: sub ? sub.plannedClasses : 0,
        classesConducted: sub ? sub.classesConducted : 0,
        classesAttended: att.classesAttended,
        minimumAttendance: sub ? sub.minimumAttendance : 75,
      });

      return {
        subjectId: att.subjectId,
        subjectName: att.subjectName,
        plannedClasses: metrics.plannedClasses,
        classesConducted: metrics.classesConducted,
        classesAttended: metrics.classesAttended,
        classesMissed: metrics.classesMissed,
        currentAttendancePercentage: metrics.currentAttendance,
        minimumAttendancePercentage: metrics.minimumAttendance,
        remainingClasses: metrics.remainingClasses,
        classesRequired: metrics.classesRequired,
        classesCanBeMissed: metrics.classesCanBeMissed,
        maximumPossibleAttendance: metrics.maxPossibleAttendance,
        attendancePredictionStatus: metrics.status,
        predictionMessage: metrics.message,
      };
    });

    return res.json({
      success: true,
      profile: {
        personal: {
          studentId: student.studentId,
          fullName: student.fullName,
          username: student.username,
          email: student.email,
          phone: student.phone || 'N/A',
          registrationDate: student.registrationDate,
          lastLogin: student.lastLogin,
          status: student.status,
        },
        college: {
          collegeId: student.collegeId,
          collegeName: student.collegeName,
          collegeSecretCode: student.collegeSecretCode,
          associatedAdmin: admin ? admin.fullName : 'College Administration',
          joiningDate: student.registrationDate,
        },
        attendance: attendanceDetails,
        complaints: complaints.map((c) => ({
          complaintId: c.complaintId,
          title: c.title,
          description: c.description,
          submissionDate: c.submissionDate,
          status: c.status,
          adminResponse: c.adminResponse || 'No response yet',
        })),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving student profile.' });
  }
}

export async function updateStudentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.collection('students').updateOne({ _id: id }, { status });
    if (!updated) return res.status(404).json({ success: false, message: 'Student not found.' });

    db.logActivity({
      action: 'STUDENT_STATUS_CHANGED',
      performedBy: req.user.username || 'superadmin',
      role: 'super_admin',
      target: `${updated.fullName} (${updated.studentId})`,
      collegeId: updated.collegeId,
      details: { newStatus: status },
    });

    return res.json({ success: true, message: `Student account set to ${status}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating student status.' });
  }
}

export async function resetStudentPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    const updated = db.collection('students').updateOne({ _id: id }, { password: passwordHash });
    if (!updated) return res.status(404).json({ success: false, message: 'Student not found.' });

    db.logActivity({
      action: 'STUDENT_PASSWORD_RESET',
      performedBy: req.user.username || 'superadmin',
      role: 'super_admin',
      target: `${updated.fullName} (${updated.studentId})`,
      collegeId: updated.collegeId,
    });

    return res.json({ success: true, message: 'Student password reset successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error resetting password.' });
  }
}

// Super Admin Overview endpoints
export async function getSuperAdminSubjects(req, res) {
  try {
    const subjects = db.collection('subjects').find();
    return res.json({ success: true, subjects });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving subjects.' });
  }
}

export async function getSuperAdminAttendanceOverview(req, res) {
  try {
    const attendance = db.collection('attendance').find();
    const overview = attendance.map((att) => {
      const sub = db.collection('subjects').findOne({ subjectId: att.subjectId, collegeId: att.collegeId });
      const metrics = calculateAttendanceMetrics({
        plannedClasses: sub ? sub.plannedClasses : 0,
        classesConducted: sub ? sub.classesConducted : 0,
        classesAttended: att.classesAttended,
        minimumAttendance: sub ? sub.minimumAttendance : 75,
      });
      return {
        ...att,
        metrics,
      };
    });
    return res.json({ success: true, overview });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving attendance overview.' });
  }
}

export async function getSuperAdminComplaints(req, res) {
  try {
    const complaints = db.collection('complaints').find();
    return res.json({ success: true, complaints });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving complaints.' });
  }
}

export async function getSuperAdminReports(req, res) {
  try {
    const colleges = db.collection('colleges').find();
    const reports = colleges.map((col) => {
      const students = db.collection('students').find({ collegeId: col.collegeId });
      const subjects = db.collection('subjects').find({ collegeId: col.collegeId });
      const complaints = db.collection('complaints').find({ collegeId: col.collegeId });

      let atRisk = 0;
      let unreachable = 0;
      let eligible = 0;

      students.forEach((s) => {
        const atts = db.collection('attendance').find({ studentId: s.studentId });
        let isUnreachable = false;
        let isRisk = false;
        atts.forEach((a) => {
          const sub = subjects.find((subItem) => subItem.subjectId === a.subjectId);
          if (sub) {
            const m = calculateAttendanceMetrics({
              plannedClasses: sub.plannedClasses,
              classesConducted: sub.classesConducted,
              classesAttended: a.classesAttended,
              minimumAttendance: sub.minimumAttendance,
            });
            if (m.status === 'UNREACHABLE') isUnreachable = true;
            if (m.status === 'AT RISK') isRisk = true;
          }
        });

        if (isUnreachable) unreachable++;
        else if (isRisk) atRisk++;
        else eligible++;
      });

      return {
        collegeId: col.collegeId,
        collegeName: col.collegeName,
        secretCode: col.collegeSecretCode,
        status: col.status,
        totalStudents: students.length,
        totalSubjects: subjects.length,
        totalComplaints: complaints.length,
        eligible,
        atRisk,
        unreachable,
      };
    });

    return res.json({ success: true, reports });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving reports.' });
  }
}

export async function getActivityLogs(req, res) {
  try {
    const logs = db.collection('activity_logs').find().reverse();
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving activity logs.' });
  }
}

// ==========================================
// 3. COLLEGE ADMIN CONTROLLERS
// ==========================================

export async function getCollegeAdminDashboard(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const students = db.collection('students').find({ collegeId });
    const subjects = db.collection('subjects').find({ collegeId });
    const complaints = db.collection('complaints').find({ collegeId });
    const pendingComplaints = complaints.filter((c) => c.status === 'Pending').length;

    let studentsAtRisk = 0;
    let studentsUnreachable = 0;
    let eligibleStudents = 0;

    students.forEach((student) => {
      const records = db.collection('attendance').find({ studentId: student.studentId, collegeId });
      let hasUnreachable = false;
      let hasRisk = false;

      records.forEach((att) => {
        const sub = subjects.find((s) => s.subjectId === att.subjectId);
        if (sub) {
          const metrics = calculateAttendanceMetrics({
            plannedClasses: sub.plannedClasses,
            classesConducted: sub.classesConducted,
            classesAttended: att.classesAttended,
            minimumAttendance: sub.minimumAttendance,
          });
          if (metrics.status === 'UNREACHABLE') hasUnreachable = true;
          if (metrics.status === 'AT RISK') hasRisk = true;
        }
      });

      if (hasUnreachable) studentsUnreachable++;
      else if (hasRisk) studentsAtRisk++;
      else eligibleStudents++;
    });

    return res.json({
      success: true,
      stats: {
        totalStudents: students.length,
        totalSubjects: subjects.length,
        totalComplaints: complaints.length,
        pendingComplaints,
        studentsAtRisk,
        studentsUnreachable,
        eligibleStudents,
      },
    });
  } catch (err) {
    console.error('College admin dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving dashboard statistics.' });
  }
}

// Subject Management
export async function getCollegeSubjects(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const subjects = db.collection('subjects').find({ collegeId });
    return res.json({ success: true, subjects });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving subjects.' });
  }
}

export async function addSubject(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const { subjectId, subjectName, plannedClasses, classesConducted, minimumAttendance } = req.body;

    if (!subjectId || !subjectName) {
      return res.status(400).json({ success: false, message: 'Subject ID and Subject Name are required.' });
    }

    const existing = db.collection('subjects').findOne({ collegeId, subjectId: subjectId.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A subject with this ID already exists in your college.' });
    }

    const P = Number(plannedClasses) || 60;
    const H = Math.min(P, Number(classesConducted) || 0);
    const M = Number(minimumAttendance) || 75;

    const newSubject = db.collection('subjects').insertOne({
      subjectId: subjectId.trim().toUpperCase(),
      subjectName: subjectName.trim(),
      collegeId,
      plannedClasses: P,
      classesConducted: H,
      minimumAttendance: M,
      status: 'active',
      createdBy: req.user.adminId || req.user.id,
      createdAt: new Date().toISOString(),
    });

    // Auto-assign this new subject to all existing students in this college
    const collegeStudents = db.collection('students').find({ collegeId });
    collegeStudents.forEach((student) => {
      db.collection('attendance').insertOne({
        studentId: student.studentId,
        studentName: student.fullName,
        subjectId: newSubject.subjectId,
        subjectName: newSubject.subjectName,
        collegeId,
        classesAttended: 0,
        lastUpdated: new Date().toISOString(),
      });
    });

    db.logActivity({
      action: 'SUBJECT_CREATED',
      performedBy: req.user.email,
      role: 'college_admin',
      target: `${newSubject.subjectName} (${newSubject.subjectId})`,
      collegeId,
      details: { plannedClasses: P, classesConducted: H, minimumAttendance: M },
    });

    return res.status(201).json({ success: true, message: 'Subject added successfully.', subject: newSubject });
  } catch (err) {
    console.error('Add subject error:', err);
    return res.status(500).json({ success: false, message: 'Error adding subject.' });
  }
}

export async function updateSubject(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const { id } = req.params;
    const { subjectName, plannedClasses, classesConducted, minimumAttendance, status } = req.body;

    const subject = db.collection('subjects').findOne({ _id: id, collegeId });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found in your college.' });
    }

    const updates = {};
    if (subjectName !== undefined) updates.subjectName = subjectName.trim();
    if (plannedClasses !== undefined) updates.plannedClasses = Math.max(0, Number(plannedClasses));
    if (classesConducted !== undefined) {
      const cond = Math.max(0, Number(classesConducted));
      // clamp to planned if planned is known
      const targetPlanned = updates.plannedClasses !== undefined ? updates.plannedClasses : subject.plannedClasses;
      updates.classesConducted = Math.min(targetPlanned, cond);
    }
    if (minimumAttendance !== undefined) updates.minimumAttendance = Math.max(0, Math.min(100, Number(minimumAttendance)));
    if (status !== undefined) updates.status = status;

    const updated = db.collection('subjects').updateOne({ _id: id, collegeId }, updates);

    // If subject name changed, update attendance records too
    if (updates.subjectName) {
      const atts = db.collection('attendance').find({ subjectId: subject.subjectId, collegeId });
      atts.forEach((att) => {
        db.collection('attendance').updateOne({ _id: att._id }, { subjectName: updates.subjectName });
      });
    }

    db.logActivity({
      action: 'SUBJECT_UPDATED',
      performedBy: req.user.email,
      role: 'college_admin',
      target: `${updated.subjectName} (${updated.subjectId})`,
      collegeId,
      details: updates,
    });

    return res.json({ success: true, message: 'Subject updated successfully.', subject: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating subject.' });
  }
}

export async function toggleSubjectStatus(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const { id } = req.params;
    const { status } = req.body;

    const subject = db.collection('subjects').findOne({ _id: id, collegeId });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found in your college.' });
    }

    const updated = db.collection('subjects').updateOne({ _id: id, collegeId }, { status });
    return res.json({ success: true, message: `Subject status updated to ${status}.`, subject: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating subject status.' });
  }
}

// Student Management for College Admin
export async function getCollegeStudents(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const students = db.collection('students').find({ collegeId });
    const subjects = db.collection('subjects').find({ collegeId });

    const studentListWithStatus = students.map((s) => {
      const records = db.collection('attendance').find({ studentId: s.studentId, collegeId });
      let status = 'ELIGIBLE';

      records.forEach((att) => {
        const sub = subjects.find((subItem) => subItem.subjectId === att.subjectId);
        if (sub) {
          const metrics = calculateAttendanceMetrics({
            plannedClasses: sub.plannedClasses,
            classesConducted: sub.classesConducted,
            classesAttended: att.classesAttended,
            minimumAttendance: sub.minimumAttendance,
          });
          if (metrics.status === 'UNREACHABLE') status = 'UNREACHABLE';
          else if (metrics.status === 'AT RISK' && status !== 'UNREACHABLE') status = 'AT RISK';
        }
      });

      return {
        _id: s._id,
        studentId: s.studentId,
        fullName: s.fullName,
        email: s.email,
        registrationDate: s.registrationDate,
        attendanceStatus: status,
        accountStatus: s.status,
        collegeId: s.collegeId,
      };
    });

    return res.json({ success: true, students: studentListWithStatus });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving students.' });
  }
}

export async function getStudentAttendanceDetails(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const { studentId } = req.params;

    const student = db.collection('students').findOne({ studentId, collegeId }) || db.collection('students').findOne({ _id: studentId, collegeId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in your college.' });
    }

    const records = db.collection('attendance').find({ studentId: student.studentId, collegeId });
    const subjects = db.collection('subjects').find({ collegeId });

    const attendanceReports = records.map((att) => {
      const sub = subjects.find((s) => s.subjectId === att.subjectId);
      const metrics = calculateAttendanceMetrics({
        plannedClasses: sub ? sub.plannedClasses : 0,
        classesConducted: sub ? sub.classesConducted : 0,
        classesAttended: att.classesAttended,
        minimumAttendance: sub ? sub.minimumAttendance : 75,
      });

      return {
        subjectId: att.subjectId,
        subjectName: att.subjectName,
        plannedClasses: metrics.plannedClasses,
        classesConducted: metrics.classesConducted,
        classesAttended: metrics.classesAttended,
        classesMissed: metrics.classesMissed,
        currentAttendancePercentage: metrics.currentAttendance,
        minimumAttendancePercentage: metrics.minimumAttendance,
        remainingClasses: metrics.remainingClasses,
        classesRequired: metrics.classesRequired,
        classesCanBeMissed: metrics.classesCanBeMissed,
        maximumPossibleAttendance: metrics.maxPossibleAttendance,
        attendancePredictionStatus: metrics.status,
        predictionMessage: metrics.message,
      };
    });

    return res.json({
      success: true,
      student: {
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        registrationDate: student.registrationDate,
      },
      attendance: attendanceReports,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving student attendance.' });
  }
}

export async function getCollegeAttendanceReports(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const students = db.collection('students').find({ collegeId });
    const subjects = db.collection('subjects').find({ collegeId });

    const reports = students.map((s) => {
      const records = db.collection('attendance').find({ studentId: s.studentId, collegeId });
      let totalConducted = 0;
      let totalAttended = 0;
      let overallStatus = 'ELIGIBLE';

      const subjectBreakdown = records.map((att) => {
        const sub = subjects.find((subItem) => subItem.subjectId === att.subjectId);
        const metrics = calculateAttendanceMetrics({
          plannedClasses: sub ? sub.plannedClasses : 0,
          classesConducted: sub ? sub.classesConducted : 0,
          classesAttended: att.classesAttended,
          minimumAttendance: sub ? sub.minimumAttendance : 75,
        });

        totalConducted += metrics.classesConducted;
        totalAttended += metrics.classesAttended;

        if (metrics.status === 'UNREACHABLE') overallStatus = 'UNREACHABLE';
        else if (metrics.status === 'AT RISK' && overallStatus !== 'UNREACHABLE') overallStatus = 'AT RISK';

        return {
          subjectName: att.subjectName,
          metrics,
        };
      });

      const overallPercentage = totalConducted === 0 ? 100 : Math.round((totalAttended / totalConducted) * 10000) / 100;

      return {
        studentId: s.studentId,
        fullName: s.fullName,
        email: s.email,
        overallPercentage,
        overallStatus,
        subjectsCount: records.length,
        subjectBreakdown,
      };
    });

    return res.json({ success: true, reports });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error generating attendance reports.' });
  }
}

// Complaint Management for College Admin
export async function getCollegeComplaints(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const complaints = db.collection('complaints').find({ collegeId }).reverse();
    return res.json({ success: true, complaints });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving complaints.' });
  }
}

export async function replyToComplaint(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const { id } = req.params;
    const { adminResponse, status } = req.body;

    const complaint = db.collection('complaints').findOne({ _id: id, collegeId });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found in your college.' });
    }

    const updated = db.collection('complaints').updateOne(
      { _id: id, collegeId },
      {
        adminResponse: adminResponse || complaint.adminResponse,
        status: status || complaint.status,
        respondedAt: new Date().toISOString(),
        respondedBy: req.user.fullName || req.user.email,
      }
    );

    db.logActivity({
      action: 'COMPLAINT_REPLIED',
      performedBy: req.user.email,
      role: 'college_admin',
      target: complaint.complaintId,
      collegeId,
      details: { newStatus: updated.status },
    });

    return res.json({ success: true, message: 'Complaint response recorded successfully.', complaint: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error responding to complaint.' });
  }
}

export async function getCollegeSettings(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const college = db.collection('colleges').findOne({ collegeId });
    return res.json({ success: true, college });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving college settings.' });
  }
}

export async function updateCollegeSettings(req, res) {
  try {
    const collegeId = req.enforcedCollegeId;
    const { collegeName, collegeEmail, collegeAddress, contactNumber } = req.body;

    const updated = db.collection('colleges').updateOne(
      { collegeId },
      {
        collegeName,
        collegeEmail,
        collegeAddress,
        contactNumber,
      }
    );

    return res.json({ success: true, message: 'College settings updated successfully.', college: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating settings.' });
  }
}

// ==========================================
// 4. STUDENT CONTROLLERS
// ==========================================

export async function getStudentDashboard(req, res) {
  try {
    const student = req.userRecord;
    const college = db.collection('colleges').findOne({ collegeId: student.collegeId });
    const records = db.collection('attendance').find({ studentId: student.studentId, collegeId: student.collegeId });
    const subjects = db.collection('subjects').find({ collegeId: student.collegeId });

    let totalConducted = 0;
    let totalAttended = 0;
    let subjectsAtRisk = 0;
    let subjectsUnreachable = 0;

    const subjectsSummary = records.map((att) => {
      const sub = subjects.find((s) => s.subjectId === att.subjectId);
      const metrics = calculateAttendanceMetrics({
        plannedClasses: sub ? sub.plannedClasses : 0,
        classesConducted: sub ? sub.classesConducted : 0,
        classesAttended: att.classesAttended,
        minimumAttendance: sub ? sub.minimumAttendance : 75,
      });

      totalConducted += metrics.classesConducted;
      totalAttended += metrics.classesAttended;

      if (metrics.status === 'UNREACHABLE') subjectsUnreachable++;
      else if (metrics.status === 'AT RISK') subjectsAtRisk++;

      return {
        subjectId: att.subjectId,
        subjectName: att.subjectName,
        classesConducted: metrics.classesConducted,
        classesAttended: metrics.classesAttended,
        currentPercentage: metrics.currentAttendance,
        status: metrics.status,
      };
    });

    const overallAttendance = totalConducted === 0 ? 100 : Math.round((totalAttended / totalConducted) * 10000) / 100;

    return res.json({
      success: true,
      studentName: student.fullName,
      studentId: student.studentId,
      collegeName: college ? college.collegeName : student.collegeName,
      collegeSecretCode: student.collegeSecretCode,
      totalSubjects: records.length,
      overallAttendance,
      subjectsAtRisk,
      subjectsUnreachable,
      subjectsSummary,
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving student dashboard.' });
  }
}

export async function getStudentSubjects(req, res) {
  try {
    const student = req.userRecord;
    const records = db.collection('attendance').find({ studentId: student.studentId, collegeId: student.collegeId });
    const subjects = db.collection('subjects').find({ collegeId: student.collegeId });

    const detailedSubjects = records.map((att) => {
      const sub = subjects.find((s) => s.subjectId === att.subjectId);
      const metrics = calculateAttendanceMetrics({
        plannedClasses: sub ? sub.plannedClasses : 0,
        classesConducted: sub ? sub.classesConducted : 0,
        classesAttended: att.classesAttended,
        minimumAttendance: sub ? sub.minimumAttendance : 75,
      });

      return {
        attendanceId: att._id,
        subjectId: att.subjectId,
        subjectName: att.subjectName,
        plannedClasses: metrics.plannedClasses,
        classesConducted: metrics.classesConducted,
        minimumAttendancePercentage: metrics.minimumAttendance,
        classesAttended: metrics.classesAttended,
        classesMissed: metrics.classesMissed,
        currentAttendancePercentage: metrics.currentAttendance,
        remainingClasses: metrics.remainingClasses,
        classesRequired: metrics.classesRequired,
        classesCanBeMissed: metrics.classesCanBeMissed,
        maximumPossibleAttendance: metrics.maxPossibleAttendance,
        attendancePredictionStatus: metrics.status,
        predictionMessage: metrics.message,
      };
    });

    return res.json({ success: true, subjects: detailedSubjects });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving subjects.' });
  }
}

export async function updateStudentAttendance(req, res) {
  try {
    const student = req.userRecord;
    const { subjectId } = req.params;
    const { classesAttended } = req.body;

    if (classesAttended === undefined || isNaN(classesAttended)) {
      return res.status(400).json({ success: false, message: 'Classes attended count must be a valid number.' });
    }

    const attendedNum = Math.max(0, parseInt(classesAttended, 10));

    // Verify subject exists and fetch classes conducted
    const subject = db.collection('subjects').findOne({ subjectId, collegeId: student.collegeId });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Validation: Classes attended cannot exceed classes conducted!
    if (attendedNum > subject.classesConducted) {
      return res.status(400).json({
        success: false,
        message: `Validation error: Classes attended (${attendedNum}) cannot exceed classes conducted (${subject.classesConducted}).`,
      });
    }

    let record = db.collection('attendance').findOne({
      studentId: student.studentId,
      subjectId,
      collegeId: student.collegeId,
    });

    if (record) {
      record = db.collection('attendance').updateOne(
        { _id: record._id },
        { classesAttended: attendedNum, lastUpdated: new Date().toISOString() }
      );
    } else {
      record = db.collection('attendance').insertOne({
        studentId: student.studentId,
        studentName: student.fullName,
        subjectId,
        subjectName: subject.subjectName,
        collegeId: student.collegeId,
        classesAttended: attendedNum,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Recompute metrics
    const metrics = calculateAttendanceMetrics({
      plannedClasses: subject.plannedClasses,
      classesConducted: subject.classesConducted,
      classesAttended: record.classesAttended,
      minimumAttendance: subject.minimumAttendance,
    });

    return res.json({
      success: true,
      message: 'Attendance record updated successfully.',
      attendance: {
        subjectId: record.subjectId,
        subjectName: record.subjectName,
        classesAttended: record.classesAttended,
        ...metrics,
      },
    });
  } catch (err) {
    console.error('Update student attendance error:', err);
    return res.status(500).json({ success: false, message: 'Error updating attendance.' });
  }
}

export async function getStudentPredictor(req, res) {
  try {
    const student = req.userRecord;
    const { subjectId, hypotheticalAttended, hypotheticalRemainingAttended } = req.query;

    const subjects = db.collection('subjects').find({ collegeId: student.collegeId, status: 'active' });

    if (subjectId) {
      const sub = subjects.find((s) => s.subjectId === subjectId);
      if (!sub) return res.status(404).json({ success: false, message: 'Subject not found.' });

      const att = db.collection('attendance').findOne({ studentId: student.studentId, subjectId, collegeId: student.collegeId });
      const currentAttended = att ? att.classesAttended : 0;

      const baseMetrics = calculateAttendanceMetrics({
        plannedClasses: sub.plannedClasses,
        classesConducted: sub.classesConducted,
        classesAttended: currentAttended,
        minimumAttendance: sub.minimumAttendance,
      });

      let simulatedMetrics = null;
      if (hypotheticalRemainingAttended !== undefined) {
        const extraAttended = Math.max(0, parseInt(hypotheticalRemainingAttended, 10));
        const simulatedTotalAttended = Math.min(sub.plannedClasses, currentAttended + extraAttended);
        simulatedMetrics = calculateAttendanceMetrics({
          plannedClasses: sub.plannedClasses,
          classesConducted: Math.min(sub.plannedClasses, sub.classesConducted + extraAttended),
          classesAttended: simulatedTotalAttended,
          minimumAttendance: sub.minimumAttendance,
        });
      }

      return res.json({
        success: true,
        subject: sub,
        currentMetrics: baseMetrics,
        simulatedMetrics,
      });
    }

    // If no subjectId specified, return all subjects with their prediction metrics
    const allPredictions = subjects.map((sub) => {
      const att = db.collection('attendance').findOne({ studentId: student.studentId, subjectId: sub.subjectId, collegeId: student.collegeId });
      const attended = att ? att.classesAttended : 0;
      const metrics = calculateAttendanceMetrics({
        plannedClasses: sub.plannedClasses,
        classesConducted: sub.classesConducted,
        classesAttended: attended,
        minimumAttendance: sub.minimumAttendance,
      });

      return {
        subjectId: sub.subjectId,
        subjectName: sub.subjectName,
        metrics,
      };
    });

    return res.json({ success: true, predictions: allPredictions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error generating predictions.' });
  }
}

export async function getStudentComplaints(req, res) {
  try {
    const student = req.userRecord;
    const complaints = db.collection('complaints').find({ studentId: student.studentId }).reverse();
    return res.json({ success: true, complaints });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving complaints.' });
  }
}

export async function submitStudentComplaint(req, res) {
  try {
    const student = req.userRecord;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Complaint title and description are required.' });
    }

    const complaintId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint = db.collection('complaints').insertOne({
      complaintId,
      studentId: student.studentId,
      studentName: student.fullName,
      studentEmail: student.email,
      collegeId: student.collegeId,
      collegeName: student.collegeName,
      title: title.trim(),
      description: description.trim(),
      status: 'Pending',
      adminResponse: '',
      respondedAt: null,
      respondedBy: '',
      submissionDate: new Date().toISOString(),
    });

    db.logActivity({
      action: 'COMPLAINT_SUBMITTED',
      performedBy: student.email,
      role: 'student',
      target: newComplaint.complaintId,
      collegeId: student.collegeId,
      details: { title: newComplaint.title },
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint: newComplaint,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error submitting complaint.' });
  }
}

export async function getStudentProfileInfo(req, res) {
  try {
    const student = req.userRecord;
    const college = db.collection('colleges').findOne({ collegeId: student.collegeId });
    const admin = db.collection('admins').findOne({ collegeId: student.collegeId });

    return res.json({
      success: true,
      profile: {
        studentId: student.studentId,
        fullName: student.fullName,
        username: student.username,
        email: student.email,
        phone: student.phone || '',
        collegeId: student.collegeId,
        collegeName: student.collegeName,
        collegeSecretCode: student.collegeSecretCode,
        associatedAdmin: admin ? admin.fullName : 'College Administration',
        registrationDate: student.registrationDate,
        lastLogin: student.lastLogin,
        status: student.status,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving student profile.' });
  }
}
