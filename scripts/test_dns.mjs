import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = "mongodb+srv://mohanms7608123_db_user:manumohan7608123@cluster0.1apncpj.mongodb.net/campusbite?retryWrites=true&w=majority";

async function testDnsAndMongo() {
  console.log("Testing SRV lookup with 8.8.8.8...");
  try {
    const srv = await dns.promises.resolveSrv('_mongodb._tcp.cluster0.1apncpj.mongodb.net');
    console.log("SRV resolved successfully:", srv);
  } catch (e) {
    console.error("SRV resolve error:", e.message);
  }

  console.log("Attempting MongoDB connection with custom DNS servers...");
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("[+] Connected successfully to MongoDB Atlas!");
    console.log("Database:", mongoose.connection.name);
    await mongoose.disconnect();
  } catch (e) {
    console.error("[-] Mongo connection error:", e.message);
  }
}

testDnsAndMongo();
