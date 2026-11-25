import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = "https://gsbnwpyngcocuukkiaxz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzYm53cHluZ2NvY3V1a2tpYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTYzMzksImV4cCI6MjA4MzAzMjMzOX0.5IhVVMUpYOKPFl15zv5vDeCYKOTKvcEm1Q7tsqtK7ow";
const MONGODB_URI = "mongodb+srv://mohanms7608123_db_user:manumohan7608123@cluster0.1apncpj.mongodb.net/campusbite?retryWrites=true&w=majority";

async function main() {
  console.log("=== STEP 1: BACKING UP EXISTING SUPABASE DATA ===");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const tables = [
    'menu_items',
    'time_slots',
    'system_settings',
    'profiles',
    'user_roles',
    'orders',
    'order_items',
    'ratings',
    'audit_logs',
    'payments',
    'push_subscriptions'
  ];

  const backupData = {};
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.log(`[-] Table "${table}": ${error.message}`);
        backupData[table] = [];
      } else {
        console.log(`[+] Table "${table}": fetched ${data?.length || 0} records`);
        backupData[table] = data || [];
      }
    } catch (err) {
      console.log(`[-] Error fetching "${table}": ${err.message}`);
      backupData[table] = [];
    }
  }

  // Save backup to file
  const backupDir = path.resolve('backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupFilePath = path.join(backupDir, `supabase_backup_${Date.now()}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
  console.log(`[+] Backup written to: ${backupFilePath}`);

  console.log("\n=== STEP 2: TESTING MONGODB ATLAS CONNECTION ===");
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("[+] Successfully connected to MongoDB Atlas!");
    console.log("[+] Database name:", mongoose.connection.name);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("[+] Existing collections in MongoDB Atlas:", collections.map(c => c.name));
    await mongoose.disconnect();
    console.log("[+] Disconnected cleanly from MongoDB Atlas.");
  } catch (err) {
    console.error("[-] MongoDB connection failed:", err.message);
  }
}

main().catch(console.error);
