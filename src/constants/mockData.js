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
  Sparkles,
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

export const howItWorks = ['Find Mentor', 'Send Request', 'Get Accepted', 'Attend Session', 'Receive Resources', 'Leave Feedback'];

export const stats = [
  { label: 'Total Users', value: 18400 },
  { label: 'Total Mentors', value: 2300 },
  { label: 'Sessions Completed', value: 52000 },
  { label: 'Resources Shared', value: 12800 },
];

export const testimonials = [
  { name: 'Nisha Rao', role: 'Frontend Learner', quote: 'LearnLoop made mentorship feel structured. I found a React mentor, got weekly sessions, and shipped my portfolio in a month.' },
  { name: 'Ishan Mehta', role: 'Cloud Mentor', quote: 'The mentor dashboard keeps requests, sessions, resources, and feedback organized without slowing me down.' },
  { name: 'Ava Kapoor', role: 'Program Admin', quote: 'The analytics view gives us the exact pulse of user growth, popular skills, and mentor quality.' },
];

export const faqs = [
  { q: 'Can LearnLoop connect to my existing backend?', a: 'Yes. The frontend is wired for the existing Express API under /api/v1 with JWT, protected routes, and role checks.' },
  { q: 'Which roles are supported?', a: 'Learner, mentor, and admin experiences are included with dedicated dashboards and navigation.' },
  { q: 'Does it support file resources?', a: 'The resource service supports multipart uploads and link resources for PDFs, PPTs, docs, images, videos, and links.' },
];

export const mentors = [
  { id: 'm1', name: 'Aarav Sharma', skill: 'React Architecture', rating: 4.9, experience: '7 yrs', sessions: 188, languages: ['English', 'Hindi'], bio: 'Senior UI engineer who helps learners build production-ready frontend systems.' },
  { id: 'm2', name: 'Maya Iyer', skill: 'Node.js APIs', rating: 4.8, experience: '6 yrs', sessions: 146, languages: ['English', 'Tamil'], bio: 'Backend mentor focused on Express, MongoDB, testing, and API design.' },
  { id: 'm3', name: 'Kabir Khan', skill: 'Product Design', rating: 4.7, experience: '8 yrs', sessions: 214, languages: ['English', 'Urdu'], bio: 'Design mentor for SaaS UX, research, dashboards, and portfolio case studies.' },
  { id: 'm4', name: 'Sara Thomas', skill: 'Data Analytics', rating: 4.9, experience: '5 yrs', sessions: 132, languages: ['English', 'Malayalam'], bio: 'Analytics coach for dashboards, charts, storytelling, and business metrics.' },
];

export const resources = [
  { title: 'React Component Systems', type: 'PDF', tags: ['React', 'Architecture'], downloads: 542 },
  { title: 'MongoDB Query Patterns', type: 'DOC', tags: ['MongoDB', 'Backend'], downloads: 318 },
  { title: 'Design Review Checklist', type: 'LINK', tags: ['UX', 'Portfolio'], downloads: 784 },
  { title: 'API Testing Walkthrough', type: 'VIDEO', tags: ['Express', 'Testing'], downloads: 221 },
];

export const sessions = [
  { mentor: 'Aarav Sharma', learner: 'Nisha Rao', topic: 'Reusable React Patterns', date: '2026-07-01', duration: 60, status: 'Scheduled', link: 'https://meet.google.com/learnloop' },
  { mentor: 'Maya Iyer', learner: 'Dev Patel', topic: 'JWT Refresh Flow', date: '2026-07-03', duration: 45, status: 'Live', link: 'https://meet.google.com/learnloop' },
  { mentor: 'Kabir Khan', learner: 'Riya Sen', topic: 'Portfolio Case Study', date: '2026-06-24', duration: 50, status: 'Completed', link: 'https://meet.google.com/learnloop' },
];

export const notifications = [
  { id: 1, title: 'Mentorship accepted', text: 'Aarav accepted your React Architecture request.', unread: true, time: '4m ago' },
  { id: 2, title: 'New resource uploaded', text: 'JWT Refresh Flow notes are ready to download.', unread: true, time: '24m ago' },
  { id: 3, title: 'Session reminder', text: 'Product Design review starts tomorrow at 5:00 PM.', unread: false, time: '2h ago' },
];

export const adminMetrics = [
  { label: 'Total Users', value: '18.4k', icon: Users, tone: 'blue' },
  { label: 'Total Learners', value: '13.1k', icon: GraduationCap, tone: 'emerald' },
  { label: 'Total Mentors', value: '2.3k', icon: Award, tone: 'violet' },
  { label: 'Total Sessions', value: '52k', icon: Video, tone: 'amber' },
  { label: 'Completed Sessions', value: '47k', icon: CheckCircle2, tone: 'teal' },
  { label: 'Total Resources', value: '12.8k', icon: FileText, tone: 'rose' },
  { label: 'Total Ratings', value: '31k', icon: Star, tone: 'orange' },
];

export const growthData = [
  { month: 'Jan', users: 2400, sessions: 1200 },
  { month: 'Feb', users: 3200, sessions: 1900 },
  { month: 'Mar', users: 4400, sessions: 2600 },
  { month: 'Apr', users: 6200, sessions: 3900 },
  { month: 'May', users: 8500, sessions: 5200 },
  { month: 'Jun', users: 11200, sessions: 7600 },
];

export const skillData = [
  { name: 'React', value: 38 },
  { name: 'Node.js', value: 27 },
  { name: 'Design', value: 18 },
  { name: 'Data', value: 17 },
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

export const profile = {
  name: 'Priya Menon',
  username: 'priya.learns',
  role: 'learner',
  bio: 'Frontend learner building a production-grade portfolio with React, Node, and design systems.',
  skills: ['React', 'Tailwind', 'Node.js', 'MongoDB'],
  education: 'B.Tech Computer Science',
  experience: '2 years learning and internships',
  languages: ['English', 'Hindi', 'Malayalam'],
  availability: 'Weekdays 6 PM - 9 PM',
  rating: 4.8,
};
