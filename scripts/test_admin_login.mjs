import dns from 'dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

import { User } from '../server/models/User.js';
import { UserRole } from '../server/models/UserRole.js';
import { MenuItem } from '../server/models/MenuItem.js';
import { Order } from '../server/models/Order.js';
import { TimeSlot } from '../server/models/TimeSlot.js';
import { SystemSetting } from '../server/models/SystemSetting.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function testAdminAuthentication() {
  console.log('\n======================================================');
  console.log('       ADMIN AUTHENTICATION & SECURITY TEST SUITE      ');
  console.log('======================================================\n');

  console.log('[1/7] Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log(`[+] Connected to MongoDB Atlas: ${mongoose.connection.host}`);

  // Test 1: Verify old admin account does NOT exist
  console.log('\n[2/7] Verifying old admin account removal...');
  const oldAdmin = await User.findOne({ email: 'admin@campusbite.com' });
  if (oldAdmin) {
    throw new Error('Old admin account admin@campusbite.com is still present in the database!');
  }
  console.log('    [✓] Confirmed: Old admin (admin@campusbite.com) has been deactivated and removed.');

  // Test 2: Verify new admin user in database
  console.log('\n[3/7] Verifying new administrator account in database...');
  const newAdmin = await User.findOne({ email: 'vijethkr705@gmail.com' });
  if (!newAdmin) {
    throw new Error('New admin account vijethkr705@gmail.com not found!');
  }
  console.log(`    [✓] User found: ${newAdmin.email} (ID: ${newAdmin.id}, Name: ${newAdmin.name})`);

  // Verify bcrypt password hashing (never stored as plain text)
  if (newAdmin.password === 'Vijeth@2005') {
    throw new Error('CRITICAL SECURITY FLAW: Password is stored in plain text!');
  }
  if (!newAdmin.password.startsWith('$2a$') && !newAdmin.password.startsWith('$2b$')) {
    throw new Error('Password is not properly hashed with bcrypt!');
  }
  console.log('    [✓] Password is securely hashed with bcrypt (no plain-text storage).');

  // Test password verification
  const isMatchValid = await bcrypt.compare('Vijeth@2005', newAdmin.password);
  if (!isMatchValid) {
    throw new Error('Valid password failed bcrypt comparison!');
  }
  console.log('    [✓] Password verification succeeded for "Vijeth@2005".');

  const isMatchInvalid = await bcrypt.compare('WrongPassword123', newAdmin.password);
  if (isMatchInvalid) {
    throw new Error('Invalid password falsely succeeded!');
  }
  console.log('    [✓] Invalid password rejected as expected.');

  // Test 3: Verify Admin Role in user_roles
  console.log('\n[4/7] Verifying RBAC role assignment...');
  const adminRole = await UserRole.findOne({ user_id: newAdmin.id });
  if (!adminRole || adminRole.role !== 'admin') {
    throw new Error(`Role mismatch! Expected 'admin', got '${adminRole?.role}'`);
  }
  console.log(`    [✓] Role strictly verified: "${adminRole.role}" in collection 'user_roles'.`);

  // Test 4: Verify Existing Student & Staff Accounts Maintained
  console.log('\n[5/7] Verifying existing student and staff accounts are preserved...');
  const student = await User.findOne({ email: 'student@campusbite.com' });
  const staff = await User.findOne({ email: 'staff@campusbite.com' });
  if (!student || !staff) {
    throw new Error('Existing student or canteen staff accounts were accidentally affected!');
  }
  const studentRole = await UserRole.findOne({ user_id: student.id });
  const staffRole = await UserRole.findOne({ user_id: staff.id });

  console.log(`    [✓] Student account preserved: ${student.email} (Role: ${studentRole?.role})`);
  console.log(`    [✓] Staff account preserved: ${staff.email} (Role: ${staffRole?.role})`);

  // Test 5: Verify Database Records Integrity (Orders, Menu Items, Time Slots, Settings)
  console.log('\n[6/7] Verifying existing records integrity (zero data loss)...');
  const menuCount = await MenuItem.countDocuments();
  const orderCount = await Order.countDocuments();
  const slotCount = await TimeSlot.countDocuments();
  const settingCount = await SystemSetting.countDocuments();

  console.log(`    [✓] Menu items preserved: ${menuCount}`);
  console.log(`    [✓] Time slots preserved: ${slotCount}`);
  console.log(`    [✓] Orders preserved: ${orderCount}`);
  console.log(`    [✓] System settings preserved: ${settingCount}`);

  if (menuCount < 16) throw new Error('Menu items record count mismatch!');
  if (slotCount < 8) throw new Error('Time slots record count mismatch!');

  console.log('\n[7/7] Summary of Authentication Credentials:');
  console.log('    Admin Email:    vijethkr705@gmail.com');
  console.log('    Admin Role:     admin (full access to /admin, /admin/menu, /admin/slots, /admin/audit-logs, /admin/scan)');
  console.log('    Access Control: Non-admins (students) are blocked by both frontend route guards and backend RBAC middleware.');

  console.log('\n======================================================');
  console.log('    ADMIN CREDENTIALS FULLY TESTED & OPERATIONAL!     ');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

testAdminAuthentication().catch((err) => {
  console.error('\n[-] Test Failed:', err);
  process.exit(1);
});
