import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { QRCodeData } from '../types';
import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, QrCode, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const QRSetupPage: React.FC = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();
  const { user, isAuthReady, openAuth, updateUserRole } = useAuth();
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [step, setStep] = useState<'CONFIRM' | 'SUCCESS'>('CONFIRM');
  const [error, setError] = useState('');

  useEffect(() => {
    if (qrId && isAuthReady) {
      api.getQRData(qrId).then(data => {
        if (data) {
          if (data.status === 'LINKED') {
            navigate(`/owner-properties/${data.ownerId}`, { replace: true });
          } else {
            setQrData(data);
          }
        }
        setLoading(false);
      });
    }
  }, [qrId, navigate, isAuthReady]);

  const handleLink = async () => {
    if (!qrId || !user) {
      setError('You must be logged in as an owner to link a board.');
      return;
    }

    if (user.role !== 'OWNER') {
      setError('Only property owners can link boards. Would you like to switch to an owner account?');
      return;
    }

    setLinking(true);
    setError('');
    
    try {
      const success = await api.linkQRToOwner(qrId, user.id);
      if (success) {
        setStep('SUCCESS');
        setTimeout(() => navigate('/dashboard/qr'), 3000);
      } else {
        setError('Failed to link QR code. Please try again.');
      }
    } catch (err) {
      console.error('Linking Error:', err);
      setError('An error occurred while linking the board.');
    } finally {
      setLinking(false);
    }
  };

  if (loading || !isAuthReady) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6 text-brand"
        >
          <Loader2 size={48} />
        </motion.div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Loading Setup...</h2>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Invalid QR Code</h2>
        <p className="mt-2 text-[var(--text-secondary)]">This code was not recognized by our system.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-8 rounded-2xl bg-brand px-8 py-3 font-bold text-black transition-transform hover:scale-105"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <QrCode size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Link Your Board</h1>
          <p className="text-sm text-[var(--text-secondary)]">Activate your physical Smart Tolet Board</p>
        </div>

        {step === 'CONFIRM' && (
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-lg font-medium text-[var(--text-primary)]">
                Link Board <span className="font-mono text-brand">{qrId}</span> to your account?
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Once linked, this QR code will direct tenants to your active property listings.
              </p>
            </div>

            {error && (
              <div className="flex flex-col gap-3 rounded-xl bg-red-500/10 p-4 text-xs text-red-500">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
                {user && user.role === 'FINDER' && (
                  <button
                    onClick={() => {
                      updateUserRole('OWNER');
                      setError('');
                    }}
                    className="w-fit rounded-lg bg-red-500 px-3 py-1.5 font-bold text-white transition-transform hover:scale-105"
                  >
                    Switch to Owner Account
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={user ? handleLink : () => openAuth('USER')}
                disabled={linking}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {linking ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Linking...
                  </>
                ) : user ? (
                  'Confirm & Link'
                ) : (
                  'Login to Link Board'
                )}
              </button>
              
              {!user && (
                <p className="text-center text-xs text-[var(--text-secondary)]">
                  You need to be logged in as an owner to activate this board.
                </p>
              )}

              <button 
                onClick={() => navigate('/')}
                disabled={linking}
                className="w-full rounded-2xl border border-[var(--border)] py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand text-black"
            >
              <CheckCircle size={40} />
            </motion.div>
            <h2 className="mb-2 text-xl font-bold text-brand">Successfully Linked!</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Your Smart Tolet Board is now active. Redirecting to your listings...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
