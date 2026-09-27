import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'lm-theme';
const EVENT = 'lm-theme-change';

export const getTheme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#eef2f7' : '#080d1a');
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this session.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: theme }));
};

export const useTheme = () => {
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    const sync = (event) => setTheme(event.detail);
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const toggleTheme = useCallback(() => applyTheme(getTheme() === 'light' ? 'dark' : 'light'), []);

  return { theme, toggleTheme };
};
