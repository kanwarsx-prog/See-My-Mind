import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 shadow-2xs border ${
        isDark
          ? 'bg-slate-800/90 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-amber-200'
          : 'bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-navy'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode (Calm Slate)'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode (Calm Slate)'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-amber-300 transition-transform duration-200 rotate-0" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform duration-200 rotate-0" />
        )}
      </div>
      <span className="hidden sm:inline text-[11px] font-medium">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};
