import React, { useState } from 'react';
import { QrCode, User, Plus, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleListPropertyClick = () => {
    if (!user) {
      onOpenAuth();
    } else {
      navigate('/list-property');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--navbar-bg)] backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-black">
              <QrCode size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">TOLETBRO</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link to="/search/rent" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Rent</Link>
            <Link to="/search/buy" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Buy</Link>
            {user?.role === 'OWNER' ? (
              <Link to="/dashboard" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Dashboard</Link>
            ) : (
              <Link to="/favorites" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Favorites</Link>
            )}
            {user?.role === 'OWNER' ? (
              <Link to="/dashboard/qr" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Smart Tolet Board</Link>
            ) : (
              <Link to="/scan" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-brand">Scan Board</Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle - Always Visible */}
            <ThemeToggle />

            {/* List My Property - Text link for mobile, button for desktop */}
            <button 
              onClick={handleListPropertyClick}
              className="group relative flex items-center gap-1 px-1 py-1 transition-transform active:scale-95 md:rounded-xl md:bg-[var(--card-bg)] md:px-4 md:py-2 md:shadow-sm md:hover:scale-105 md:border md:border-[var(--border)]"
            >
              <Plus size={16} className="text-brand" />
              <span className="text-xs font-bold text-[var(--text-primary)] underline underline-offset-4 decoration-[var(--border)] md:no-underline">
                <span className="md:hidden">List</span>
                <span className="hidden md:inline">List your property</span>
              </span>
            </button>

            {user ? (
              <button 
                onClick={() => navigate('/profile')}
                className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-brand hover:text-black md:flex"
              >
                <User size={18} />
                <span>Profile</span>
              </button>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-brand hover:text-black md:flex"
              >
                <User size={18} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};
