import React, { useState } from 'react';
import { QRScanner } from '../components/QRScanner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Smartphone, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { useAuth } from '../context/AuthContext';

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleScanSuccess = async (decodedText: string) => {
    setError(null);
    
    // The QR code contains a URL like: https://toletbro.com/scan/QR-84729A
    // We want to extract the QR-84729A part
    
    try {
      const url = new URL(decodedText);
      const pathParts = url.pathname.split('/');
      
      // Check if it's our scan route
      if (pathParts.includes('scan')) {
        const qrId = pathParts[pathParts.indexOf('scan') + 1];
        if (qrId) {
          navigate(`/scan/${qrId}?internal=true`);
          return;
        }
      }
      
      // Fallback for raw IDs
      if (decodedText.startsWith('QR-')) {
        navigate(`/scan/${decodedText}?internal=true`);
        return;
      }

      setError("Invalid ToLetBro QR code.");
    } catch (e) {
      // If it's not a URL, check if it's a raw ID
      if (decodedText.startsWith('QR-')) {
        navigate(`/scan/${decodedText}?internal=true`);
        return;
      }
      setError("Could not recognize QR code format.");
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 size={48} className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <SEO 
        title="Scan Smart Tolet Board"
        description="Scan any TOLETBRO Smart Tolet Board to instantly view property details, photos, and contact the owner directly."
      />
      {/* Header */}
      <div className="flex items-center justify-between p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-black">
            <QrCode size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">Smart Scanner</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">ToLetBro Pro</p>
          </div>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition-colors hover:bg-white/20"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 relative flex items-center justify-center p-6">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md aspect-square relative z-10">
          <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-sm"></div>
          <div className="p-4 h-full">
            <QRScanner onScanSuccess={handleScanSuccess} onScanFailure={(err) => setError(err)} />
          </div>
          
          {/* Guided Squares Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-brand/30 rounded-3xl relative">
              <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-brand rounded-tl-3xl"></div>
              <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-brand rounded-tr-3xl"></div>
              <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-brand rounded-bl-3xl"></div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-brand rounded-br-3xl"></div>
              
              <motion.div 
                animate={{ top: ['5%', '95%', '5%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-4 right-4 h-1 bg-brand shadow-[0_0_20px_rgba(0,255,0,0.9)] z-10 rounded-full opacity-80"
              />

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-brand/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-12 text-center bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Smartphone size={16} className="text-brand" />
          <p className="text-white font-medium text-sm">Align QR code within the frame</p>
        </div>
        <p className="text-white/40 text-xs max-w-xs mx-auto leading-relaxed">
          Scanning will automatically detect property boards and owner profiles.
        </p>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 inline-block rounded-xl bg-red-500/20 px-6 py-3 border border-red-500/30 backdrop-blur-md"
            >
              <p className="text-red-400 text-sm font-bold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
