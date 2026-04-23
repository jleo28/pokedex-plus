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
  const [theme, setTheme] = useState<Theme>('night');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const initial = stored ?? 'night';
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
