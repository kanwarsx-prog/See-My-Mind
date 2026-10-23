import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  syncUserTheme: (preferredTheme?: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'see_my_mind_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  // Apply or remove .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;

    const checkSystemDark = () =>
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldBeDark = theme === 'dark' || (theme === 'system' && checkSystemDark());
    setIsDark(shouldBeDark);

    if (shouldBeDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Media query listener when in system mode
    if (theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // storage unavailable
    }
    // Asynchronously persist to database if authenticated
    api.updateTheme(newTheme).catch((err) => {
      console.warn('Failed to persist theme to backend database:', err);
    });
  };

  const toggleTheme = () => {
    // If currently dark (either via dark setting or system dark), switch to light; otherwise dark
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  };

  const syncUserTheme = (preferredTheme?: string | null) => {
    if (
      preferredTheme &&
      ['light', 'dark', 'system'].includes(preferredTheme) &&
      preferredTheme !== theme
    ) {
      setThemeState(preferredTheme as ThemeMode);
      try {
        localStorage.setItem(STORAGE_KEY, preferredTheme);
      } catch {
        // storage unavailable
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme, syncUserTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
