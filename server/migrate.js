import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { UserRole } from './models/UserRole.js';
import { MenuItem } from './models/MenuItem.js';
import { TimeSlot } from './models/TimeSlot.js';
import { Order } from './models/Order.js';
import { OrderItem } from './models/OrderItem.js';
import { Payment } from './models/Payment.js';
import { PushSubscription } from './models/PushSubscription.js';
import { AuditLog } from './models/AuditLog.js';
import { RateLimit } from './models/RateLimit.js';
import { SystemSetting } from './models/SystemSetting.js';
import { Rating } from './models/Rating.js';

async function migrate() {
  console.log('[*] Connecting to MongoDB Atlas for migration...');
  await connectDB();

  const backupPath = path.join(process.cwd(), 'backup', 'supabase_backup_1795021822465.json');
  if (!fs.existsSync(backupPath)) {
    console.error('[-] Backup file not found at:', backupPath);
    process.exit(1);
  }

  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log('[+] Loaded backup data containing:');
  for (const key of Object.keys(backupData)) {
    console.log(`    - ${key}: ${backupData[key].length} records`);
  }

  // 1. Migrate menu_items
  if (backupData.menu_items && backupData.menu_items.length > 0) {
    console.log('[*] Migrating menu items...');
    for (const item of backupData.menu_items) {
      await MenuItem.findOneAndUpdate(
        { id: item.id },
        {
          $set: {
            name: item.name,
            price: item.price,
            image_url: item.image_url,
            prep_time: item.prep_time || 10,
            is_available: item.is_available !== undefined ? item.is_available : true,
            category: item.category,
            is_veg: item.is_veg || false,
            created_at: item.created_at ? new Date(item.created_at) : new Date(),
            updated_at: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    }
    console.log(`[+] Migrated ${backupData.menu_items.length} menu items.`);
  }

  // 2. Migrate time_slots
  if (backupData.time_slots && backupData.time_slots.length > 0) {
    console.log('[*] Migrating time slots...');
    for (const slot of backupData.time_slots) {
      await TimeSlot.findOneAndUpdate(
        { id: slot.id },
        {
          $set: {
            start_time: slot.start_time,
            end_time: slot.end_time,
            max_orders: slot.max_orders,
            current_orders: slot.current_orders || 0,
            is_active: slot.is_active !== undefined ? slot.is_active : true,
            slot_date: slot.slot_date,
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    }
    console.log(`[+] Migrated ${backupData.time_slots.length} time slots.`);
  }

  // Also ensure today's time slots exist for immediate order testing
  const today = new Date().toISOString().split('T')[0];
  const todaySlots = await TimeSlot.find({ slot_date: today });
  if (todaySlots.length === 0) {
    const defaultSlots = [
      { start_time: '10:00:00', end_time: '11:00:00', max_orders: 50, slot_date: today },
      { start_time: '11:00:00', end_time: '12:00:00', max_orders: 50, slot_date: today },
      { start_time: '12:00:00', end_time: '13:00:00', max_orders: 100, slot_date: today },
      { start_time: '13:00:00', end_time: '14:00:00', max_orders: 100, slot_date: today },
      { start_time: '14:00:00', end_time: '15:00:00', max_orders: 50, slot_date: today },
      { start_time: '15:00:00', end_time: '16:00:00', max_orders: 50, slot_date: today },
      { start_time: '16:00:00', end_time: '17:00:00', max_orders: 50, slot_date: today },
    ];
    for (const s of defaultSlots) {
      await TimeSlot.create({
        id: crypto.randomUUID(),
        ...s,
        current_orders: 0,
        is_active: true,
      });
    }
    console.log(`[+] Added default time slots for today (${today}).`);
  }

  // 3. Migrate system_settings
  if (backupData.system_settings && backupData.system_settings.length > 0) {
    console.log('[*] Migrating system settings...');
    for (const setting of backupData.system_settings) {
      await SystemSetting.findOneAndUpdate(
        { key: setting.key },
        {
          $set: {
            value: setting.value,
            updated_at: setting.updated_at ? new Date(setting.updated_at) : new Date(),
          },
        },
        { upsert: true, new: true }
      );
    }
    console.log(`[+] Migrated ${backupData.system_settings.length} system settings.`);
  }

  // 4. Migrate ratings
  if (backupData.ratings && backupData.ratings.length > 0) {
    console.log('[*] Migrating ratings...');
    for (const rating of backupData.ratings) {
      await Rating.findOneAndUpdate(
        { id: rating.id },
        {
          $set: {
            user_id: rating.user_id,
            menu_item_id: rating.menu_item_id,
            rating: rating.rating,
            created_at: rating.created_at ? new Date(rating.created_at) : new Date(),
            updated_at: rating.updated_at ? new Date(rating.updated_at) : new Date(),
          },
        },
        { upsert: true, new: true }
      );
    }
    console.log(`[+] Migrated ${backupData.ratings.length} ratings.`);
  }

  // 5. Seed default demo accounts
  console.log('[*] Checking demo user accounts...');
  const usersToSeed = [
    {
      email: 'student@campusbite.com',
      password: 'Student@123',
      name: 'John Student',
      phone: '9876543210',
      usn: '1EW21CS001',
      role: 'student',
    },
    {
      email: 'staff@campusbite.com',
      password: 'Staff@123',
      name: 'Campus Canteen Staff',
      phone: '9876543211',
      usn: null,
      role: 'canteen_owner',
    },
    {
      email: 'vijethkr705@gmail.com',
      password: 'Vijeth@2005',
      name: 'Vijeth (Admin)',
      phone: null,
      usn: null,
      role: 'admin',
    },
  ];

  for (const u of usersToSeed) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      const userId = crypto.randomUUID();

      user = await User.create({
        id: userId,
        email: u.email,
        password: hashedPassword,
        name: u.name,
        phone: u.phone,
        usn: u.usn,
      });

      await UserRole.create({
        id: crypto.randomUUID(),
        user_id: userId,
        role: u.role,
      });

      console.log(`[+] Created demo account: ${u.email} (Role: ${u.role})`);
    } else {
      console.log(`[i] Account already exists: ${u.email}`);
    }
  }

  // 6. Verify collection counts for all 11 required collections
  console.log('\n================ COLLECTION COUNTS IN MONGODB ATLAS ================');
  const collections = [
    { name: 'users', count: await User.countDocuments() },
    { name: 'user_roles', count: await UserRole.countDocuments() },
    { name: 'menu_items', count: await MenuItem.countDocuments() },
    { name: 'time_slots', count: await TimeSlot.countDocuments() },
    { name: 'orders', count: await Order.countDocuments() },
    { name: 'order_items', count: await OrderItem.countDocuments() },
    { name: 'payments', count: await Payment.countDocuments() },
    { name: 'push_subscriptions', count: await PushSubscription.countDocuments() },
    { name: 'audit_logs', count: await AuditLog.countDocuments() },
    { name: 'rate_limits', count: await RateLimit.countDocuments() },
    { name: 'system_settings', count: await SystemSetting.countDocuments() },
    { name: 'ratings', count: await Rating.countDocuments() },
  ];

  for (const col of collections) {
    console.log(`  ${col.name.padEnd(20)}: ${col.count} documents`);
  }
  console.log('====================================================================\n');

  console.log('[+] Migration and data seed complete!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[-] Migration Error:', err);
  process.exit(1);
});
