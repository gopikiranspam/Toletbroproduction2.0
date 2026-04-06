import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, UserCircle, Home, LogIn, Loader2, Phone, ShieldCheck, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { ConfirmationResult } from 'firebase/auth';
import { safeLog } from '../utils/logger';

export type AuthModalMode = 'USER' | 'ADMIN';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: AuthModalMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode = 'USER' }) => {
  const { user, firebaseUser, loginWithGoogle, setupRecaptcha, clearRecaptcha, sendOtp, updateUserRole, checkUserExists, completeProfile } = useAuth();
  const [step, setStep] = useState<'PHONE_INPUT' | 'OTP_INPUT' | 'NAME_INPUT' | 'ROLE' | 'ADMIN_LOGIN'>('PHONE_INPUT');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Data
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'ADMIN') {
        setStep('ADMIN_LOGIN');
      } else {
        setStep('PHONE_INPUT');
      }
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (user && (step === 'PHONE_INPUT' || step === 'OTP_INPUT' || step === 'ADMIN_LOGIN')) {
      onClose();
    } else if (firebaseUser && !user && (step === 'PHONE_INPUT' || step === 'OTP_INPUT')) {
      // User is authenticated but has no profile
      setStep('NAME_INPUT');
    }
  }, [user, firebaseUser, step, onClose, mode]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      safeLog.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber.startsWith('+')) {
      setError('Please include country code (e.g., +91)');
      return;
    }
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await sendOtp(phoneNumber.trim());
      setConfirmationResult(result);
      setStep('OTP_INPUT');
      setResendTimer(60); // 60 seconds cooldown
    } catch (err: any) {
      safeLog.error('Send OTP error:', err);
      // If recaptcha failed, try re-initializing it
      if (err.code === 'auth/internal-error' || err.code === 'auth/argument-error' || err.message?.includes('internal-error')) {
        safeLog.log('Retrying recaptcha setup due to error');
        setupRecaptcha('recaptcha-container');
        setError(`Firebase internal error. Please ensure "${window.location.hostname}" is added to Authorized Domains in Firebase Console.`);
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await confirmationResult.confirm(otp);
      const fUser = result.user;
      if (fUser) {
        const exists = await checkUserExists(fUser.uid);
        if (exists) {
          onClose();
        } else {
          setStep('NAME_INPUT');
        }
      }
    } catch (err: any) {
      safeLog.error('Verify OTP error:', err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Please enter a valid name');
      return;
    }
    setStep('ROLE');
  };

  const handleSelectRole = async (role: UserRole) => {
    setIsLoggingIn(true);
    try {
      await completeProfile(name, role);
      onClose();
    } catch (error) {
      safeLog.error('Profile completion error:', error);
      setError('Failed to complete profile. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <X size={24} />
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            {mode === 'ADMIN' ? <ShieldCheck size={32} /> : <LogIn size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {step === 'ROLE' ? 'One last step' : step === 'NAME_INPUT' ? 'What should we call you?' : mode === 'ADMIN' ? 'Admin Access' : 'Welcome to ToLetBro'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {step === 'ROLE' ? 'Help us personalize your experience' : step === 'NAME_INPUT' ? 'Enter your name to continue' : mode === 'ADMIN' ? 'Secure administrator login' : 'Experience smart real estate'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'ADMIN_LOGIN' && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
                    Continue with Google
                  </>
                )}
              </button>

              {error && (
                <div className="rounded-xl bg-red-500/10 p-4 text-center text-xs font-medium text-red-500">
                  <p>{error}</p>
                  {error.includes('internal-error') && (
                    <div className="mt-2 pt-2 border-t border-red-500/20 text-[10px] text-red-400 text-left">
                      <p className="font-bold mb-1">Deep Dive Troubleshooting:</p>
                      <ul className="list-disc ml-3 space-y-0.5">
                        <li>Enable <strong>Identity Toolkit API</strong> in Google Cloud Console.</li>
                        <li>Verify <strong>Phone Auth</strong> is enabled in Firebase.</li>
                        <li>Ensure <strong>{window.location.hostname}</strong> is in Authorized Domains.</li>
                        <li>Check browser console for detailed logs.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 'PHONE_INPUT' && (
            <motion.div
              key="phone-input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <Phone className="absolute top-4 left-4 text-[var(--text-secondary)]" size={20} />
                  <input 
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-4 pl-12 pr-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand py-4 font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </form>

              {error && (
                <div className="rounded-xl bg-red-500/10 p-4 text-center text-xs font-medium text-red-500">
                  <p>{error}</p>
                  {error.includes('internal-error') && (
                    <div className="mt-2 pt-2 border-t border-red-500/20 text-[10px] text-red-400 text-left">
                      <p className="font-bold mb-1">Deep Dive Troubleshooting:</p>
                      <ul className="list-disc ml-3 space-y-0.5">
                        <li>Enable <strong>Identity Toolkit API</strong> in Google Cloud Console.</li>
                        <li>Verify <strong>Phone Auth</strong> is enabled in Firebase.</li>
                        <li>Ensure <strong>{window.location.hostname}</strong> is in Authorized Domains.</li>
                        <li>Check browser console for detailed logs.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 'OTP_INPUT' && (
            <motion.div
              key="otp-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button 
                onClick={() => setStep('PHONE_INPUT')}
                className="flex items-center gap-2 text-xs font-bold text-brand transition-colors hover:text-brand/80"
              >
                <ArrowLeft size={16} />
                Change phone number
              </button>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="relative">
                  <ShieldCheck className="absolute top-4 left-4 text-[var(--text-secondary)]" size={20} />
                  <input 
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-4 pl-12 pr-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand py-4 font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    disabled={resendTimer > 0 || isLoggingIn}
                    onClick={handleSendOtp}
                    className="text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-brand disabled:opacity-50"
                  >
                    {resendTimer > 0 
                      ? `Resend OTP in ${resendTimer}s` 
                      : 'Didn\'t receive code? Resend OTP'}
                  </button>
                </div>
              </form>

              {error && (
                <div className="rounded-xl bg-red-500/10 p-4 text-center text-xs font-medium text-red-500">
                  <p>{error}</p>
                  {error.includes('internal-error') && (
                    <div className="mt-2 pt-2 border-t border-red-500/20 text-[10px] text-red-400 text-left">
                      <p className="font-bold mb-1">Deep Dive Troubleshooting:</p>
                      <ul className="list-disc ml-3 space-y-0.5">
                        <li>Enable <strong>Identity Toolkit API</strong> in Google Cloud Console.</li>
                        <li>Verify <strong>Phone Auth</strong> is enabled in Firebase.</li>
                        <li>Ensure <strong>{window.location.hostname}</strong> is in Authorized Domains.</li>
                        <li>Check browser console for detailed logs.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 'NAME_INPUT' && (
            <motion.div
              key="name-input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div className="relative">
                  <UserCircle className="absolute top-4 left-4 text-[var(--text-secondary)]" size={20} />
                  <input 
                    type="text"
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-4 pl-12 pr-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand py-4 font-bold text-black transition-transform hover:scale-[1.02]"
                >
                  Continue
                </button>
              </form>
            </motion.div>
          )}

          {step === 'ROLE' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <p className="mb-6 text-center text-sm text-[var(--text-secondary)]">Hi {name}, tell us how you'll use ToLetBro</p>
              
              <button 
                onClick={() => handleSelectRole('OWNER')}
                disabled={isLoggingIn}
                className="flex w-full items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-left transition-all hover:border-brand/50 hover:bg-brand/5 disabled:opacity-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Home size={24} />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">Property Owner</p>
                  <p className="text-xs text-[var(--text-secondary)]">I want to list and manage properties</p>
                </div>
              </button>

              <button 
                onClick={() => handleSelectRole('FINDER')}
                disabled={isLoggingIn}
                className="flex w-full items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-left transition-all hover:border-brand/50 hover:bg-brand/5 disabled:opacity-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <UserCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">House Finder</p>
                  <p className="text-xs text-[var(--text-secondary)]">I'm looking for my next dream home</p>
                </div>
              </button>

              {isLoggingIn && (
                <div className="flex justify-center pt-4">
                  <Loader2 className="animate-spin text-brand" size={24} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
