import {
  Award,
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  FileText,
  GraduationCap,
  Languages,
  LayoutDashboard,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
  Target,
  UploadCloud,
  Users,
  Video,
} from 'lucide-react';

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Mentors', href: '/mentors' },
  { label: 'About', href: '/#about' },
];

export const features = [
  { title: 'Find Mentors', text: 'Discover verified experts by skill, rating, experience, and availability.', icon: Search },
  { title: 'Learn Skills', text: 'Follow structured learning paths with sessions, resources, and feedback loops.', icon: GraduationCap },
  { title: 'Schedule Sessions', text: 'Coordinate meetings, track status, and join live sessions from one place.', icon: CalendarClock },
  { title: 'Share Resources', text: 'Upload PDFs, videos, links, documents, and session-specific study material.', icon: UploadCloud },
  { title: 'Track Growth', text: 'Monitor progress across active mentorships and completed sessions.', icon: Target },
  { title: 'Get Feedback', text: 'Leave ratings and reviews that help mentors build trusted reputations.', icon: MessageSquare },
];

export const faqs = [
  { q: 'Can LearnLoop connect to my existing backend?', a: 'Yes. The frontend uses the Express API under /api/v1 with JWT, protected routes, and role checks.' },
  { q: 'Which roles are supported?', a: 'Learner, mentor, and admin experiences are included with dedicated dashboards and navigation.' },
  { q: 'Does it support file resources?', a: 'The resource service supports multipart uploads and link resources for PDFs, PPTs, docs, images, videos, and links.' },
];

export const dashboardMenus = {
  learner: [
    ['Dashboard', LayoutDashboard, '/learner'],
    ['Find Mentors', Search, '/mentors'],
    ['My Requests', Bell, '/learner/requests'],
    ['Sessions', Video, '/sessions'],
    ['Resources', BookOpen, '/resources'],
    ['Notifications', Bell, '/notifications'],
    ['Profile', Users, '/profile'],
  ],
  mentor: [
    ['Dashboard', LayoutDashboard, '/mentor'],
    ['Requests', Bell, '/mentor/requests'],
    ['Sessions', Video, '/sessions'],
    ['Resources', BookOpen, '/resources'],
    ['Notifications', Bell, '/notifications'],
    ['Profile', Users, '/profile'],
  ],
  admin: [
    ['Dashboard', LayoutDashboard, '/admin'],
    ['Users', Users, '/admin/users'],
    ['Sessions', Video, '/admin/sessions'],
    ['Resources', FileText, '/admin/resources'],
    ['Ratings', Star, '/admin/ratings'],
    ['Skills', Languages, '/admin/skills'],
    ['Security', ShieldCheck, '/admin/security'],
  ],
};

export const adminMetricConfig = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, tone: 'blue' },
  { key: 'totalLearners', label: 'Total Learners', icon: GraduationCap, tone: 'emerald' },
  { key: 'totalMentors', label: 'Total Mentors', icon: Award, tone: 'violet' },
  { key: 'totalSessions', label: 'Total Sessions', icon: Video, tone: 'amber' },
  { key: 'completedSessions', label: 'Completed Sessions', icon: CheckCircle2, tone: 'teal' },
  { key: 'totalResources', label: 'Total Resources', icon: FileText, tone: 'rose' },
  { key: 'totalRatings', label: 'Total Ratings', icon: Star, tone: 'orange' },
];
