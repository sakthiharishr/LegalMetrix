import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle = ({ style }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  const label = isLight ? 'Switch to dark mode' : 'Switch to light mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className="glass-btn-ghost"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border-subtle)',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
        ...style,
      }}
    >
      {isLight ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
};

export default ThemeToggle;
