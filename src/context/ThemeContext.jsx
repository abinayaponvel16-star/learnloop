import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from '../utils/storage';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => storage.get('learnloop_theme', 'light'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    storage.set('learnloop_theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
