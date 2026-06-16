export const dashboardPathForRole = (role) => {
  if (role === 'mentor') return '/mentor';
  if (role === 'admin') return '/admin';
  return '/learner';
};
