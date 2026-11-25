import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { server } from '../server/index.js';

async function waitForServer(url, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {
      // wait a bit
    }
    await new Promise(r => setTimeout(r, 600));
  }
  throw new Error('Server timed out waiting to start');
}

async function testHttpEndpoints() {
  console.log('\n======================================================');
  console.log('       HTTP API AUTH & ROLE-BASED ACCESS TEST         ');
  console.log('======================================================\n');

  console.log('[*] Waiting for Express server to start...');
  await waitForServer('http://localhost:5000/api/health');
  console.log('[+] Express server is responsive at http://localhost:5000\n');

  // 1. Test Old Admin Login -> should be 401
  console.log('[1/6] Attempting login with old admin credentials (admin@campusbite.com)...');
  const oldLoginRes = await fetch('http://localhost:5000/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@campusbite.com', password: 'Admin@123' }),
  });
  console.log(`    [✓] Response status: ${oldLoginRes.status} (Expected: 401 Unauthorized)`);
  if (oldLoginRes.status !== 401) throw new Error('Security flaw: Old admin credentials still work!');

  // 2. Test New Admin Login with Wrong Password -> should be 401
  console.log('\n[2/6] Attempting login with new admin email + wrong password...');
  const badLoginRes = await fetch('http://localhost:5000/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vijethkr705@gmail.com', password: 'WrongPassword' }),
  });
  console.log(`    [✓] Response status: ${badLoginRes.status} (Expected: 401 Unauthorized)`);
  if (badLoginRes.status !== 401) throw new Error('Wrong password accepted!');

  // 3. Test New Admin Login with Correct Credentials -> should be 200
  console.log('\n[3/6] Logging in with new admin credentials (vijethkr705@gmail.com / Vijeth@2005)...');
  const loginRes = await fetch('http://localhost:5000/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vijethkr705@gmail.com', password: 'Vijeth@2005' }),
  });
  const loginData = await loginRes.json();
  console.log(`    [✓] Response status: ${loginRes.status} (Expected: 200 OK)`);
  console.log(`    [✓] Authenticated role returned: "${loginData.role}"`);
  console.log(`    [✓] User profile: ${loginData.profile.name} (${loginData.user.email})`);
  console.log(`    [✓] JWT Access Token issued: ${loginData.session.access_token.slice(0, 25)}...`);
  if (loginRes.status !== 200 || loginData.role !== 'admin') throw new Error('Admin login failed!');

  const adminToken = loginData.session.access_token;

  // 4. Test /api/auth/me with Admin Token
  console.log('\n[4/6] Verifying session with /api/auth/me...');
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  const meData = await meRes.json();
  console.log(`    [✓] Current authenticated role: "${meData.role}"`);
  if (meData.role !== 'admin') throw new Error('Token does not have admin role');

  // 5. Test Access to Protected Admin Resource (/api/audit-logs) as Admin -> should be 200
  console.log('\n[5/6] Accessing protected admin audit logs with Admin Token...');
  const auditRes = await fetch('http://localhost:5000/api/audit-logs', {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  const auditLogs = await auditRes.json();
  console.log(`    [✓] Admin successfully authorized. Retrieved ${auditLogs.length} audit logs (Status: ${auditRes.status})`);
  if (auditRes.status !== 200) throw new Error('Admin denied access to audit logs');

  // 6. Test Access to Protected Admin Resource as Student -> MUST BE 403 Forbidden
  console.log('\n[6/6] Testing RBAC security: Accessing admin resources with Student Token...');
  const studentLoginRes = await fetch('http://localhost:5000/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@campusbite.com', password: 'Student@123' }),
  });
  const studentData = await studentLoginRes.json();
  const studentToken = studentData.session.access_token;

  const forbiddenAuditRes = await fetch('http://localhost:5000/api/audit-logs', {
    headers: { 'Authorization': `Bearer ${studentToken}` },
  });
  console.log(`    [✓] Student blocked from /api/audit-logs: HTTP ${forbiddenAuditRes.status} (Expected: 403 Forbidden)`);
  if (forbiddenAuditRes.status !== 403) throw new Error('Security vulnerability: Student accessed admin audit logs!');

  console.log('\n======================================================');
  console.log('   ALL HTTP AUTH & RBAC SECURITY CHECKS PASSED!       ');
  console.log('======================================================\n');

  process.exit(0);
}

testHttpEndpoints().catch(err => {
  console.error('[-] Test failed:', err);
  process.exit(1);
});
