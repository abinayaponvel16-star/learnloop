import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star, UploadCloud } from 'lucide-react';
import { EmptyState, FilterSelect, GlassCard, Modal, Navbar, NotificationCard, Pagination, ResourceCard, SearchBar } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { MentorGrid } from './Dashboards';
import { ProfileEditor } from '../components/ProfileEditor';
import { mentorshipService } from '../services/mentorshipService';
import { resourceService } from '../services/resourceService';
import { ratingService } from '../services/ratingService';
import { sessionService } from '../services/sessionService';

export function MentorsPage() {
  return (
    <div className="min-h-screen bg-canvas pt-28 text-slate-950 dark:bg-slate-950 dark:text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="font-black uppercase tracking-[0.24em] text-blue-600">Mentors</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Find the right expert</h1>
          <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Search by skill, rating, experience, and language. Request mentorship when a profile matches your goals.</p>
        </div>
        <MentorGrid />
      </main>
    </div>
  );
}

export function ProfilePage() {
  return (
    <div className="grid gap-6">
      <ProfileEditor />
    </div>
  );
}

export function SessionsPage() {
  const { user } = useAuth();
  const isMentor = user?.role === 'mentor';
  const isLearner = user?.role === 'learner';
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busySessionId, setBusySessionId] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const [resourceState, setResourceState] = useState({});

  const title = user?.role === 'mentor' ? 'Mentor session workspace ready' : 'Session workspace ready';
  const text = user?.role === 'mentor'
    ? 'Create sessions, share resources, and track learner progress from the mentor dashboard.'
    : 'Use the dashboard session table to join, start, end, upload resources, or submit feedback.';

  useEffect(() => {
    let canceled = false;
    const loadSessions = async () => {
      setLoading(true);
      try {
        const response = await sessionService.list();
        if (!canceled) setSessions(response?.sessions || []);
      } catch (error) {
        if (!canceled) toast.error(error?.message || 'Unable to load sessions');
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    loadSessions();
    return () => { canceled = true; };
  }, []);

  const updateSessionInList = (updatedSession) => {
    setSessions((current) => current.map((item) => (String(item._id || item.id) === String(updatedSession._id || updatedSession.id) ? updatedSession : item)));
  };

  const handleCompleteSession = async (sessionId) => {
    setBusySessionId(sessionId);
    try {
      const response = await sessionService.complete(sessionId);
      updateSessionInList(response?.session || response?.data?.session || response);
      toast.success('Session marked as completed');
    } catch (error) {
      toast.error(error?.message || 'Unable to complete session');
    } finally {
      setBusySessionId(null);
    }
  };

  const handleCancelSession = async (sessionId) => {
    setBusySessionId(sessionId);
    try {
      const response = await sessionService.cancel(sessionId);
      updateSessionInList(response?.session || response?.data?.session || response);
      toast.success('Session cancelled successfully');
    } catch (error) {
      toast.error(error?.message || 'Unable to cancel session');
    } finally {
      setBusySessionId(null);
    }
  };

  const handleJoinSession = async (session) => {
    const sessionId = session._id || session.id;
    const meetingLink = session.meetingLink || session.link || session.url;
    if (!meetingLink) {
      toast.error('Meeting link is not available yet');
      return;
    }

    setBusySessionId(sessionId);
    try {
      const response = await sessionService.start(sessionId);
      updateSessionInList(response?.session || response?.data?.session || response);
      window.open(meetingLink, '_blank', 'noreferrer noopener');
    } catch (error) {
      toast.error(error?.message || 'Unable to join session');
    } finally {
      setBusySessionId(null);
    }
  };

  const handleResourceFieldChange = (sessionId, field, value) => {
    setResourceState((current) => ({
      ...current,
      [sessionId]: { ...current[sessionId], [field]: value }
    }));
  };

  const handleFeedbackFieldChange = (sessionId, field, value) => {
    setFeedbackState((current) => ({
      ...current,
      [sessionId]: { ...current[sessionId], [field]: value }
    }));
  };

  const handleShareResource = async (session) => {
    const sessionId = session._id || session.id;
    const state = resourceState[sessionId] || {};
    const { title = '', link = '', description = '' } = state;

    if (!title.trim() || !link.trim()) {
      toast.error('Resource title and link are required');
      return;
    }

    setBusySessionId(sessionId);
    try {
      const payload = new FormData();
      payload.append('title', title.trim());
      payload.append('description', description.trim());
      payload.append('fileUrl', link.trim());
      // fileType is required by the Resource model; when sharing a link (no file), set to 'link'
      payload.append('fileType', 'link');
      payload.append('sessionId', sessionId);
      payload.append('visibility', 'sessionOnly');

      await resourceService.upload(payload);
      setResourceState((current) => ({ ...current, [sessionId]: { title: '', link: '', description: '' } }));
      toast.success('Resource shared for this completed session');
    } catch (error) {
      toast.error(error?.message || 'Unable to share resource');
    } finally {
      setBusySessionId(null);
    }
  };

  const handleSubmitFeedback = async (session) => {
    const sessionId = session._id || session.id;
    const state = feedbackState[sessionId] || {};
    const communication = Number(state.communication) || 5;
    const teachingQuality = Number(state.teachingQuality) || 5;
    const knowledgeLevel = Number(state.knowledgeLevel) || 5;
    const helpfulness = Number(state.helpfulness) || 5;
    const stars = Number(state.stars) || Math.round((communication + teachingQuality + knowledgeLevel + helpfulness) / 4);
    const feedbackText = state.feedback || '';

    setBusySessionId(sessionId);
    try {
      await ratingService.create({
        sessionId,
        toUser: session.mentor?._id || session.mentor,
        stars,
        communication,
        teachingQuality,
        knowledgeLevel,
        helpfulness,
        feedback: feedbackText.trim()
      });
      setFeedbackState((current) => ({ ...current, [sessionId]: { ...current[sessionId], submitted: true } }));
      toast.success('Feedback submitted successfully');
    } catch (error) {
      toast.error(error?.message || 'Unable to submit feedback');
    } finally {
      setBusySessionId(null);
    }
  };

  if (loading) {
    return <div className="grid gap-6"><GlassCard className="p-6">Loading sessions...</GlassCard></div>;
  }

  if (!sessions.length) {
    return (
      <div className="grid gap-6">
        <GlassCard className="p-6">
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mt-2 text-slate-500">{text}</p>
          <p className="mt-4 text-slate-600">No sessions found yet. Check back after you create or join a session.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <GlassCard className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black">Sessions</h1>
            <p className="text-sm text-slate-500">Manage upcoming and past sessions from your dashboard.</p>
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-4">
        {sessions.map((session) => {
          const scheduledAt = session.scheduledTime ? new Date(session.scheduledTime).toLocaleString() : 'TBD';
          const platformLabel = session.meetingPlatform ? session.meetingPlatform.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Not set';
          const mentorName = session.mentor?.name || session.mentor?.username || 'Mentor';
          const meetingLink = session.meetingLink || session.link || session.url;
          const canJoin = isLearner && ['scheduled', 'ongoing'].includes(session.status) && meetingLink;

          return (
            <GlassCard key={session._id || session.id} className="p-6">
              <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-black">{session.topic || session.title || 'Session'}</h2>
                    <p className="mt-1 text-sm text-slate-500">{session.description || session.notes || 'No description available.'}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Scheduled</p>
                      <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{scheduledAt}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Meeting platform</p>
                      <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{platformLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                    <span>Status</span>
                    <span className="font-black text-slate-900 dark:text-white">{session.status || 'Scheduled'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                    <span>Duration</span>
                    <span className="font-black text-slate-900 dark:text-white">{session.duration || 60} min</span>
                  </div>

                  {isMentor && ['scheduled', 'ongoing'].includes(session.status) ? (
                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() => handleCompleteSession(session._id || session.id)}
                        disabled={busySessionId === (session._id || session.id)}
                        className="btn btn-primary w-full"
                      >
                        {busySessionId === (session._id || session.id) ? 'Working...' : 'Mark as Completed'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelSession(session._id || session.id)}
                        disabled={busySessionId === (session._id || session.id)}
                        className="btn btn-secondary w-full"
                      >
                        Cancel Session
                      </button>
                    </div>
                  ) : canJoin ? (
                    <button
                      type="button"
                      onClick={() => handleJoinSession(session)}
                      disabled={busySessionId === (session._id || session.id)}
                      className="btn btn-primary w-full"
                    >
                      {busySessionId === (session._id || session.id) ? 'Joining...' : 'Join Session'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="btn btn-secondary w-full cursor-not-allowed opacity-60"
                    >
                      {meetingLink ? 'Join unavailable' : 'Waiting for link'}
                    </button>
                  )}
                </div>
              </div>

              {isMentor && session.status === 'completed' ? (
                <GlassCard className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-lg font-black">Resource sharing</h3>
                  <p className="mt-1 text-sm text-slate-500">Share a link or resource for your learner after completing the session.</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="Resource title"
                      value={(resourceState[session._id || session.id]?.title) || ''}
                      onChange={(event) => handleResourceFieldChange(session._id || session.id, 'title', event.target.value)}
                      disabled={busySessionId === (session._id || session.id)}
                    />
                    <input
                      type="url"
                      className="input w-full"
                      placeholder="Resource link"
                      value={(resourceState[session._id || session.id]?.link) || ''}
                      onChange={(event) => handleResourceFieldChange(session._id || session.id, 'link', event.target.value)}
                      disabled={busySessionId === (session._id || session.id)}
                    />
                  </div>
                  <textarea
                    className="input mt-4 min-h-[120px] w-full resize-none"
                    placeholder="Notes for the learner (optional)"
                    value={(resourceState[session._id || session.id]?.description) || ''}
                    onChange={(event) => handleResourceFieldChange(session._id || session.id, 'description', event.target.value)}
                    disabled={busySessionId === (session._id || session.id)}
                  />
                  <button
                    type="button"
                    onClick={() => handleShareResource(session)}
                    disabled={busySessionId === (session._id || session.id)}
                    className="btn btn-primary mt-4"
                  >
                    {busySessionId === (session._id || session.id) ? 'Sharing...' : 'Share Resource'}
                  </button>
                </GlassCard>
              ) : null}

              {user?.role === 'learner' && session.status === 'completed' ? (
                <GlassCard className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-lg font-black">Submit feedback</h3>
                  <p className="mt-1 text-sm text-slate-500">Leave feedback for your mentor now that the session is complete.</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {['communication', 'teachingQuality', 'knowledgeLevel', 'helpfulness'].map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <select
                          className="input w-full"
                          value={(feedbackState[session._id || session.id]?.[key]) || 5}
                          onChange={(event) => handleFeedbackFieldChange(session._id || session.id, key, event.target.value)}
                          disabled={busySessionId === (session._id || session.id) || feedbackState[session._id || session.id]?.submitted}
                        >
                          {[1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>{value}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Overall stars</label>
                    <select
                      className="input w-full max-w-xs"
                      value={(feedbackState[session._id || session.id]?.stars) || 5}
                      onChange={(event) => handleFeedbackFieldChange(session._id || session.id, 'stars', event.target.value)}
                      disabled={busySessionId === (session._id || session.id) || feedbackState[session._id || session.id]?.submitted}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    className="input mt-4 min-h-[120px] w-full resize-none"
                    placeholder="Write your feedback..."
                    value={(feedbackState[session._id || session.id]?.feedback) || ''}
                    onChange={(event) => handleFeedbackFieldChange(session._id || session.id, 'feedback', event.target.value)}
                    disabled={busySessionId === (session._id || session.id) || feedbackState[session._id || session.id]?.submitted}
                  />
                  <button
                    type="button"
                    onClick={() => handleSubmitFeedback(session)}
                    disabled={busySessionId === (session._id || session.id) || feedbackState[session._id || session.id]?.submitted}
                    className="btn btn-primary mt-4"
                  >
                    {feedbackState[session._id || session.id]?.submitted ? 'Feedback submitted' : busySessionId === (session._id || session.id) ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </GlassCard>
              ) : null}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

export function ResourcesPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [resourcesList, setResourcesList] = useState([]);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    fileType: 'link',
    fileUrl: '',
    visibility: 'public',
    file: null,
  });
  const { user } = useAuth();
  const canUpload = ['mentor', 'admin'].includes(user?.role);

  useEffect(() => {
    let canceled = false;

    const loadResources = async () => {
      setLoading(true);
      try {
        const response = await resourceService.list();
        if (!canceled) setResourcesList(response?.resources || []);
      } catch (error) {
        if (!canceled) toast.error(error?.message || 'Unable to load resources');
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    loadResources();
    return () => { canceled = true; };
  }, []);

  const filtered = resourcesList.filter((item) => {
    const fileType = (item.fileType || item.type || '').toLowerCase();
    return (!query || item.title.toLowerCase().includes(query.toLowerCase())) && (!type || fileType === type.toLowerCase());
  });

  const handleDownload = async (id) => {
    setDownloadLoading(id);
    try {
      const response = await resourceService.download(id);
      const resource = response?.resource;
      if (resource?.fileUrl) {
        window.open(resource.fileUrl, '_blank');
      }
      toast.success('Download count updated');
    } catch (error) {
      toast.error(error?.message || 'Download failed');
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title.trim()) {
      toast.error('Resource title is required');
      return;
    }
    if (uploadForm.fileType === 'link' && !uploadForm.fileUrl.trim()) {
      toast.error('Resource link is required');
      return;
    }
    if (uploadForm.fileType !== 'link' && !uploadForm.file) {
      toast.error('Choose a file to upload');
      return;
    }

    const payload = new FormData();
    payload.append('title', uploadForm.title.trim());
    payload.append('description', uploadForm.description.trim());
    payload.append('fileType', uploadForm.fileType);
    payload.append('visibility', uploadForm.visibility);
    if (uploadForm.fileType === 'link') payload.append('fileUrl', uploadForm.fileUrl.trim());
    if (uploadForm.file) payload.append('file', uploadForm.file);

    setUploading(true);
    try {
      const response = await resourceService.upload(payload);
      setResourcesList((current) => [response?.resource || response, ...current]);
      setUploadForm({ title: '', description: '', fileType: 'link', fileUrl: '', visibility: 'public', file: null });
      setUploadOpen(false);
      toast.success('Resource uploaded');
    } catch (error) {
      toast.error(error?.message || 'Unable to upload resource');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <GlassCard className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h1 className="text-3xl font-black">Resources</h1><p className="text-sm text-slate-500">Upload and search PDF, PPT, DOC, image, video, and link resources.</p></div>
          {canUpload && <button className="btn btn-primary" onClick={() => setUploadOpen(true)}><UploadCloud size={18} /> Upload Resource</button>}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <SearchBar value={query} onChange={setQuery} placeholder="Search resources" />
          <FilterSelect value={type} onChange={setType} label="File type" options={['PDF', 'PPT', 'DOC', 'IMAGE', 'VIDEO', 'LINK']} />
        </div>
      </GlassCard>
      {loading ? (
        <GlassCard className="p-6">Loading resources...</GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((item) => (
            <ResourceCard key={item._id || item.id || item.title} item={item} onDownload={handleDownload} downloadLoading={downloadLoading} />
          ))}
        </div>
      )}
      <Pagination />
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload resource">
        <div className="grid gap-4">
          <input
            className="input"
            placeholder="Resource title"
            value={uploadForm.title}
            onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))}
            disabled={uploading}
          />
          <textarea
            className="input min-h-28 resize-none"
            placeholder="Description"
            value={uploadForm.description}
            onChange={(event) => setUploadForm((current) => ({ ...current, description: event.target.value }))}
            disabled={uploading}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              className="input"
              value={uploadForm.fileType}
              onChange={(event) => setUploadForm((current) => ({ ...current, fileType: event.target.value, file: null, fileUrl: '' }))}
              disabled={uploading}
            >
              {['link', 'pdf', 'ppt', 'doc', 'image', 'video'].map((value) => <option key={value} value={value}>{value.toUpperCase()}</option>)}
            </select>
            <input className="input" value="Public resource" disabled />
          </div>
          {uploadForm.fileType === 'link' ? (
            <input
              className="input"
              type="url"
              placeholder="https://example.com/resource"
              value={uploadForm.fileUrl}
              onChange={(event) => setUploadForm((current) => ({ ...current, fileUrl: event.target.value }))}
              disabled={uploading}
            />
          ) : (
            <input
              className="input"
              type="file"
              onChange={(event) => setUploadForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
              disabled={uploading}
            />
          )}
          <button className="btn btn-primary justify-center" type="button" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function RatingsPage() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    ratingService.list({ limit: 100 })
      .then((response) => {
        if (active) setRatings(response?.ratings || []);
      })
      .catch((error) => {
        if (active) toast.error(error?.message || 'Unable to load ratings');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <GlassCard className="p-6">
      <h1 className="text-3xl font-black">{user?.role === 'mentor' ? 'Review Feedback' : 'Your Feedback'}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {user?.role === 'mentor'
          ? 'See feedback learners submitted after completed sessions.'
          : 'Feedback is submitted from completed sessions, then tracked here.'}
      </p>
      {loading ? (
        <div className="mt-6">Loading ratings...</div>
      ) : ratings.length ? (
        <div className="mt-6 grid gap-4">
          {ratings.map((rating) => (
            <div key={rating._id || rating.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="font-black">{rating.sessionId?.topic || 'Completed session'}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {user?.role === 'mentor' ? `From ${rating.fromUser?.name || 'Learner'}` : `For ${rating.toUser?.name || 'Mentor'}`}
                  </p>
                </div>
                <div className="flex gap-1 text-amber-400" aria-label={`${rating.stars} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={18} fill={star <= rating.stars ? 'currentColor' : 'none'} className={star <= rating.stars ? 'text-amber-400' : 'text-slate-300'} />
                  ))}
                </div>
              </div>
              {rating.feedback && <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{rating.feedback}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['Communication', rating.communication],
                  ['Teaching', rating.teachingQuality],
                  ['Knowledge', rating.knowledgeLevel],
                  ['Helpfulness', rating.helpfulness],
                ].filter(([, value]) => value).map(([label, value]) => <span key={label} className="chip">{label}: {value}/5</span>)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6"><EmptyState title="No ratings yet" text="Completed-session feedback will appear here." /></div>
      )}
    </GlassCard>
  );
}

export function NotificationsPage() {
  const { notifications, markRead, markAllRead, loading } = useNotifications();
  return (
    <div className="grid gap-6">
      <GlassCard className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div><h1 className="text-3xl font-black">Notifications</h1><p className="text-sm text-slate-500">Real-time updates with unread badges and quick actions.</p></div>
        <button className="btn btn-secondary" onClick={markAllRead}>Mark All Read</button>
      </GlassCard>
      {loading ? (
        <GlassCard className="p-6">Loading notifications...</GlassCard>
      ) : (
        <div className="grid gap-3">
          {notifications.length ? notifications.map((item) => <NotificationCard key={item.id} item={item} onRead={markRead} />) : <EmptyState title="No notifications" text="You are all caught up." />}
        </div>
      )}
    </div>
  );
}

export function RequestsPage() {
  const { user } = useAuth();
  const isMentor = user?.role === 'mentor';
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await mentorshipService.list({ limit: 100 });
      setRequests(response?.mentorships || []);
    } catch (error) {
      toast.error(error?.message || 'Unable to load mentorship requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    mentorshipService.list({ limit: 100 })
      .then((response) => {
        if (active) setRequests(response?.mentorships || []);
      })
      .catch((error) => {
        if (active) toast.error(error?.message || 'Unable to load mentorship requests');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleAccept = async (id) => {
    setBusyId(id);
    try {
      await mentorshipService.accept(id);
      toast.success('Request accepted and session created');
      await loadRequests();
    } catch (error) {
      toast.error(error?.message || 'Unable to accept request');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    try {
      await mentorshipService.reject(id);
      toast.success('Request rejected');
      await loadRequests();
    } catch (error) {
      toast.error(error?.message || 'Unable to reject request');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <GlassCard className="p-6">Loading requests...</GlassCard>;

  return (
    <div className="grid gap-4">
      {requests.length ? requests.map((request) => {
        const id = request._id || request.id;
        const otherUser = isMentor ? request.learner : request.mentor;
        return (
          <GlassCard key={id} className="p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xl font-black">{request.skill} mentorship</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {isMentor ? `${otherUser?.name || 'Learner'} is waiting for your response` : `${otherUser?.name || 'Mentor'} - ${request.status}`}
                </p>
                {request.requestMessage && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{request.requestMessage}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip capitalize">{request.status}</span>
                {isMentor && request.status === 'pending' ? (
                  <>
                    <button className="btn btn-secondary" type="button" onClick={() => handleReject(id)} disabled={busyId === id}>Reject</button>
                    <button className="btn btn-primary" type="button" onClick={() => handleAccept(id)} disabled={busyId === id}>
                      {busyId === id ? 'Working...' : 'Accept'}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </GlassCard>
        );
      }) : <EmptyState title="No requests found" text="Mentorship requests from your account will appear here." />}
    </div>
  );
}
