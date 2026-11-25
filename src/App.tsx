import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { AttendanceAuthProvider } from "@/contexts/AttendanceAuthContext";

// Existing CampusBite Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import CanteenDashboard from "./pages/CanteenDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminSlots from "./pages/admin/AdminSlots";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminScan from "./pages/admin/AdminScan";
import NotFound from "./pages/NotFound";

// Smart Student Attendance & Predictor Pages
import { LandingPage } from "./pages/attendance/LandingPage";
import { SuperAdminLogin } from "./pages/attendance/auth/SuperAdminLogin";
import { CollegeAdminLogin } from "./pages/attendance/auth/CollegeAdminLogin";
import { CollegeAdminRegister } from "./pages/attendance/auth/CollegeAdminRegister";
import { StudentLogin } from "./pages/attendance/auth/StudentLogin";
import { StudentRegister } from "./pages/attendance/auth/StudentRegister";

// Layouts & Guards
import { SuperAdminLayout } from "./layouts/SuperAdminLayout";
import { CollegeAdminLayout } from "./layouts/CollegeAdminLayout";
import { StudentLayout } from "./layouts/StudentLayout";
import {
  RequireSuperAdmin,
  RequireCollegeAdmin,
  RequireStudent,
} from "./components/attendance/AttendanceRouteGuards";

// Super Admin Pages
import { SuperAdminDashboard } from "./pages/attendance/superadmin/SuperAdminDashboard";
import { CollegeManagement } from "./pages/attendance/superadmin/CollegeManagement";
import { AdminManagement } from "./pages/attendance/superadmin/AdminManagement";
import { StudentManagement } from "./pages/attendance/superadmin/StudentManagement";
import { SubjectOverview } from "./pages/attendance/superadmin/SubjectOverview";
import { AttendanceOverview } from "./pages/attendance/superadmin/AttendanceOverview";
import { ComplaintManagement } from "./pages/attendance/superadmin/ComplaintManagement";
import { ReportsAnalytics } from "./pages/attendance/superadmin/ReportsAnalytics";
import { ActivityLogs } from "./pages/attendance/superadmin/ActivityLogs";
import { SuperAdminSettings } from "./pages/attendance/superadmin/SuperAdminSettings";

// College Admin Pages
import { CollegeAdminDashboard } from "./pages/attendance/collegeadmin/CollegeAdminDashboard";
import { AddSubject } from "./pages/attendance/collegeadmin/AddSubject";
import { ManageSubjects } from "./pages/attendance/collegeadmin/ManageSubjects";
import { CollegeStudents } from "./pages/attendance/collegeadmin/CollegeStudents";
import { CollegeAttendanceReports } from "./pages/attendance/collegeadmin/CollegeAttendanceReports";
import { CollegeComplaints } from "./pages/attendance/collegeadmin/CollegeComplaints";
import { CollegeSettings } from "./pages/attendance/collegeadmin/CollegeSettings";
import { CollegeAdminProfile } from "./pages/attendance/collegeadmin/CollegeAdminProfile";

// Student Pages
import { StudentDashboard } from "./pages/attendance/student/StudentDashboard";
import { StudentSubjects } from "./pages/attendance/student/StudentSubjects";
import { AttendancePredictor } from "./pages/attendance/student/AttendancePredictor";
import { StudentComplaints } from "./pages/attendance/student/StudentComplaints";
import { StudentProfile } from "./pages/attendance/student/StudentProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AttendanceAuthProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="attendance-ui-theme">
          <CartProvider>
            <NotificationsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner position="top-right" richColors />
                <BrowserRouter>
                  <Routes>
                    {/* Public Attendance Portal Hub */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/attendance" element={<LandingPage />} />

                    {/* Role-Specific Login & Registration Interfaces */}
                    <Route path="/super-admin/login" element={<SuperAdminLogin />} />
                    <Route path="/college-admin/login" element={<CollegeAdminLogin />} />
                    <Route path="/college-admin/register" element={<CollegeAdminRegister />} />
                    <Route path="/student/login" element={<StudentLogin />} />
                    <Route path="/student/register" element={<StudentRegister />} />

                    {/* Super Admin Protected Portal */}
                    <Route element={<RequireSuperAdmin />}>
                      <Route element={<SuperAdminLayout />}>
                        <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
                        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
                        <Route path="/super-admin/colleges" element={<CollegeManagement />} />
                        <Route path="/super-admin/admins" element={<AdminManagement />} />
                        <Route path="/super-admin/students" element={<StudentManagement />} />
                        <Route path="/super-admin/subjects" element={<SubjectOverview />} />
                        <Route path="/super-admin/attendance" element={<AttendanceOverview />} />
                        <Route path="/super-admin/complaints" element={<ComplaintManagement />} />
                        <Route path="/super-admin/reports" element={<ReportsAnalytics />} />
                        <Route path="/super-admin/activity-logs" element={<ActivityLogs />} />
                        <Route path="/super-admin/settings" element={<SuperAdminSettings />} />
                      </Route>
                    </Route>

                    {/* College Admin Protected Portal */}
                    <Route element={<RequireCollegeAdmin />}>
                      <Route element={<CollegeAdminLayout />}>
                        <Route path="/college-admin" element={<Navigate to="/college-admin/dashboard" replace />} />
                        <Route path="/college-admin/dashboard" element={<CollegeAdminDashboard />} />
                        <Route path="/college-admin/add-subject" element={<AddSubject />} />
                        <Route path="/college-admin/manage-subjects" element={<ManageSubjects />} />
                        <Route path="/college-admin/students" element={<CollegeStudents />} />
                        <Route path="/college-admin/reports" element={<CollegeAttendanceReports />} />
                        <Route path="/college-admin/complaints" element={<CollegeComplaints />} />
                        <Route path="/college-admin/settings" element={<CollegeSettings />} />
                        <Route path="/college-admin/profile" element={<CollegeAdminProfile />} />
                      </Route>
                    </Route>

                    {/* Student Protected Portal */}
                    <Route element={<RequireStudent />}>
                      <Route element={<StudentLayout />}>
                        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
                        <Route path="/student/dashboard" element={<StudentDashboard />} />
                        <Route path="/student/subjects" element={<StudentSubjects />} />
                        <Route path="/student/predictor" element={<AttendancePredictor />} />
                        <Route path="/student/complaints" element={<StudentComplaints />} />
                        <Route path="/student/profile" element={<StudentProfile />} />
                      </Route>
                    </Route>

                    {/* Preserved CampusBite Routes */}
                    <Route path="/campusbite" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/order/:orderId" element={<OrderDetails />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/canteen" element={<CanteenDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/menu" element={<AdminMenu />} />
                    <Route path="/admin/slots" element={<AdminSlots />} />
                    <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                    <Route path="/admin/scan" element={<AdminScan />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </NotificationsProvider>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </AttendanceAuthProvider>
  </QueryClientProvider>
);

export default App;
