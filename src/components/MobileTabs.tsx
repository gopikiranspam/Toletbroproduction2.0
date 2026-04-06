import React from 'react';
import { Home, Search, QrCode, Heart, User, Plus, Shield, LayoutGrid } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface MobileTabsProps {
  onOpenAuth: () => void;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({ onOpenAuth }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  interface TabItem {
    icon: any;
    label: string;
    path: string;
    isHighlighted?: boolean;
    isLoginTrigger?: boolean;
  }

  const ownerTabs: TabItem[] = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Shield, label: 'Privacy', path: '/privacy-controls' },
    { icon: LayoutGrid, label: 'Boards', path: '/dashboard/qr' },
  ];

  const finderTabs: TabItem[] = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search/all' },
    { icon: QrCode, label: 'Scan', path: '/scan', isHighlighted: true },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
  ];

  const baseTabs = user?.role === 'OWNER' ? ownerTabs : finderTabs;
  
  // Add dynamic Profile/Login tab
  const tabs: TabItem[] = [
    ...baseTabs,
    { 
      icon: User, 
      label: user ? 'Profile' : 'Login', 
      path: user ? '/profile' : '#login',
      isLoginTrigger: !user 
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-[var(--border)] bg-[var(--navbar-bg)] pb-safe-area backdrop-blur-xl md:hidden transition-colors duration-300">
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab, index) => {
          if (tab.isHighlighted) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-black shadow-lg shadow-brand/30 transition-transform active:scale-90"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <tab.icon size={24} />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">{tab.label}</span>
                </div>
              </Link>
            );
          }

          if (tab.isLoginTrigger) {
            return (
              <button
                key="login-trigger"
                onClick={onOpenAuth}
                className="flex flex-col items-center gap-1 text-[var(--text-secondary)]/60 transition-colors"
              >
                <tab.icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive(tab.path) ? 'text-brand' : 'text-[var(--text-secondary)]/60'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
