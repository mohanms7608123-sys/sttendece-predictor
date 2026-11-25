import dns from 'dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

import { User } from '../server/models/User.js';
import { UserRole } from '../server/models/UserRole.js';
import { AuditLog } from '../server/models/AuditLog.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function updateAdminCredentials() {
  console.log('[*] Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log(`[+] Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  // 1. Identify existing admin accounts
  console.log('\n[*] Identifying current admin accounts...');
  const adminRoles = await UserRole.find({ role: 'admin' });
  console.log(`[+] Found ${adminRoles.length} admin role records:`);

  for (const r of adminRoles) {
    const u = await User.findOne({ id: r.user_id });
    if (u) {
      console.log(`    - Existing Admin User: ${u.email} (ID: ${u.id}, Name: ${u.name})`);
    } else {
      console.log(`    - Orphan Admin Role (User ID: ${r.user_id})`);
    }
  }

  // 2. Target credentials
  const newEmail = 'vijethkr705@gmail.com'.toLowerCase().trim();
  const rawPassword = 'Vijeth@2005';

  // Hash password with bcrypt (10 rounds)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  // 3. Check if user already exists
  let user = await User.findOne({ email: newEmail });

  if (user) {
    console.log(`\n[*] User ${newEmail} already exists. Updating credentials...`);
    user.password = hashedPassword;
    user.name = 'Vijeth (Admin)';
    user.updated_at = new Date();
    await user.save();
    console.log(`[+] Password and name updated securely for ${newEmail}`);
  } else {
    console.log(`\n[*] Creating new admin account for ${newEmail}...`);
    const newUserId = crypto.randomUUID();
    user = await User.create({
      id: newUserId,
      email: newEmail,
      password: hashedPassword,
      name: 'Vijeth (Admin)',
      phone: null,
      usn: null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log(`[+] Created user record for ${newEmail} (ID: ${user.id})`);
  }

  // 4. Ensure admin role is assigned
  let roleDoc = await UserRole.findOne({ user_id: user.id });
  if (roleDoc) {
    roleDoc.role = 'admin';
    await roleDoc.save();
    console.log(`[+] Assigned 'admin' role to ${newEmail}`);
  } else {
    await UserRole.create({
      id: crypto.randomUUID(),
      user_id: user.id,
      role: 'admin',
    });
    console.log(`[+] Created 'admin' role for ${newEmail}`);
  }

  // 5. Deactivate / remove the old default admin 'admin@campusbite.com' if present
  const oldAdmin = await User.findOne({ email: 'admin@campusbite.com' });
  if (oldAdmin && oldAdmin.email !== newEmail) {
    console.log(`\n[*] Deactivating old administrator account (${oldAdmin.email})...`);
    await UserRole.deleteMany({ user_id: oldAdmin.id });
    await User.deleteOne({ id: oldAdmin.id });
    console.log(`[+] Removed old administrator account (${oldAdmin.email})`);
  }

  // 6. Log Audit Log for security compliance
  await AuditLog.create({
    user_id: user.id,
    event_type: 'ADMIN_CREDENTIAL_CHANGE',
    action: `Administrator account updated to ${newEmail}`,
    resource_type: 'user',
    resource_id: user.id,
    status: 'success',
    metadata: { new_admin_email: newEmail, timestamp: new Date().toISOString() },
  });
  console.log('[+] Audit log recorded for admin credential change');

  // 7. Verify all users and roles
  console.log('\n================ CURRENT ACTIVE USERS ================');
  const allUsers = await User.find({});
  for (const u of allUsers) {
    const r = await UserRole.findOne({ user_id: u.id });
    console.log(`  ${u.email.padEnd(30)} | Role: ${(r?.role || 'none').padEnd(15)} | Name: ${u.name}`);
  }
  console.log('======================================================\n');

  await mongoose.disconnect();
}

updateAdminCredentials().catch((err) => {
  console.error('[-] Error updating admin:', err);
  process.exit(1);
});
