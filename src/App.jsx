import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CursorGlow, ScrollToTop } from './components/ui';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import { ForgotPassword, Login, Register } from './pages/Auth';
import { AdminDashboard, LearnerDashboard, MentorDashboard, SimpleAdminPage } from './pages/Dashboards';
import { MentorsPage, NotificationsPage, ProfilePage, RatingsPage, RequestsPage, ResourcesPage, SessionsPage } from './pages/CorePages';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';

export default function App() {
  const location = useLocation();

  return (
    <>
      <CursorGlow />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/mentors" element={<MentorsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowed={['learner']} />}>
              <Route element={<DashboardLayout role="learner" />}>
                <Route path="/learner" element={<LearnerDashboard />} />
                <Route path="/learner/requests" element={<RequestsPage />} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowed={['mentor']} />}>
              <Route element={<DashboardLayout role="mentor" />}>
                <Route path="/mentor" element={<MentorDashboard />} />
                <Route path="/mentor/requests" element={<RequestsPage />} />
              </Route>
            </Route>

            <Route element={<DashboardLayout title="LearnLoop Workspace" subtitle="Shared profile, session, resource, rating, and notification tools." />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/ratings" element={<RatingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            <Route element={<RoleRoute allowed={['admin']} />}>
              <Route element={<DashboardLayout role="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<SimpleAdminPage title="Users" />} />
                <Route path="/admin/sessions" element={<SimpleAdminPage title="Sessions" />} />
                <Route path="/admin/resources" element={<SimpleAdminPage title="Resources" />} />
                <Route path="/admin/ratings" element={<SimpleAdminPage title="Ratings" />} />
                <Route path="/admin/skills" element={<SimpleAdminPage title="Skills" />} />
                <Route path="/admin/security" element={<SimpleAdminPage title="Security" />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <ScrollToTop />
    </>
  );
}
