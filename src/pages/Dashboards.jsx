import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';
import { Download, Plus, Star, UploadCloud, Users, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState, FilterSelect, GlassCard, Loader, Modal, Pagination, SearchBar, StatCard } from '../components/ui';
import { adminMetricConfig } from '../constants/appConfig';
import { adminService } from '../services/adminService';
import { mentorshipService } from '../services/mentorshipService';
import { resourceService } from '../services/resourceService';
import { sessionService } from '../services/sessionService';
import { userService } from '../services/userService';
import { formatCount, formatGrowth, formatSession, formatTopSkills, mentorToCard, userName } from '../utils/dataFormatters';
import { storage } from '../utils/storage';

export function LearnerDashboard() {
  const [sessions, setSessions] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [sessionsResponse, mentorshipsResponse, resourcesResponse] = await Promise.all([
          sessionService.list({ limit: 100 }),
          mentorshipService.list({ limit: 100 }),
          resourceService.list({ limit: 100 }),
        ]);

        if (!canceled) {
          setSessions(sessionsResponse?.sessions || []);
          setMentorships(mentorshipsResponse?.mentorships || []);
          setResources(resourcesResponse?.resources || []);
        }
      } catch (error) {
        if (!canceled) toast.error(error?.message || 'Unable to load learner dashboard');
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    loadDashboard();
    return () => { canceled = true; };
  }, []);

  const completedSessions = sessions.filter((session) => session.status === 'completed').length;
  const pendingRequests = mentorships.filter((request) => request.status === 'pending').length;

  if (loading) return <Loader label="Loading dashboard" />;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Video} label="Total Sessions" value={sessions.length} />
        <StatCard icon={Users} label="Pending Requests" value={pendingRequests} tone="amber" />
        <StatCard icon={Star} label="Completed Sessions" value={completedSessions} tone="emerald" />
        <StatCard icon={Download} label="Available Resources" value={resources.length} tone="violet" />
      </div>
      <GlassCard className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h2 className="text-2xl font-black">Recommended mentors</h2><p className="text-sm text-slate-500">Search, filter, view profiles, and send requests.</p></div>
          <button className="btn btn-primary"><Plus size={18} /> New Request</button>
        </div>
        <MentorGrid compact />
      </GlassCard>
      <SessionTable sessions={sessions} />
    </div>
  );
}

export function MentorDashboard() {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [acceptedMentorships, setAcceptedMentorships] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    mentorshipId: '',
    topic: '',
    scheduledTime: '',
    duration: '60',
    meetingLink: '',
  });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [sessionsResponse, requestsResponse, acceptedResponse, resourcesResponse] = await Promise.all([
        sessionService.list({ limit: 100 }),
        mentorshipService.list({ status: 'pending', limit: 20 }),
        mentorshipService.list({ status: 'accepted', limit: 100 }),
        resourceService.list({ limit: 100 }),
      ]);

      setSessions(sessionsResponse?.sessions || []);
      setRequests(requestsResponse?.mentorships || []);
      setAcceptedMentorships(acceptedResponse?.mentorships || []);
      setResources(resourcesResponse?.resources || []);
    } catch (error) {
      toast.error(error?.message || 'Unable to load mentor dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshRequests = async () => {
    setRefreshing(true);
    try {
      const requestsResponse = await mentorshipService.list({ status: 'pending', limit: 20 });
      setRequests(requestsResponse?.mentorships || []);
      toast.success('Requests updated');
    } catch (error) {
      toast.error(error?.message || 'Unable to refresh requests');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    loadDashboard().finally(() => {
      if (!active) return;
    });
    return () => { active = false; };
  }, []);

  // Auto-refresh requests every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      mentorshipService.list({ status: 'pending', limit: 20 })
        .then((response) => {
          setRequests(response?.mentorships || []);
        })
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Real-time updates via Server-Sent Events (SSE)
  useEffect(() => {
    const token = storage.get('learnloop_token');
    if (!token) return;

    const base = import.meta.env.VITE_API_URL || '/api/v1';
    const url = `${base}/mentorships/stream?token=${encodeURIComponent(token)}`;
    let es;
    try {
      es = new EventSource(url);
    } catch {
      return;
    }

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload?.type === 'mentorship_request' && payload.mentorship) {
          setRequests((prev) => [payload.mentorship, ...prev.filter((r) => String(r._id) !== String(payload.mentorship._id))]);
          toast.success('New mentorship request received');
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      try { es.close(); } catch (e) {}
    };

    return () => es.close();
  }, []);

  const activeSessions = sessions.filter((session) => ['scheduled', 'ongoing'].includes(session.status)).length;
  const learners = new Set(sessions.map((session) => session.learner?._id || session.learner).filter(Boolean)).size;
  const completedSessions = sessions.filter((session) => session.status === 'completed').length;

  const handleAccept = async (id) => {
    try {
      await mentorshipService.accept(id);
      toast.success('Request accepted');
      loadDashboard();
    } catch (error) {
      toast.error(error?.message || 'Unable to accept request');
    }
  };

  const handleReject = async (id) => {
    try {
      await mentorshipService.reject(id);
      toast.success('Request rejected');
      loadDashboard();
    } catch (error) {
      toast.error(error?.message || 'Unable to reject request');
    }
  };

  const handleCreateSession = async () => {
    const selected = acceptedMentorships.find((item) => String(item._id || item.id) === String(sessionForm.mentorshipId));
    if (!selected) {
      toast.error('Choose an accepted mentorship');
      return;
    }
    if (!sessionForm.topic.trim()) {
      toast.error('Session topic is required');
      return;
    }
    if (!sessionForm.scheduledTime) {
      toast.error('Scheduled time is required');
      return;
    }

    setCreatingSession(true);
    try {
      const response = await sessionService.create({
        mentorshipId: selected._id || selected.id,
        learner: selected.learner?._id || selected.learner,
        topic: sessionForm.topic.trim(),
        scheduledTime: new Date(sessionForm.scheduledTime).toISOString(),
        duration: Number(sessionForm.duration) || 60,
        meetingPlatform: 'google-meet',
        meetingLink: sessionForm.meetingLink.trim() || undefined,
      });
      setSessions((current) => [response?.session || response, ...current]);
      setSessionForm({ mentorshipId: '', topic: '', scheduledTime: '', duration: '60', meetingLink: '' });
      setOpen(false);
      toast.success('Session created');
    } catch (error) {
      toast.error(error?.message || 'Unable to create session');
    } finally {
      setCreatingSession(false);
    }
  };

  if (loading) return <Loader label="Loading dashboard" />;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Total Learners" value={learners} />
        <StatCard icon={Video} label="Active Sessions" value={activeSessions} tone="emerald" />
        <StatCard icon={Star} label="Completed Sessions" value={completedSessions} tone="amber" />
        <StatCard icon={UploadCloud} label="Resources Shared" value={resources.length} tone="violet" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <SessionTable sessions={sessions} />
        <GlassCard className="p-6">
          <h2 className="text-2xl font-black">Incoming requests</h2>
          <div className="mt-5 grid gap-3">
            {loading || refreshing ? (
              <div className="py-8"><Loader label="Loading requests" /></div>
            ) : requests.length ? (
              requests.map((request) => (
                <div key={request._id || request.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black">{userName(request.learner)}</h3>
                      <p className="mt-1 text-sm text-slate-500">Wants help with <span className="font-semibold text-slate-700 dark:text-slate-300">{request.skill}</span></p>
                      {request.requestMessage && (
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic">"{request.requestMessage}"</p>
                      )}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                      Pending
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="btn btn-secondary flex-1" onClick={() => handleAccept(request._id || request.id)}>Accept</button>
                    <button className="btn btn-ghost flex-1" onClick={() => handleReject(request._id || request.id)}>Reject</button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No pending requests" text="New mentorship requests will appear here." />
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-secondary flex-1 justify-center" onClick={refreshRequests} disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="btn btn-primary flex-1 justify-center" onClick={() => setOpen(true)}><Plus size={18} /> Create Session</button>
          </div>
        </GlassCard>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Create session">
        <div className="grid gap-4">
          <select
            className="input"
            value={sessionForm.mentorshipId}
            onChange={(event) => {
              const selected = acceptedMentorships.find((item) => String(item._id || item.id) === event.target.value);
              setSessionForm((current) => ({
                ...current,
                mentorshipId: event.target.value,
                topic: current.topic || selected?.skill || '',
              }));
            }}
            disabled={creatingSession}
          >
            <option value="">Choose accepted mentorship</option>
            {acceptedMentorships.map((mentorship) => (
              <option key={mentorship._id || mentorship.id} value={mentorship._id || mentorship.id}>
                {userName(mentorship.learner)} - {mentorship.skill}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Topic"
            value={sessionForm.topic}
            onChange={(event) => setSessionForm((current) => ({ ...current, topic: event.target.value }))}
            disabled={creatingSession}
          />
          <input
            className="input"
            type="datetime-local"
            value={sessionForm.scheduledTime}
            onChange={(event) => setSessionForm((current) => ({ ...current, scheduledTime: event.target.value }))}
            disabled={creatingSession}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="input"
              type="number"
              min="15"
              placeholder="Duration"
              value={sessionForm.duration}
              onChange={(event) => setSessionForm((current) => ({ ...current, duration: event.target.value }))}
              disabled={creatingSession}
            />
            <input
              className="input"
              placeholder="Meeting link (optional)"
              value={sessionForm.meetingLink}
              onChange={(event) => setSessionForm((current) => ({ ...current, meetingLink: event.target.value }))}
              disabled={creatingSession}
            />
          </div>
          <button className="btn btn-primary justify-center" onClick={handleCreateSession} disabled={creatingSession}>
            {creatingSession ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [dashboardResponse, usersResponse, resourcesResponse] = await Promise.all([
          adminService.dashboard(),
          adminService.users({ limit: 20 }),
          adminService.resources({ limit: 100 }),
        ]);

        if (!canceled) {
          setDashboard(dashboardResponse || {});
          setUsers(usersResponse?.users || []);
          setResources(resourcesResponse?.resources || []);
        }
      } catch (error) {
        if (!canceled) toast.error(error?.message || 'Unable to load admin dashboard');
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    loadDashboard();
    return () => { canceled = true; };
  }, []);

  const adminMetrics = adminMetricConfig.map((metric) => ({
    ...metric,
    value: formatCount(dashboard?.[metric.key]),
  }));
  const growthData = formatGrowth(dashboard?.monthlyGrowth);
  const skillData = formatTopSkills(dashboard?.topSkills);

  if (loading) return <Loader label="Loading admin dashboard" />;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminMetrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="p-6">
          <h2 className="text-2xl font-black">Monthly Growth</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="sessions" stroke="#14B8A6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <h2 className="text-2xl font-black">Top Skills</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={skillData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={102}>
                  {skillData.map((entry, index) => <Cell key={entry.name} fill={['#2563EB', '#7C3AED', '#14B8A6', '#F59E0B'][index % 4]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
      <AdminTable users={users} resources={resources} />
    </div>
  );
}

export function MentorGrid({ compact = false }) {
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    const loadMentors = async () => {
      setLoading(true);
      try {
        const response = await userService.mentors({ limit: compact ? 4 : 100 });
        if (!canceled) setMentors((response?.mentors || []).map(mentorToCard));
      } catch (error) {
        if (!canceled) toast.error(error?.message || 'Unable to load mentors');
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    loadMentors();
    return () => { canceled = true; };
  }, [compact]);

  const skillOptions = useMemo(() => Array.from(new Set(mentors.map((mentor) => mentor.skill).filter(Boolean))), [mentors]);
  const filtered = mentors.filter((mentor) => (!query || mentor.name.toLowerCase().includes(query.toLowerCase()) || mentor.skill.toLowerCase().includes(query.toLowerCase())) && (!skill || mentor.skill === skill));

  return (
    <div className="mt-6">
      {!compact && (
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <SearchBar value={query} onChange={setQuery} placeholder="Search mentors" />
          <FilterSelect value={skill} onChange={setSkill} label="Filter by skill" options={skillOptions} />
          <FilterSelect value="" onChange={() => {}} label="Filter by rating" options={['4.9+', '4.8+', '4.5+']} />
        </div>
      )}
      {loading ? <Loader label="Loading mentors" /> : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
        </div>
      ) : <EmptyState title="No mentors found" text="Active mentor profiles from your database will appear here." />}
    </div>
  );
}

function MentorCard({ mentor }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    skill: mentor.skill || '',
    skillLevelRequired: 'beginner',
    requestMessage: ''
  });

  const handleSendRequest = async () => {
    if (!formData.skill.trim()) {
      toast.error('Please enter a skill');
      return;
    }

    setLoading(true);
    try {
      await mentorshipService.request({
        mentor: mentor.id,
        skill: formData.skill,
        skillLevelRequired: formData.skillLevelRequired,
        requestMessage: formData.requestMessage
      });
      toast.success('Mentorship request sent successfully!');
      setOpen(false);
      setFormData({
        skill: mentor.skill || '',
        skillLevelRequired: 'beginner',
        requestMessage: ''
      });
    } catch (error) {
      toast.error(error?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlassCard className="p-5">
        <div className="flex items-start gap-4">
          <div className="grid size-14 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-black text-white">{mentor.name.charAt(0)}</div>
          <div>
            <h3 className="font-black">{mentor.name}</h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">{mentor.skill}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{mentor.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip"><Star size={14} /> {mentor.rating}</span>
          <span className="chip">{mentor.experience}</span>
          <span className="chip">{mentor.sessions} sessions</span>
        </div>
        <button className="btn btn-primary mt-5 w-full justify-center" onClick={() => setOpen(true)}>Send Request</button>
      </GlassCard>

      <Modal open={open} onClose={() => setOpen(false)} title={`Request mentorship from ${mentor.name}`}>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Skill</label>
            <input 
              type="text" 
              className="input" 
              placeholder="What skill do you want to learn?" 
              value={formData.skill}
              onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Level</label>
            <select 
              className="input" 
              value={formData.skillLevelRequired}
              onChange={(e) => setFormData({ ...formData, skillLevelRequired: e.target.value })}
              disabled={loading}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message (Optional)</label>
            <textarea 
              className="input resize-none" 
              placeholder="Tell the mentor why you'd like their mentorship..." 
              rows="4"
              value={formData.requestMessage}
              onChange={(e) => setFormData({ ...formData, requestMessage: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              className="btn btn-secondary flex-1 justify-center" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary flex-1 justify-center" 
              onClick={handleSendRequest}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function SessionTable({ sessions = [] }) {
  const rows = sessions.map(formatSession);

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div><h2 className="text-2xl font-black">Sessions</h2><p className="text-sm text-slate-500">Join, start, end, upload resources, or submit feedback.</p></div>
        <button className="btn btn-secondary"><UploadCloud size={18} /> Upload Resource</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[820px] w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-900">
            <tr>{['Mentor', 'Learner', 'Topic', 'Date', 'Duration', 'Status', 'Actions'].map((head) => <th key={head} className="px-6 py-4">{head}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((session) => (
              <tr key={session.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-6 py-4 font-bold">{session.mentor}</td>
                <td className="px-6 py-4">{session.learner}</td>
                <td className="px-6 py-4">{session.topic}</td>
                <td className="px-6 py-4">{session.date}</td>
                <td className="px-6 py-4">{session.duration} min</td>
                <td className="px-6 py-4"><span className="chip">{session.status}</span></td>
                <td className="px-6 py-4">{session.link ? <a className="btn btn-ghost" href={session.link} target="_blank" rel="noreferrer">Join Session</a> : <span className="text-slate-400">No link</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <div className="p-6"><EmptyState title="No sessions found" text="Sessions from your database will appear here." /></div>}
    </GlassCard>
  );
}

function AdminTable({ users = [], resources = [] }) {
  return (
    <GlassCard className="p-6">
      <div className="grid gap-3 md:grid-cols-[1fr_180px_150px]">
        <SearchBar value="" onChange={() => {}} placeholder="Search users, sessions, resources" />
        <FilterSelect value="" onChange={() => {}} options={['Learner', 'Mentor', 'Admin']} />
        <button className="btn btn-primary justify-center"><Download size={18} /> Export</button>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-900">
            <tr>{['Name', 'Role', 'Sessions', 'Resources', 'Rating', 'Status'].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id || user.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-4 font-bold">{user.name}</td>
                <td className="px-4 py-4">{user.role}</td>
                <td className="px-4 py-4">{user.sessionsCompleted || 0}</td>
                <td className="px-4 py-4">{user.resourcesShared || resources.filter((item) => (item.uploadedBy?._id || item.uploadedBy) === (user._id || user.id)).length}</td>
                <td className="px-4 py-4">{user.averageRating || 0}</td>
                <td className="px-4 py-4"><span className="chip">{user.isActive === false ? 'Inactive' : 'Active'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!users.length && <div className="mt-6"><EmptyState title="No users found" text="Users from your database will appear here." /></div>}
      <Pagination />
    </GlassCard>
  );
}

export function SimpleAdminPage({ title }) {
  const [growthData, setGrowthData] = useState([]);

  useEffect(() => {
    let canceled = false;

    const loadData = async () => {
      try {
        const response = await adminService.dashboard();
        if (!canceled) setGrowthData(formatGrowth(response?.monthlyGrowth));
      } catch (error) {
        if (!canceled) toast.error(error?.message || 'Unable to load chart data');
      }
    };

    loadData();
    return () => { canceled = true; };
  }, []);

  return (
    <div className="grid gap-6">
      <AdminTable />
      <GlassCard className="p-6">
        <h2 className="text-2xl font-black">{title} Insights</h2>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#2563EB" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
