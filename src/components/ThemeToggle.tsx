import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-9 w-16 cursor-pointer items-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] p-1 transition-colors hover:bg-[var(--bg)] overflow-hidden"
      aria-label="Toggle theme"
    >
      {/* Premium Inner Glow Effect */}
      <div className="siri-inner-glow" />
      
      <motion.div
        animate={{
          x: theme === 'dark' ? 28 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-black shadow-lg"
      >
        {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
      </motion.div>
      
      <div className="absolute inset-0 flex items-center justify-between px-2 text-[var(--text-secondary)]/30">
        <Sun size={12} className={theme === 'light' ? 'opacity-0' : 'opacity-100'} />
        <Moon size={12} className={theme === 'dark' ? 'opacity-0' : 'opacity-100'} />
      </div>
    </button>
  );
};
