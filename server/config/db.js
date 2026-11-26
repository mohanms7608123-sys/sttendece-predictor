import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Ensure IPv4 first to prevent IPv6 timeout on local Windows machines
const isServerless = !!(process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
if (process.platform === 'win32' && !isServerless) {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore DNS server override error if restricted
  }
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mohanms7608123_db_user:manumohan7608123@cluster0.1apncpj.mongodb.net/attendance_predictor?retryWrites=true&w=majority";

let isMongoConnected = false;

export async function connectDB() {
  if (isMongoConnected) return true;
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[+] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[!] MongoDB Remote Connection unavailable (${error.message}). Falling back to Embedded Persistent Store for Smart Attendance System.`);
    isMongoConnected = false;
    return false;
  }
}

export function getMongoConnectionStatus() {
  return isMongoConnected;
}
