import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import VideoDetails from "./pages/VideoDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/dashboard/Dashboard";
import DashboardVideos from "./pages/dashboard/Videos";
import DashboardUsers from "./pages/dashboard/Users";
import DashboardCategories from "./pages/dashboard/Categories";
import SubCategories from "./pages/dashboard/SubCategories";
import DashboardMessages from "./pages/dashboard/Messages";
import AddVideo from "./pages/dashboard/AddVideo";
import EditVideo from "./pages/dashboard/EditVideo";
import Profile from "./pages/dashboard/Profile";
import Notifications from "./pages/dashboard/Notifications";
import ActivityLogs from "./pages/dashboard/ActivityLogs";
import Analytics from "./pages/dashboard/Analytics";

export default function App() {
  return (
    <Routes>
      {/* Public website and authentication */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="/videos/:slug" element={<VideoDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* User and admin dashboard */}
      <Route element={<DashboardLayout />}>
        {/* Approved user routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard/videos" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/videos"
          element={
            <ProtectedRoute>
              <DashboardVideos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/add-video"
          element={
            <ProtectedRoute>
              <AddVideo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/videos/:id/edit"
          element={
            <ProtectedRoute>
              <EditVideo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <DashboardUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/videos"
          element={
            <ProtectedRoute adminOnly>
              <DashboardVideos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-video"
          element={
            <ProtectedRoute adminOnly>
              <AddVideo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/videos/:id/edit"
          element={
            <ProtectedRoute adminOnly>
              <EditVideo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly>
              <DashboardCategories />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/subcategories"
          element={
            <ProtectedRoute adminOnly>
              <SubCategories />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute adminOnly>
              <DashboardMessages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute adminOnly>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute adminOnly>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/activity-logs"
          element={
            <ProtectedRoute adminOnly>
              <ActivityLogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute adminOnly>
              <Analytics />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
