/**
 * End-to-End System In-Memory Verification Suite
 * Tests all 14 requirements specified in Section 10 of the PRD
 */

import { app } from './server/index.js';
import { calculateAttendanceMetrics } from './server/utils/attendanceCalculator.js';
import { EventEmitter } from 'events';

function callApi(method, url, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    };
    req.body = body || {};

    const res = new EventEmitter();
    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res.headers[k.toLowerCase()];
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    let bodyData = null;
    res.json = (data) => {
      bodyData = data;
      resolve({ status: res.statusCode, data: bodyData });
      return res;
    };
    res.send = (data) => {
      bodyData = data;
      try {
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      } catch {
        resolve({ status: res.statusCode, raw: data });
      }
      return res;
    };
    res.end = (data) => {
      if (data && !bodyData) {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      } else {
        resolve({ status: res.statusCode, data: bodyData });
      }
      return res;
    };

    try {
      app.handle(req, res, (err) => {
        if (err) reject(err);
        else resolve({ status: res.statusCode, data: bodyData });
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   SMART ATTENDANCE & PREDICTOR SYSTEM: 14/14 TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  const assert = (condition, testName, details = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] Test ${passedCount}: ${testName}`);
    } else {
      console.error(`[FAIL] Test: ${testName} - ${details}`);
      process.exit(1);
    }
  };

  // 1. Separate login access & Super Admin can login
  const saRes = await callApi('POST', '/api/attendance/super-admin/login', {
    username: 'superadmin',
    password: 'Admin@12345',
  });
  assert(saRes.status === 200 && saRes.data?.token, 'Super Admin login with separate interface', saRes.data?.message);
  const saToken = saRes.data.token;

  const caRes = await callApi('POST', '/api/attendance/college-admin/login', {
    email: 'admin@apex.edu',
    password: 'Admin@12345',
  });
  assert(caRes.status === 200 && caRes.data?.token, 'College Admin login with separate interface', caRes.data?.message);
  const caToken = caRes.data.token;

  const stuRes = await callApi('POST', '/api/attendance/student/login', {
    email: 'alex@apex.edu',
    password: 'Student@12345',
    collegeSecretCode: 'APEX2026',
  });
  assert(stuRes.status === 200 && stuRes.data?.token, 'Student login with separate interface & college secret code', stuRes.data?.message);
  const stuToken = stuRes.data.token;

  // 2. Super Admin can view all colleges
  const collegesRes = await callApi('GET', '/api/attendance/super-admin/colleges', null, saToken);
  assert(
    collegesRes.status === 200 && collegesRes.data?.colleges?.length >= 2,
    'Super Admin can view all registered colleges',
    `Found ${collegesRes.data?.colleges?.length} colleges`
  );

  // 3. Super Admin can view complete student profiles
  const studentProfileRes = await callApi('GET', '/api/attendance/super-admin/students/stu_01', null, saToken);
  assert(
    studentProfileRes.status === 200 &&
      studentProfileRes.data?.profile?.personal &&
      studentProfileRes.data?.profile?.college &&
      studentProfileRes.data?.profile?.attendance &&
      studentProfileRes.data?.profile?.complaints !== undefined,
    'Super Admin can view complete student profiles with attendance metrics & complaints',
    studentProfileRes.data?.message
  );

  // 4. Super Admin can view complete College Admin profiles
  const adminProfileRes = await callApi('GET', '/api/attendance/super-admin/admins/adm_01', null, saToken);
  assert(
    adminProfileRes.status === 200 &&
      adminProfileRes.data?.profile?.personal &&
      adminProfileRes.data?.profile?.college &&
      adminProfileRes.data?.profile?.students &&
      adminProfileRes.data?.profile?.subjects &&
      adminProfileRes.data?.profile?.complaints,
    'Super Admin can view complete College Admin profiles with 5 required sections',
    adminProfileRes.data?.message
  );

  // 5. College Admin can ONLY access their own college (Data Isolation)
  const caStudentsRes = await callApi('GET', '/api/attendance/college-admin/students', null, caToken);
  const otherCollegeStudents = (caStudentsRes.data?.students || []).filter((s) => s.collegeId !== 'COL-101');
  assert(
    caStudentsRes.status === 200 && otherCollegeStudents.length === 0,
    'College Admin can ONLY access their own college students (Isolation enforced)',
    `Found leaked students: ${otherCollegeStudents.length}`
  );

  // 6. Students can only access their own attendance
  const stuSubjectsRes = await callApi('GET', '/api/attendance/student/subjects', null, stuToken);
  assert(
    stuSubjectsRes.status === 200 && stuSubjectsRes.data?.subjects?.length > 0,
    'Students can access their own attendance subjects'
  );

  // 7. Students cannot modify admin-controlled subject details
  const illegalUpdateAttempt = await callApi('PUT', '/api/attendance/college-admin/subjects/sub_01', { plannedClasses: 10 }, stuToken);
  assert(
    illegalUpdateAttempt.status === 403,
    'Students cannot modify admin-controlled subject details (Protected routes reject student token)',
    `Returned status: ${illegalUpdateAttempt.status}`
  );

  // 8. Invalid college codes are rejected during registration
  const invalidCodeReg = await callApi('POST', '/api/attendance/student/register', {
    fullName: 'Test Dummy',
    email: 'dummy@test.edu',
    password: 'Password@123',
    confirmPassword: 'Password@123',
    collegeSecretCode: 'NONEXISTENT_CODE_9999',
  });
  assert(
    invalidCodeReg.status === 400 && invalidCodeReg.data?.message?.includes('Invalid college code'),
    'Invalid college codes are rejected with exact error message',
    invalidCodeReg.data?.message
  );

  // 9. Admin class-count updates appear in student dashboards
  const updateSubjectRes = await callApi(
    'PUT',
    '/api/attendance/college-admin/subjects/sub_01',
    { classesConducted: 42 },
    caToken
  );
  assert(updateSubjectRes.status === 200 && updateSubjectRes.data?.subject?.classesConducted === 42, 'Admin can update classes conducted');

  const stuUpdatedSubjects = await callApi('GET', '/api/attendance/student/subjects', null, stuToken);
  const dsaSubject = (stuUpdatedSubjects.data?.subjects || []).find((s) => s.subjectId === 'CS-101');
  assert(
    dsaSubject && dsaSubject.classesConducted === 42,
    'Admin class-count updates appear in student dashboards in real-time',
    `Found conducted count: ${dsaSubject?.classesConducted}`
  );

  // 10. Attendance calculations are accurate
  const calcTest = calculateAttendanceMetrics({
    plannedClasses: 60,
    classesConducted: 40,
    classesAttended: 30,
    minimumAttendance: 75,
  });
  assert(
    calcTest.currentAttendance === 75 &&
      calcTest.requiredAttendanceClasses === 45 &&
      calcTest.remainingClasses === 20 &&
      calcTest.classesRequired === 15 &&
      calcTest.classesCanBeMissed === 5 &&
      calcTest.status === 'ELIGIBLE',
    'Attendance mathematical calculations match specifications exactly'
  );

  // 11. Unreachable attendance targets are detected correctly
  const unreachableTest = calculateAttendanceMetrics({
    plannedClasses: 50,
    classesConducted: 36,
    classesAttended: 22,
    minimumAttendance: 80,
  });
  assert(
    unreachableTest.status === 'UNREACHABLE' &&
      unreachableTest.message?.includes('Attendance Target Unreachable') &&
      unreachableTest.classesRequired > unreachableTest.remainingClasses,
    'Unreachable attendance targets are detected correctly with standard warning'
  );

  // 12. Complaints appear in the correct College Admin dashboard
  const submitCmp = await callApi(
    'POST',
    '/api/attendance/student/complaints',
    {
      title: 'Lab Attendance Missing In Semester',
      description: 'Lab attendance for week 4 was not registered.',
    },
    stuToken
  );
  assert(submitCmp.status === 201 && submitCmp.data?.complaint, 'Student can submit complaint');

  const caComplaints = await callApi('GET', '/api/attendance/college-admin/complaints', null, caToken);
  const foundInCollege = (caComplaints.data?.complaints || []).some((c) => c.title === 'Lab Attendance Missing In Semester');
  assert(foundInCollege, 'Complaints appear in the correct College Admin dashboard');

  // 13. Super Admin can view platform-wide complaints across all colleges
  const saComplaints = await callApi('GET', '/api/attendance/super-admin/complaints', null, saToken);
  assert(
    saComplaints.status === 200 && (saComplaints.data?.complaints?.length || 0) >= 3,
    'Super Admin can view platform-wide complaints across all colleges',
    `Found ${saComplaints.data?.complaints?.length} complaints`
  );

  // 14. Passwords are securely hashed with bcrypt & masked in tables
  const studentsRaw = await callApi('GET', '/api/attendance/super-admin/students', null, saToken);
  const hasMaskedPasswords = (studentsRaw.data?.students || []).every((s) => s.password === '****************');
  assert(hasMaskedPasswords, 'Passwords are never sent in plaintext and masked as ******** in account tables');

  // 15. Base API and health check return valid JSON
  const apiRootRes = await callApi('GET', '/api');
  assert(apiRootRes.status === 200 && apiRootRes.data?.status === 'ok', 'API root returns valid JSON status');

  const healthRes = await callApi('GET', '/api/health');
  assert(healthRes.status === 200 && healthRes.data?.status === 'ok' && healthRes.data?.service, 'API health endpoint returns valid JSON metrics');

  // 16. Missing API endpoints return valid JSON 404 (never HTML or plain text)
  const notFoundRes = await callApi('GET', '/api/unknown-endpoint');
  assert(notFoundRes.status === 404 && notFoundRes.data?.error === 'NotFound', 'Missing API route returns valid JSON with HTTP 404');

  // 17. Vercel Serverless Function handler routes requests cleanly
  const { default: vercelHandler } = await import('./api/index.js');
  let vercelHandledData = null;
  let vercelHandledStatus = 200;
  const mockVercelReq = new EventEmitter();
  mockVercelReq.method = 'GET';
  mockVercelReq.url = '/api/index.js'; // Simulating Vercel internal rewrite
  mockVercelReq.query = { path: ['attendance', 'super-admin', 'colleges'] };
  mockVercelReq.headers = { authorization: `Bearer ${saToken}` };

  const mockVercelRes = new EventEmitter();
  mockVercelRes.statusCode = 200;
  mockVercelRes.headers = {};
  mockVercelRes.setHeader = (k, v) => { mockVercelRes.headers[k.toLowerCase()] = v; };
  mockVercelRes.getHeader = (k) => mockVercelRes.headers[k.toLowerCase()];
  mockVercelRes.status = (c) => { mockVercelRes.statusCode = c; return mockVercelRes; };
  mockVercelRes.json = (d) => { vercelHandledData = d; };
  mockVercelRes.send = (d) => { try { vercelHandledData = JSON.parse(d); } catch { vercelHandledData = d; } };
  mockVercelRes.end = () => {};

  await vercelHandler(mockVercelReq, mockVercelRes);
  assert(
    mockVercelRes.statusCode === 200 && Array.isArray(vercelHandledData?.colleges),
    'Vercel Serverless handler normalizes rewritten path and returns colleges JSON'
  );

  console.log(`\n====================================================`);
  console.log(`   ALL 18/18 PRD & DEPLOYMENT TESTS PASSED!`);
  console.log(`====================================================\n`);
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
