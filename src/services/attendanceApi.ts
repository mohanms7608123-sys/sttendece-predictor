const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_BASE = (rawApiUrl ? rawApiUrl.replace(/\/$/, '') : '') + '/api/attendance';

function getHeaders() {
  const token = localStorage.getItem('attendance_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'An error occurred while processing the request.');
  }
  return data;
}

export const attendanceApi = {
  // Auth
  superAdminLogin: (body: any) =>
    fetch(`${API_BASE}/super-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  collegeAdminRegister: (body: any) =>
    fetch(`${API_BASE}/college-admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  collegeAdminLogin: (body: any) =>
    fetch(`${API_BASE}/college-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  studentRegister: (body: any) =>
    fetch(`${API_BASE}/student/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  studentLogin: (body: any) =>
    fetch(`${API_BASE}/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  // Super Admin
  getSuperAdminDashboard: () =>
    fetch(`${API_BASE}/super-admin/dashboard`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  getColleges: () =>
    fetch(`${API_BASE}/super-admin/colleges`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  addCollege: (body: any) =>
    fetch(`${API_BASE}/super-admin/colleges`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  updateCollege: (id: string, body: any) =>
    fetch(`${API_BASE}/super-admin/colleges/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  getAdmins: () =>
    fetch(`${API_BASE}/super-admin/admins`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  getAdminProfile: (id: string) =>
    fetch(`${API_BASE}/super-admin/admins/${id}`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  updateAdminStatus: (id: string, status: string) =>
    fetch(`${API_BASE}/super-admin/admins/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then((res) => handleResponse<any>(res)),

  resetAdminPassword: (id: string, newPassword: string) =>
    fetch(`${API_BASE}/super-admin/admins/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ newPassword }),
    }).then((res) => handleResponse<any>(res)),

  getStudents: (params?: { search?: string; collegeName?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetch(`${API_BASE}/super-admin/students?${query}`, { headers: getHeaders() }).then((res) =>
      handleResponse<any>(res)
    );
  },

  getStudentProfile: (id: string) =>
    fetch(`${API_BASE}/super-admin/students/${id}`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  updateStudentStatus: (id: string, status: string) =>
    fetch(`${API_BASE}/super-admin/students/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then((res) => handleResponse<any>(res)),

  resetStudentPassword: (id: string, newPassword: string) =>
    fetch(`${API_BASE}/super-admin/students/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ newPassword }),
    }).then((res) => handleResponse<any>(res)),

  getSuperAdminSubjects: () =>
    fetch(`${API_BASE}/super-admin/subjects`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  getSuperAdminAttendance: () =>
    fetch(`${API_BASE}/super-admin/attendance`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  getSuperAdminComplaints: () =>
    fetch(`${API_BASE}/super-admin/complaints`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  getSuperAdminReports: () =>
    fetch(`${API_BASE}/super-admin/reports`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  getActivityLogs: () =>
    fetch(`${API_BASE}/super-admin/activity-logs`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  // College Admin
  getCollegeAdminDashboard: () =>
    fetch(`${API_BASE}/college-admin/dashboard`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  getCollegeSubjects: () =>
    fetch(`${API_BASE}/college-admin/subjects`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  addSubject: (body: any) =>
    fetch(`${API_BASE}/college-admin/subjects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  updateSubject: (id: string, body: any) =>
    fetch(`${API_BASE}/college-admin/subjects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  toggleSubjectStatus: (id: string, status: string) =>
    fetch(`${API_BASE}/college-admin/subjects/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then((res) => handleResponse<any>(res)),

  getCollegeStudents: () =>
    fetch(`${API_BASE}/college-admin/students`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  getStudentAttendanceDetails: (studentId: string) =>
    fetch(`${API_BASE}/college-admin/students/${studentId}/attendance`, { headers: getHeaders() }).then((res) =>
      handleResponse<any>(res)
    ),

  getCollegeAttendanceReports: () =>
    fetch(`${API_BASE}/college-admin/attendance-reports`, { headers: getHeaders() }).then((res) =>
      handleResponse<any>(res)
    ),

  getCollegeComplaints: () =>
    fetch(`${API_BASE}/college-admin/complaints`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  replyToComplaint: (id: string, body: { adminResponse: string; status: string }) =>
    fetch(`${API_BASE}/college-admin/complaints/${id}/reply`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  getCollegeSettings: () =>
    fetch(`${API_BASE}/college-admin/settings`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  updateCollegeSettings: (body: any) =>
    fetch(`${API_BASE}/college-admin/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  // Student
  getStudentDashboard: () =>
    fetch(`${API_BASE}/student/dashboard`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  getStudentSubjects: () =>
    fetch(`${API_BASE}/student/subjects`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  updateStudentAttendance: (subjectId: string, classesAttended: number) =>
    fetch(`${API_BASE}/student/attendance/${subjectId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ classesAttended }),
    }).then((res) => handleResponse<any>(res)),

  getStudentPredictor: (params?: { subjectId?: string; hypotheticalRemainingAttended?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetch(`${API_BASE}/student/predictor?${query}`, { headers: getHeaders() }).then((res) =>
      handleResponse<any>(res)
    );
  },

  getStudentComplaints: () =>
    fetch(`${API_BASE}/student/complaints`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),

  submitStudentComplaint: (body: { title: string; description: string }) =>
    fetch(`${API_BASE}/student/complaints`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<any>(res)),

  getMyStudentProfile: () =>
    fetch(`${API_BASE}/student/profile`, { headers: getHeaders() }).then((res) => handleResponse<any>(res)),
};
