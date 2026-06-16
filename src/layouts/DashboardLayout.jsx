import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Topbar } from '../components/ui';
import { dashboardMenus } from '../constants/appConfig';
import { useAuth } from '../context/AuthContext';

const layoutCopy = {
  learner: {
    title: 'Learner Dashboard',
    subtitle: 'Track sessions, requests, mentors, resources, and feedback.',
  },
  mentor: {
    title: 'Mentor Dashboard',
    subtitle: 'Manage learners, sessions, resources, and ratings.',
  },
  admin: {
    title: 'Admin Dashboard',
    subtitle: 'Analytics, users, sessions, resources, ratings, and platform activity.',
  },
};

export default function DashboardLayout({ role, title, subtitle }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const effectiveRole = role || user?.role || 'learner';
  const copy = layoutCopy[effectiveRole] || layoutCopy.learner;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <Sidebar menu={dashboardMenus[effectiveRole] || dashboardMenus.learner} open={open} onClose={() => setOpen(false)} />
      <main className="lg:pl-72">
        <Topbar title={title || copy.title} subtitle={subtitle || copy.subtitle} onMenu={() => setOpen(true)} />
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
