import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "@/routes/AuthGuard";
import { GuestGuard } from "@/routes/GuestGuard";
import { RoleGuard } from "@/routes/RoleGuard";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProductionLayout } from "@/layouts/ProductionLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { ForgotPasswordPage, ResetPasswordPage } from "@/features/auth/pages/PasswordPages";
import { NotFound } from "@/pages/NotFound";
import { SetupRequiredPage, UnauthorizedPage } from "@/pages/SystemPages";

const RoleDashboard = lazy(() => import("@/features/dashboard/pages/RoleDashboard").then((module) => ({ default: module.RoleDashboard })));
const StudentProfilePage = lazy(() => import("@/features/students/pages/StudentProfilePage").then((module) => ({ default: module.StudentProfilePage })));
const StudentsManagementPage = lazy(() => import("@/features/students/pages/StudentsManagementPage").then((module) => ({ default: module.StudentsManagementPage })));
const AssignmentsManagementPage = lazy(() => import("@/features/assignments/pages/AssignmentsManagementPage").then((module) => ({ default: module.AssignmentsManagementPage })));
const AttendanceManagementPage = lazy(() => import("@/features/attendance/pages/AttendanceManagementPage").then((module) => ({ default: module.AttendanceManagementPage })));
const CoursesPage = lazy(() => import("@/features/admin/pages/CatalogPages").then((module) => ({ default: module.CoursesPage })));
const BatchesPage = lazy(() => import("@/features/admin/pages/CatalogPages").then((module) => ({ default: module.BatchesPage })));
const TeachersManagementPage = lazy(() => import("@/features/admin/pages/TeachersManagementPage").then((module) => ({ default: module.TeachersManagementPage })));
const RoleManagementPage = lazy(() => import("@/features/admin/pages/RoleManagementPage").then((module) => ({ default: module.RoleManagementPage })));
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage").then((module) => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage").then((module) => ({ default: module.NotificationsPage })));

function RouteLoader() {
  return <div className="route-loader"><span className="spin" /><p>Loading workspace…</p></div>;
}

export function AppRouter() {
  return <Suspense fallback={<RouteLoader />}><Routes>
    <Route path="/setup-required" element={<SetupRequiredPage />} />
    <Route element={<GuestGuard />}><Route element={<AuthLayout />}><Route path="/login" element={<LoginPage />} /><Route path="/signup" element={<SignupPage />} /><Route path="/forgot-password" element={<ForgotPasswordPage />} /></Route></Route>
    <Route path="/reset-password" element={<AuthLayout />}><Route index element={<ResetPasswordPage />} /></Route>
    <Route element={<AuthGuard />}><Route element={<ProductionLayout />}>
      <Route index element={<RoleDashboard />} />
      <Route path="/assignments" element={<AssignmentsManagementPage />} />
      <Route path="/attendance" element={<AttendanceManagementPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<RoleGuard allowed={["student"]} />}><Route path="/profile" element={<StudentProfilePage />} /></Route>
      <Route element={<RoleGuard allowed={["super_admin", "admin", "teacher"]} />}><Route path="/students" element={<StudentsManagementPage />} /><Route path="/batches" element={<BatchesPage />} /></Route>
      <Route element={<RoleGuard allowed={["super_admin", "admin"]} />}><Route path="/teachers" element={<TeachersManagementPage />} /><Route path="/courses" element={<CoursesPage />} /><Route path="/users" element={<RoleManagementPage />} /><Route path="/reports" element={<ReportsPage />} /></Route>
    </Route></Route>
    <Route path="/404" element={<NotFound />} /><Route path="*" element={<Navigate to="/404" replace />} />
  </Routes></Suspense>;
}
