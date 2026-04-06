import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCircle, 
  Mail, 
  QrCode, 
  LogOut, 
  ChevronRight, 
  Languages, 
  Moon, 
  Sun, 
  Share2, 
  Star,
  User as UserIcon,
  ShieldCheck,
  Building2,
  ArrowLeft,
  Calendar,
  Hash,
  Activity,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

import { PrivacyControls } from '../components/PrivacyControls';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthReady } = useAuth();
  const [view, setView] = useState<'menu' | 'properties'>('menu');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);

  useEffect(() => {
    if (user && user.role === 'OWNER') {
      setLoadingProps(true);
      api.getPropertiesByOwnerId(user.id).then(props => {
        setMyProperties(props);
        setLoadingProps(false);
      });
    }
  }, [user]);

  if (!isAuthReady) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <Loader2 size={48} className="animate-spin text-brand mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Loading Profile...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">
          <UserCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Please Sign In</h2>
        <p className="mt-2 text-[var(--text-secondary)]">Sign in to view your profile and manage your properties.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-8 rounded-2xl bg-brand px-8 py-4 font-bold text-black transition-transform hover:scale-105"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const menuItems = [
    {
      id: 'name',
      label: 'Name',
      value: user.name || 'Anonymous User',
      icon: UserIcon,
      onClick: () => {},
    },
    {
      id: 'user-type',
      label: 'User Type',
      value: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase(),
      icon: ShieldCheck,
      onClick: () => {},
    },
    {
      id: 'email',
      label: 'Email',
      value: user.email || 'Not provided',
      icon: Mail,
      onClick: () => {},
    },
    ...(user.role === 'OWNER' ? [
      {
        id: 'my-properties',
        label: 'My Properties',
        value: `${myProperties.length} Properties`,
        icon: Building2,
        onClick: () => setView('properties'),
      },
      {
        id: 'stb',
        label: 'Smart Tolet Board',
        icon: QrCode,
        onClick: () => navigate('/dashboard/qr'),
      },
      {
        id: 'privacy',
        label: 'Privacy Settings',
        icon: ShieldCheck,
        onClick: () => navigate('/privacy-controls'),
      }
    ] : []),
    {
      id: 'language',
      label: 'Language',
      value: 'English',
      icon: Languages,
      onClick: () => {},
    },
    {
      id: 'theme',
      label: 'Mode',
      value: theme === 'dark' ? 'Dark Mode' : 'Light Mode',
      icon: theme === 'dark' ? Moon : Sun,
      onClick: toggleTheme,
    },
    {
      id: 'share',
      label: 'Share App',
      icon: Share2,
      onClick: () => {
        if (navigator.share) {
          navigator.share({
            title: 'ToLetBro',
            text: 'Check out this amazing real estate app!',
            url: window.location.origin,
          });
        }
      },
    },
    {
      id: 'rating',
      label: 'App Rating',
      value: '4.8/5',
      icon: Star,
      onClick: () => {},
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 pb-32">
      <AnimatePresence mode="wait">
        {view === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="mb-12 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-brand ring-4 ring-brand/5">
                  <UserCircle size={64} />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-black shadow-lg">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{user.name || 'Anonymous User'}</h1>
              <p className="text-sm text-[var(--text-secondary)]">{user.phone || user.email}</p>
            </div>

            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={item.onClick}
                  className="flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg)] text-[var(--text-secondary)]">
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                      {item.value && (
                        <p className="text-xs text-[var(--text-secondary)]">{item.value}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[var(--text-secondary)]/40" />
                </motion.button>
              ))}

              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
                onClick={logout}
                className="mt-8 flex w-full items-center justify-between rounded-2xl border border-red-500/10 bg-red-500/5 p-5 text-red-500 transition-all hover:bg-red-500/10 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                    <LogOut size={20} />
                  </div>
                  <span className="text-sm font-bold">Sign Out</span>
                </div>
                <ChevronRight size={18} className="opacity-40" />
              </motion.button>
            </div>
          </motion.div>
        ) : view === 'properties' ? (
          <motion.div
            key="properties"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-8 flex items-center gap-4">
              <button 
                onClick={() => setView('menu')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)]"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Properties</h2>
            </div>
            <div className="space-y-4">
              {loadingProps ? (
                <div className="flex justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-brand" />
                </div>
              ) : myProperties.length > 0 ? (
                myProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card-bg)]"
                  >
                    <div className="flex gap-4 p-4">
                      <img 
                        src={property.imageUrl || null} 
                        alt={property.title}
                        className="h-24 w-24 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-[var(--text-primary)] line-clamp-1">{property.title}</h3>
                        <p className="text-xs text-[var(--text-secondary)]">{property.location}</p>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
                            <Calendar size={12} className="text-brand" />
                            <span>Active Listing</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
                            <Hash size={12} className="text-brand" />
                            <span>ID: {property.id}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
                            <Activity size={12} className="text-emerald-500" />
                            <span className="font-bold text-emerald-500">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Building2 size={48} className="mb-4 text-[var(--text-secondary)] opacity-20" />
                  <p className="text-[var(--text-secondary)]">You haven't posted any properties yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-12 text-center">
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] opacity-50">
          ToLetBro v1.0.4 • Built with Passion
        </p>
      </div>
    </div>
  );
};
