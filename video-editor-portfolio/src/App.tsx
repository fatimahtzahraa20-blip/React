import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import VideoDetails from "./pages/VideoDetails";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardVideos from "./pages/dashboard/Videos";
import DashboardMessages from "./pages/dashboard/Messages";
import DashboardSettings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";


export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="/videos/:slug" element={<VideoDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/videos" element={<DashboardVideos />} />
        <Route path="/dashboard/messages" element={<DashboardMessages />} />
        <Route path="/dashboard/settings" element={<DashboardSettings />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}