import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import VideoDetails from "../pages/VideoDetails";
import Login from "../pages/Login";


import Dashboard from "../pages/dashboard/Dashboard";
import Videos from "../pages/dashboard/Videos";
import AddVideo from "../pages/dashboard/AddVideo";
import EditVideo from "../pages/dashboard/EditVideo";
import Categories from "../pages/dashboard/Categories";
import SubCategories from "../pages/dashboard/SubCategories";
import Messages from "../pages/dashboard/Messages";
import Settings from "../pages/dashboard/Settings";

import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/videos/:slug" element={<VideoDetails />} />
        </Route>

        {/* Admin login */}
        <Route path="/login" element={<Login />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route
  path="/dashboard/videos"
  element={<Videos />}
/>
<Route path="*" element={<NotFound />} />

        {/* Protected dashboard pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />

            <Route path="videos" element={<Videos />} />
            <Route path="videos/add" element={<AddVideo />} />
            <Route path="videos/edit/:id" element={<EditVideo />} />

            <Route path="categories" element={<Categories />} />

            <Route
              path="subcategories"
              element={<SubCategories />}
            />

            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Old or incorrect dashboard path */}
        <Route
          path="/admin"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}