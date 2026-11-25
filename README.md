# Attendance Predictor — Smart Student Attendance & Predictor System

A complete, modern, responsive, secure, mobile-friendly **Smart Student Attendance and Predictor System** built with React, TypeScript, TailwindCSS, Express.js, and MongoDB / embedded storage.

---

## 🚀 Quick Start

### 1. Start Application (Backend + Frontend)
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173` (or port shown in console)
- **Backend API**: `http://localhost:5000/api/attendance`

### 2. Run Comprehensive Test Suite
```bash
npm test
```
Executes all 14 end-to-end verification tests covering RBAC, tenant isolation, prediction algorithms, and security rules.

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Username / Email | Password | College Secret Code | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `Admin@12345` | *N/A* | Full central management control |
| **College Admin** | `admin@apex.edu` | `Admin@12345` | `APEX2026` | Apex Institute of Technology Lead |
| **College Admin** | `admin@metro.edu` | `Admin@12345` | `METRO2026` | Metro Global University Lead |
| **Student** | `alex@apex.edu` | `Student@12345` | `APEX2026` | **ELIGIBLE** (95% attendance) |
| **Student** | `priya@apex.edu` | `Student@12345` | `APEX2026` | **AT RISK** in DSA (67.5% < 75%) |
| **Student** | `marcus@apex.edu` | `Student@12345` | `APEX2026` | **UNREACHABLE** in DBMS (Target unachievable) |

---

## 📁 Application Structure

```
attendance-predictor/
├── src/
│   ├── layouts/
│   │   ├── SuperAdminLayout.tsx       # 11-item Super Admin sidebar
│   │   ├── CollegeAdminLayout.tsx     # 9-item College Admin sidebar
│   │   └── StudentLayout.tsx          # 6-item Student sidebar
│   ├── pages/attendance/
│   │   ├── LandingPage.tsx            # Main portal selector with 1-click demo logins
│   │   ├── auth/                      # Super Admin, College Admin, & Student auth
│   │   ├── superadmin/                # 10 Super Admin management pages
│   │   ├── collegeadmin/              # 8 College Admin management pages
│   │   └── student/                   # 5 Student tracking & predictor pages
│   ├── contexts/
│   │   └── AttendanceAuthContext.tsx  # JWT authentication & session state
│   ├── services/
│   │   └── attendanceApi.ts           # API client
│   └── utils/
│       └── attendanceCalculator.ts    # Mathematical prediction engine
├── server/
│   ├── controllers/
│   │   └── attendanceController.js    # Super Admin, College Admin, & Student handlers
│   ├── routes/
│   │   └── attendanceRoutes.js        # RESTful API route definitions
│   ├── middleware/
│   │   └── attendanceAuth.js          # Role-based access control & tenant isolation
│   ├── db/
│   │   └── attendanceDb.js            # MongoDB & persistent storage adapter
│   ├── data/
│   │   └── attendance_store.json      # Persistent local database store
│   └── index.js                       # Express server entry point
├── test_system.mjs                    # Automated 14-test verification suite
└── package.json                       # Configured as attendance-predictor
```

---

## 🧮 Mathematical Engine Formulas

- **Current Attendance**: `(A / H) * 100`
- **Required Attendance Classes**: `ceil(P * M / 100)`
- **Remaining Classes**: `P - H`
- **Classes Required**: `max(0, Required Attendance Classes - A)`
- **Classes That Can Be Missed**: `Remaining Classes - Classes Required`
- **Maximum Possible Attendance**: `((A + Remaining Classes) / P) * 100`

### Prediction Status Thresholds:
- **ELIGIBLE**: Current attendance meets target percentage.
- **AT RISK**: Current attendance below minimum, but achievable by attending future classes.
- **UNREACHABLE**: Target mathematically unattainable even with 100% attendance in all remaining classes.
