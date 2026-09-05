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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/dashboard/Dashboard";
import DashboardVideos from "./pages/dashboard/Videos";
import DashboardCategories from "./pages/dashboard/Categories";
import SubCategories from "./pages/dashboard/SubCategories";
import DashboardMessages from "./pages/dashboard/Messages";
import AddVideo from "./pages/dashboard/AddVideo";
import EditVideo from "./pages/dashboard/EditVideo";
import Profile from "./pages/dashboard/Profile";
import Notifications from "./pages/dashboard/Notifications";
import ActivityLogs from "./pages/dashboard/ActivityLogs";

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
        <Route path="/signup" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Private owner dashboard */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard/*" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/videos" element={<ProtectedRoute><DashboardVideos /></ProtectedRoute>} />
        <Route path="/admin/add-video" element={<ProtectedRoute><AddVideo /></ProtectedRoute>} />
        <Route path="/admin/videos/:id/edit" element={<ProtectedRoute><EditVideo /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><DashboardCategories /></ProtectedRoute>} />
        <Route path="/admin/subcategories" element={<ProtectedRoute><SubCategories /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute><DashboardMessages /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/admin/activity-logs" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}




