import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronDown, Play, Sparkles } from 'lucide-react';
import { GlassCard, Navbar, Footer, SectionHeader } from '../components/ui';
import { faqs, features } from '../constants/appConfig';
import { hoverLift, slideUp, stagger } from '../animations/motion';
import { useCounter } from '../hooks/useCounter';
import { userService } from '../services/userService';

function Counter({ stat }) {
  const { ref, value } = useCounter(stat.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
    >
      <GlassCard className="p-6 text-center">
        <div
          ref={ref}
          className="text-4xl font-black gradient-text"
        >
          {value.toLocaleString()}+
        </div>

        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
          {stat.label}
        </p>
      </GlassCard>
    </motion.div>
  );
}

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    let canceled = false;

    const loadStats = async () => {
      try {
        const response = await userService.stats();
        if (!canceled) setStats(response?.stats || []);
      } catch {
        if (!canceled) setStats([]);
      }
    };

    loadStats();
    return () => { canceled = true; };
  }, []);

  return (
    <div className="overflow-hidden bg-canvas text-ink dark:bg-slate-950 dark:text-white">
      <Navbar />
      <section className="relative min-h-screen pt-28">
        <div className="absolute inset-0 hero-grid" />
        <motion.div animate={{ y: [0, -18, 0], rotate: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 7 }} className="floating-shape left-[7%] top-32 bg-cyan-300/50" />
        <motion.div animate={{ y: [0, 22, 0], rotate: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 8 }} className="floating-shape right-[10%] top-52 bg-violet-300/50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={slideUp} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm backdrop-blur dark:border-blue-400/20 dark:bg-slate-900/70 dark:text-blue-200">
              <Sparkles size={16} /> Mentorship, sessions, resources, progress
            </motion.div>
            <motion.h1 variants={slideUp} className="mt-7 max-w-5xl text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-7xl lg:text-8xl">
              LearnLoop
            </motion.h1>
            <motion.p variants={slideUp} className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
              A premium mentorship and skill-sharing platform where learners discover experts, attend sessions, unlock resources, leave feedback, and track visible growth.
            </motion.p>
            <motion.div variants={slideUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn btn-primary justify-center">Get Started <ArrowRight size={18} /></Link>
              <Link to="/mentors" className="btn btn-secondary justify-center">Explore Mentors <Play size={18} /></Link>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 34, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="dashboard-mockup">
            <div className="mockup-topbar"><span /><span /><span /></div>
            <div className="grid gap-4 p-5 sm:grid-cols-[1fr_0.75fr]">
              <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-5 text-white">
                <p className="text-sm font-bold text-blue-100">Weekly growth</p>
                <h3 className="mt-2 text-4xl font-black">+42%</h3>
                <div className="mt-8 flex h-28 items-end gap-2">
                  {[35, 56, 42, 74, 64, 92, 82].map((height, index) => <span key={index} className="flex-1 rounded-t-xl bg-white/55" style={{ height: `${height}%` }} />)}
                </div>
              </div>
              <div className="grid gap-4">
                {['React Mentor', 'Session Live', 'Resource Ready'].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600"><CheckCircle2 size={18} /></span><b>{item}</b></div>
                    <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><span className="block h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600" style={{ width: `${72 + index * 8}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="section">
        <SectionHeader eyebrow="Features" title="Everything a learning loop needs" text="Premium workflows for discovery, mentorship, resource sharing, feedback, notifications, and admin visibility." />
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="mx-auto mt-12 grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
          {features.map(({ title, text, icon: Icon }) => (
            <motion.div key={title} variants={slideUp} {...hoverLift}>
              <GlassCard className="group h-full p-6">
                <span className="grid size-13 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-glow transition group-hover:rotate-6"><Icon /></span>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="section">
  <SectionHeader
    eyebrow="Statistics"
    title="Trusted by learners worldwide"
  />

  <motion.div
    className="mx-auto mt-12 grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-4 lg:px-8"
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
    variants={{
      hidden: {},
      show: {
        transition: {
          staggerChildren: 0.15,
        },
      },
    }}
  >
    {stats.map((stat) => (
      <Counter
        key={stat.label}
        stat={stat}
      />
    ))}
  </motion.div>
</section>

      <section className="section">
        <SectionHeader eyebrow="FAQ" title="Clear answers before launch" />
        <div className="mx-auto mt-10 max-w-3xl px-4 sm:px-6 lg:px-8">
          {faqs.map((item, index) => (
            <button key={item.q} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} className="mb-3 w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center justify-between gap-4 font-black">{item.q}<ChevronIcon open={activeFaq === index} /></span>
              {activeFaq === index && <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.a}</motion.p>}
            </button>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

function ChevronIcon({ open }) {
  return <ChevronDown className={`transition ${open ? 'rotate-180' : ''}`} size={18} />;
}
