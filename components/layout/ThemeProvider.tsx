'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'day' | 'night';

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'day',
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('day');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
    const initial = stored ?? preferred;
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial === 'night' ? 'night' : '');
  }, []);

  function toggle() {
    setTheme((prev) => {
      const next: Theme = prev === 'day' ? 'night' : 'day';
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next === 'night' ? 'night' : '');
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
