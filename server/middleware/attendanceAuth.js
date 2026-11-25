import jwt from 'jsonwebtoken';
import { db } from '../db/attendanceDb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_attendance_predictor_secret_2026';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateAttendanceToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Check account status in database
    let user = null;
    if (decoded.role === 'super_admin') {
      user = db.collection('super_admins').findOne({ _id: decoded.id });
    } else if (decoded.role === 'college_admin') {
      user = db.collection('admins').findOne({ _id: decoded.id });
    } else if (decoded.role === 'student') {
      user = db.collection('students').findOne({ _id: decoded.id });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact your administrator.' });
    }

    // Attach fresh user info
    req.userRecord = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Access restricted to: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

export function enforceCollegeIsolation(req, res, next) {
  // College Admins are strictly scoped to their own collegeId
  if (req.user && req.user.role === 'college_admin') {
    const userCollegeId = req.userRecord.collegeId;
    if (!userCollegeId) {
      return res.status(403).json({ success: false, message: 'No college associated with this administrator.' });
    }
    req.enforcedCollegeId = userCollegeId;
  }
  next();
}
