const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });

export function formatCount(value) {
  const number = Number(value) || 0;
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}m`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}k`;
  return String(number);
}

export function userName(value) {
  if (!value) return 'Unknown';
  if (typeof value === 'string') return value;
  return value.name || value.username || 'Unknown';
}

export function mentorSkill(mentor) {
  const skills = mentor?.skillsToTeach || mentor?.skills || [];
  return skills[0] || 'Mentorship';
}

export function mentorToCard(mentor) {
  return {
    id: mentor._id || mentor.id,
    name: mentor.name || mentor.username || 'Mentor',
    skill: mentorSkill(mentor),
    rating: mentor.averageRating || 0,
    experience: `${mentor.experienceYears || 0} yrs`,
    sessions: mentor.sessionsCompleted || 0,
    languages: mentor.languages || [],
    bio: mentor.bio || 'No bio added yet.',
    raw: mentor,
  };
}

export function formatSession(session) {
  const dateValue = session.scheduledTime || session.date || session.startDate || session.createdAt;
  return {
    id: session._id || session.id || `${session.topic}-${dateValue}`,
    mentor: userName(session.mentor),
    learner: userName(session.learner),
    topic: session.topic || session.title || 'Session',
    date: dateValue ? new Date(dateValue).toLocaleString() : 'TBD',
    duration: session.duration || 0,
    status: session.status || 'scheduled',
    link: session.meetingLink || session.link,
  };
}

export function formatGrowth(monthlyGrowth = {}) {
  const rows = new Map();

  const addRows = (items = [], key) => {
    items.forEach((item) => {
      const month = item?._id?.month;
      const year = item?._id?.year;
      const label = month ? monthFormatter.format(new Date(year || new Date().getFullYear(), month - 1, 1)) : 'Now';
      const row = rows.get(label) || { month: label, users: 0, sessions: 0 };
      row[key] = item.count || 0;
      rows.set(label, row);
    });
  };

  addRows(monthlyGrowth.users, 'users');
  addRows(monthlyGrowth.sessions, 'sessions');

  return Array.from(rows.values());
}

export function formatTopSkills(skills = []) {
  return skills.map((item) => ({
    name: item._id || item.name || 'Unspecified',
    value: item.requests || item.value || 0,
  })).filter((item) => item.value > 0);
}
