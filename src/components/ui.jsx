import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  Bell,
  ChevronDown,
  Download,
  Filter,
  Loader2,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { FaFacebookF, FaGithub, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { navLinks } from '../constants/appConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { dashboardPathForRole } from '../routes/routeUtils';
import logo from '../assets/images/learnloop.jpg';

export function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img
        src={logo}
        alt="LearnLoop"
        className="h-12 w-auto object-contain"
      />

      {!compact && (
        <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
          Learn<span className="gradient-text">Loop</span>
        </span>
      )}
    </Link>
  );
}
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardHref = dashboardPathForRole(user?.role);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/40 bg-white/85 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85' : 'bg-transparent'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/70 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-900">
              {link.label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <IconButton label="Toggle theme" onClick={toggleTheme}>{isDark ? <Sun /> : <Moon />}</IconButton>
          {isAuthenticated && (
            <Link to="/notifications" className="relative">
              <IconButton as="span" label="Notifications"><Bell /></IconButton>
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{unreadCount}</span>}
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to={dashboardHref} className="btn btn-secondary">Dashboard</Link>
              <button className="btn btn-ghost" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
        <button className="grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white/70 lg:hidden dark:border-slate-800 dark:bg-slate-900/80" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 240 }} className="ml-auto flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-soft dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <Logo />
                <IconButton label="Close menu" onClick={() => setOpen(false)}><X /></IconButton>
              </div>
              <div className="mt-10 grid gap-3">
                {navLinks.map((link) => (
                  <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-4 text-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-900">
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-auto grid gap-3">
                <button className="btn btn-secondary justify-center" onClick={toggleTheme}>{isDark ? 'Light Mode' : 'Dark Mode'}</button>
                <Link to={isAuthenticated ? dashboardHref : '/login'} className="btn btn-primary justify-center" onClick={() => setOpen(false)}>
                  {isAuthenticated ? 'Open Dashboard' : 'Login'}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer id="about" className="border-t border-slate-200 bg-white/70 py-12 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">A premium mentorship and skill-sharing platform for learners, mentors, and program teams.</p>
          <div className="mt-5 flex gap-3">
            {[FaLinkedinIn, FaGithub, FaXTwitter, FaFacebookF].map((Icon, index) => (
              <span key={index} className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"><Icon /></span>
            ))}
          </div>
        </div>
        {[
          ['Platform', 'Find Mentors', 'Sessions', 'Resources', 'Ratings'],
          ['Company', 'About', 'Careers', 'Contact', 'Security'],
          ['Contact', 'hello@learnloop.dev', '+91 98765 43210', 'Bengaluru, India'],
        ].map(([title, ...items]) => (
          <div key={title}>
            <h3 className="font-bold text-slate-950 dark:text-white">{title}</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              {items.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}

export function IconButton({ children, label, onClick, as: Tag = 'button' }) {
  return (
    <Tag onClick={onClick} className="grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white/75 text-slate-700 shadow-sm transition hover:scale-105 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" aria-label={label} title={label}>
      {children}
    </Tag>
  );
}

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} whileHover={{ scale: 1.08 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-glow" aria-label="Scroll to top">
          <ArrowUp />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function CursorGlow() {
  const [point, setPoint] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const move = (event) => setPoint({ x: event.clientX, y: event.clientY });
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return <div className="pointer-events-none fixed z-0 hidden size-72 rounded-full bg-blue-400/10 blur-3xl lg:block" style={{ left: point.x - 144, top: point.y - 144 }} />;
}

export function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">{text}</p>}
    </div>
  );
}

export function GlassCard({ children, className = '' }) {
  return <div className={`glass-card ${className}`}>{children}</div>;
}

export function StatCard({ icon: Icon, label, value, tone = 'blue' }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</h3>
        </div>
        <span className={`metric-icon metric-${tone}`}><Icon size={22} /></span>
      </div>
    </GlassCard>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search' }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Search size={18} className="text-slate-400" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent outline-none" />
    </label>
  );
}

export function FilterSelect({ value, onChange, options, label = 'Filter' }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Filter size={18} className="text-slate-400" />
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent outline-none">
        <option value="">{label}</option>
        {options.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  );
}

export function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 18 }} className="w-full max-w-xl rounded-[2rem] border border-white/40 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">{title}</h3>
              <IconButton label="Close modal" onClick={onClose}><X /></IconButton>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Loader({ label = 'Loading LearnLoop' }) {
  return <div className="grid min-h-[40vh] place-items-center text-slate-500"><Loader2 className="mb-3 animate-spin text-blue-600" />{label}</div>;
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export function Pagination() {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button className="btn btn-ghost">Previous</button>
      <div className="flex gap-2">{[1, 2, 3].map((page) => <button key={page} className={`grid size-10 place-items-center rounded-xl text-sm font-bold ${page === 1 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900'}`}>{page}</button>)}</div>
      <button className="btn btn-secondary">Next</button>
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', text = 'New activity will appear in this workspace as soon as it is available.' }) {
  return (
    <GlassCard className="grid place-items-center p-10 text-center">
      <div className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-glow"><Search /></div>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </GlassCard>
  );
}

export function ErrorState({ title = 'Unable to load data', text = 'Please try again or check that the backend server is running.' }) {
  return <EmptyState title={title} text={text} />;
}

export function Sidebar({ menu, open, onClose }) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-5">
        <Logo />
        <button className="lg:hidden" onClick={onClose} aria-label="Close sidebar"><X /></button>
      </div>
      <div className="grid gap-1 px-3">
        {menu.map(([label, Icon, href]) => (
          <NavLink key={label} to={href} end className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${isActive ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}>
            <Icon size={19} /> {label}
          </NavLink>
        ))}
      </div>
      <div className="mt-auto p-4">
        <GlassCard className="p-4">
          <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-300">Pro Tip</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use filters and saved resources to keep every mentorship loop visible.</p>
        </GlassCard>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85 lg:block">{content}</aside>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="h-full w-80 max-w-[86vw] bg-white dark:bg-slate-950">{content}</motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Topbar({ title, subtitle, onMenu }) {
  const { toggleTheme, isDark } = useTheme();
  const { unreadCount } = useNotifications();
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/85 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white lg:hidden dark:border-slate-800 dark:bg-slate-900" aria-label="Open sidebar"><Menu /></button>
        <div>
          <h1 className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{title}</h1>
          <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton label="Toggle theme" onClick={toggleTheme}>{isDark ? <Sun /> : <Moon />}</IconButton>
        <Link to="/notifications" className="relative"><IconButton as="span" label="Notifications"><Bell /></IconButton>{unreadCount > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{unreadCount}</span>}</Link>
      </div>
    </div>
  );
}

export function ResourceCard({ item, onDownload, downloadLoading }) {
  const resourceId = item.id || item._id;

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"><Download /></div>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">{item.fileType || item.type}</span>
      </div>
      <h3 className="mt-4 text-lg font-black">{item.title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">{(item.tags || []).map((tag) => <span key={tag} className="chip">{tag}</span>)}</div>
      <button className="btn btn-secondary mt-5 w-full justify-center" onClick={() => onDownload(resourceId)} disabled={downloadLoading === resourceId}>
        <Download size={17} /> {downloadLoading === resourceId ? 'Downloading...' : 'Download'}
      </button>
    </GlassCard>
  );
}

export function NotificationCard({ item, onRead }) {
  return (
    <GlassCard className={`p-5 ${!item.isRead ? 'ring-2 ring-blue-500/30' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black">{item.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.message || item.text}</p>
          <p className="mt-3 text-xs font-bold uppercase text-blue-600 dark:text-blue-300">{item.createdAt ? new Date(item.createdAt).toLocaleString() : item.time}</p>
        </div>
        {!item.isRead && <button className="btn btn-ghost whitespace-nowrap" onClick={() => onRead(item.id)}>Mark read</button>}
      </div>
    </GlassCard>
  );
}
