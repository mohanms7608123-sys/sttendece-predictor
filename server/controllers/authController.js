import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { UserRole } from '../models/UserRole.js';
import { AuditLog } from '../models/AuditLog.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campusbite_jwt_secret_production_2026_modern_food_tech';

export async function signUp(req, res) {
  try {
    const { email, password, name, phone, usn, role = 'student' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = crypto.randomUUID();

    const user = new User({
      id: userId,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      phone: phone || null,
      usn: usn ? usn.trim().toUpperCase() : null,
    });

    await user.save();

    const userRole = new UserRole({
      id: crypto.randomUUID(),
      user_id: userId,
      role: ['student', 'canteen_owner', 'admin'].includes(role) ? role : 'student',
    });

    await userRole.save();

    // Log audit log
    await AuditLog.create({
      user_id: userId,
      event_type: 'AUTH_REGISTER',
      action: 'User registered successfully',
      resource_type: 'user',
      resource_id: userId,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      metadata: { email: user.email, role: userRole.role },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    const userJson = user.toJSON();
    const profile = {
      id: user.id,
      user_id: user.id,
      name: user.name,
      phone: user.phone,
      usn: user.usn,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { name: user.name, phone: user.phone, usn: user.usn },
      },
      session: {
        access_token: token,
        token_type: 'bearer',
        user: {
          id: user.id,
          email: user.email,
        },
      },
      profile,
      role: userRole.role,
    });
  } catch (error) {
    console.error('SignUp Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during registration' });
  }
}

export async function signIn(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const roleDoc = await UserRole.findOne({ user_id: user.id });
    const role = roleDoc ? roleDoc.role : 'student';

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    // Log audit log
    await AuditLog.create({
      user_id: user.id,
      event_type: 'AUTH_LOGIN',
      action: 'User signed in',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    const profile = {
      id: user.id,
      user_id: user.id,
      name: user.name,
      phone: user.phone,
      usn: user.usn,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { name: user.name, phone: user.phone, usn: user.usn },
      },
      session: {
        access_token: token,
        token_type: 'bearer',
        user: {
          id: user.id,
          email: user.email,
        },
      },
      profile,
      role,
    });
  } catch (error) {
    console.error('SignIn Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during login' });
  }
}

export async function getMe(req, res) {
  try {
    const user = req.user;
    const role = req.role;

    const profile = {
      id: user.id,
      user_id: user.id,
      name: user.name,
      phone: user.phone,
      usn: user.usn,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { name: user.name, phone: user.phone, usn: user.usn },
      },
      profile,
      role,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, phone, usn } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (usn !== undefined) user.usn = usn ? usn.trim().toUpperCase() : null;
    user.updated_at = new Date();

    await user.save();

    const profile = {
      id: user.id,
      user_id: user.id,
      name: user.name,
      phone: user.phone,
      usn: user.usn,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return res.json({ profile });
  } catch (error) {
    console.error('UpdateProfile Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
