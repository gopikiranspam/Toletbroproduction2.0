import React, { useState } from 'react';
import { api } from '../services/api';
import { QRCodeData } from '../types';
import { QRGenerator } from '../components/QRGenerator';
import { motion } from 'motion/react';
import { Plus, Download, LayoutGrid, List, Loader2, Info, FileArchive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const AdminQRPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthReady, openAuth } = useAuth();
  const [count, setCount] = useState(5);
  const [generatedQRs, setGeneratedQRs] = useState<QRCodeData[]>([]);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [generating, setGenerating] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'gopikiranspam@gmail.com';

  const handleGenerate = async () => {
    if (!isAdmin) return;
    setGenerating(true);
    try {
      const newQRs = await api.generateBulkQRs(count);
      setGeneratedQRs([...newQRs, ...generatedQRs]);
    } finally {
      setGenerating(false);
    }
  };

  const getPublicUrl = (qrId: string) => `${window.location.origin}/scan/${qrId}`;

  const downloadQR = (qrId: string) => {
    const container = document.getElementById(`qr-container-${qrId}`);
    const svg = container?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = svg.clientWidth * 2 || 400;
      canvas.height = svg.clientHeight * 2 || 400;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `ToLetBro-QR-${qrId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };
  
  const downloadAllAsZip = async () => {
    if (generatedQRs.length === 0) return;
    setIsDownloadingZip(true);
    const zip = new JSZip();
    
    try {
      const promises = generatedQRs.map(async (qr) => {
        return new Promise<void>((resolve) => {
          const container = document.getElementById(`qr-container-${qr.qrId}`);
          const svg = container?.querySelector('svg');
          if (!svg) {
            resolve();
            return;
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          const svgData = new XMLSerializer().serializeToString(svg);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          img.onload = () => {
            canvas.width = 1000; // High resolution for ZIP
            canvas.height = 1000;
            if (ctx) {
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // Convert canvas to blob
              canvas.toBlob((blob) => {
                if (blob) {
                  zip.file(`${qr.qrId}.png`, blob);
                }
                URL.revokeObjectURL(url);
                resolve();
              }, 'image/png');
            } else {
              URL.revokeObjectURL(url);
              resolve();
            }
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          img.src = url;
        });
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `ToLetBro_QRCodes_${new Date().getTime()}.zip`);
    } catch (error) {
      console.error('Error generating ZIP:', error);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <Loader2 size={48} className="animate-spin text-brand mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Loading Admin Panel...</h2>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Access Restricted</h2>
        <p className="mt-2 text-[var(--text-secondary)]">This panel is only available for Administrators.</p>
        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => navigate('/')}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-8 py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-105"
          >
            Go to Home
          </button>
          <button 
            onClick={() => openAuth('ADMIN')}
            className="rounded-2xl bg-brand px-8 py-4 font-bold text-black transition-transform hover:scale-105"
          >
            Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-[var(--text-primary)]">Admin QR Generator</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Bulk generate Smart Tolet Board QR codes for distribution.</p>
        </div>
        
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-2">
          <input 
            type="number" 
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 0)}
            className="w-20 bg-transparent px-4 py-2 text-center font-bold outline-none text-[var(--text-primary)]"
            min="1"
            max="100"
          />
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2 font-bold text-black transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {generating ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            <span>{generating ? 'Generating...' : 'Generate'}</span>
          </button>
        </div>
      </div>

      {generatedQRs.length > 0 && (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-[var(--text-secondary)]">Recently Generated ({generatedQRs.length})</p>
            <button 
              onClick={downloadAllAsZip}
              disabled={isDownloadingZip}
              className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-bold text-brand transition-all hover:bg-brand hover:text-black disabled:opacity-50"
            >
              {isDownloadingZip ? <Loader2 size={16} className="animate-spin" /> : <FileArchive size={16} />}
              <span>{isDownloadingZip ? 'Preparing ZIP...' : 'Download All as ZIP'}</span>
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('GRID')}
              className={`rounded-lg p-2 transition-colors ${viewMode === 'GRID' ? 'bg-brand text-black' : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border)]'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`rounded-lg p-2 transition-colors ${viewMode === 'LIST' ? 'bg-brand text-black' : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border)]'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      )}

      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {generatedQRs.map((qr) => (
            <motion.div 
              key={qr.qrId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative"
              id={`qr-container-${qr.qrId}`}
            >
              <QRGenerator value={getPublicUrl(qr.qrId)} label={`ID: ${qr.qrId}`} />
              <button 
                onClick={() => downloadQR(qr.qrId)}
                className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:text-brand"
              >
                <Download size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {generatedQRs.map((qr) => (
            <div key={qr.qrId} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <div className="flex items-center gap-6">
                <div id={`qr-container-${qr.qrId}`} className="rounded-lg bg-white p-2">
                  <QRGenerator value={getPublicUrl(qr.qrId)} size={60} />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{qr.qrId}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{getPublicUrl(qr.qrId)}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand uppercase">{qr.status}</span>
                <button 
                  onClick={() => downloadQR(qr.qrId)}
                  className="text-[var(--text-secondary)] transition-colors hover:text-brand"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {generatedQRs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border)]">
            <LayoutGrid size={40} />
          </div>
          <p className="text-xl text-[var(--text-secondary)]">No QR codes generated yet.</p>
        </div>
      )}
    </div>
  );
};
