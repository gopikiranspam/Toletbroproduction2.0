import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldCheck, AlertTriangle, Save, X } from 'lucide-react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { PrivacyControls, PrivacyControlsRef } from '../components/PrivacyControls';
import { useAuth } from '../context/AuthContext';

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();
  const [isDirty, setIsDirty] = useState(false);
  const privacyControlsRef = useRef<PrivacyControlsRef>(null);

  // Block navigation if dirty
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  if (!isAuthReady) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== 'OWNER') {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Access Restricted</h2>
        <p className="mt-2 text-[var(--text-secondary)]">Privacy controls are only available for property owners.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-8 rounded-2xl bg-brand px-8 py-4 font-bold text-black transition-transform hover:scale-105"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Privacy Settings</h2>
            <p className="text-xs text-[var(--text-secondary)]">Manage how and when tenants can reach you.</p>
          </div>
        </div>
        
        <PrivacyControls ref={privacyControlsRef} onDirtyChange={setIsDirty} />
      </motion.div>

      {/* Unsaved Changes Modal */}
      <AnimatePresence>
        {blocker.state === "blocked" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl"
            >
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <AlertTriangle size={32} />
                </div>
              </div>

              <h3 className="mb-2 text-center text-xl font-bold text-[var(--text-primary)]">Unsaved Changes</h3>
              <p className="mb-8 text-center text-sm text-[var(--text-secondary)]/60">
                You have unsaved settings. Do you want to save them before leaving?
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={async () => {
                    if (privacyControlsRef.current) {
                      await privacyControlsRef.current.save();
                    }
                    blocker.proceed();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-black transition-transform active:scale-95"
                >
                  <Save size={18} />
                  <span>Yes, Save & Leave</span>
                </button>
                
                <button 
                  onClick={() => blocker.proceed()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-4 font-bold text-[var(--text-primary)] transition-transform active:scale-95"
                >
                  <X size={18} />
                  <span>No, Discard & Leave</span>
                </button>
                
                <button 
                  onClick={() => blocker.reset()}
                  className="mt-2 text-center text-xs text-[var(--text-secondary)] underline"
                >
                  Stay on this page
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-12 text-center">
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] opacity-50">
          Your privacy is our priority
        </p>
      </div>
    </div>
  );
};
