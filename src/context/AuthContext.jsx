import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

const getResponseData = (response) => response?.data || response || {};
const getAuthData = (response) => {
  const data = getResponseData(response);
  return data?.data || data;
};

const sanitizeAvatar = (avatar) => {
  if (typeof avatar !== 'string') return avatar;
  if (avatar.startsWith('blob:') || avatar.startsWith('data:')) return '';
  return avatar;
};

const normalizeUser = (user) =>
  user
    ? {
      ...user,
      role: user.role || 'learner',
      avatar: sanitizeAvatar(user.avatar)
    }
    : null;

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => normalizeUser(storage.get('learnloop_user')));
  const [token, setToken] = useState(() => storage.get('learnloop_token'));
  const [loading, setLoading] = useState(Boolean(token));

  const setUser = useCallback((nextUser) => {
    const normalized = normalizeUser(nextUser);
    setUserState(normalized);
    if (normalized) storage.set('learnloop_user', normalized);
    else storage.remove('learnloop_user');
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .me()
      .then((response) => {
        const data = getAuthData(response);
        const profile = data.user || data;
        if (profile) {
          setUser(profile);
        }
      })
      .catch(() => {
        setToken(null);
        setUser(null);
        storage.remove('learnloop_token');
      })
      .finally(() => setLoading(false));
  }, [setUser, token]);

  const saveSession = (response) => {
    const data = getAuthData(response);
    const nextToken = data.token || data.accessToken || data.jwt;
    const nextUser = data.user;
    if (nextToken) {
      setToken(nextToken);
      storage.set('learnloop_token', nextToken);
    }
    if (nextUser) {
      setUser(nextUser);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user || token),
      login: async (payload) => {
        const response = await authService.login(payload);
        saveSession(response);
        toast.success('Welcome back to LearnLoop');
        return response;
      },
      register: async (payload) => {
        const response = await authService.register(payload);
        saveSession(response);
        toast.success('Your LearnLoop account is ready');
        return response;
      },
      logout: async () => {
        try {
          await authService.logout();
        } finally {
          setUser(null);
          setToken(null);
          storage.remove('learnloop_token');
        }
      },
      setUser,
    }),
    [loading, setUser, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
