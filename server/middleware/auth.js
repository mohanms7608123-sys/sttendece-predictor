import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { UserRole } from '../models/UserRole.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campusbite_jwt_secret_production_2026_modern_food_tech';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(401).json({ error: 'User not found or token expired' });
    }

    const roleDoc = await UserRole.findOne({ user_id: user.id });
    req.user = user;
    req.role = roleDoc ? roleDoc.role : 'student';
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    User.findOne({ id: decoded.id }).then(async (user) => {
      if (user) {
        const roleDoc = await UserRole.findOne({ user_id: user.id });
        req.user = user;
        req.role = roleDoc ? roleDoc.role : 'student';
      }
      next();
    }).catch(() => next());
  } catch (err) {
    next();
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
