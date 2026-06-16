import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(null);

function normalizeNotification(notification) {
  return {
    ...notification,
    id: notification.id || notification._id,
    isRead: notification.isRead ?? false
  };
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    let canceled = false;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await notificationService.list();
        if (!canceled) {
          setNotifications((response?.notifications || []).map(normalizeNotification));
        }
      } catch (error) {
        if (!canceled) toast.error(error?.message || 'Unable to load notifications');
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchNotifications();
    return () => { canceled = true; };
  }, [user]);

  const markRead = async (id) => {
    try {
      await notificationService.read(id);
      setNotifications((items) => items.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    } catch (error) {
      toast.error(error?.message || 'Unable to mark notification as read');
    }
  };

  const markAllRead = async () => {
    try {
      const unreadIds = notifications.filter((item) => !item.isRead).map((item) => item.id);
      await Promise.all(unreadIds.map((id) => notificationService.read(id)));
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      toast.error(error?.message || 'Unable to mark all notifications as read');
    }
  };

  const pushNotification = (item) => {
    setNotifications((items) => [{ id: Date.now(), isRead: false, time: 'now', ...item }, ...items]);
  };

  const value = useMemo(
    () => ({
      notifications,
      loading,
      unreadCount: notifications.filter((item) => !item.isRead).length,
      markRead,
      markAllRead,
      pushNotification,
    }),
    [notifications, loading],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
