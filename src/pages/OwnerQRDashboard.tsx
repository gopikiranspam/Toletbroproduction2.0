import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { QRCodeData } from '../types';
import { QRGenerator } from '../components/QRGenerator';
import { motion } from 'motion/react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { 
  QrCode, 
  Camera, 
  Plus, 
  CheckCircle, 
  ExternalLink, 
  Info, 
  Smartphone,
  ChevronRight,
  Loader2,
  Download,
  Building2,
  Printer,
  Layout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const OwnerQRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  
  // Board configuration state
  const [bhk, setBhk] = useState('');
  const [floor, setFloor] = useState('');
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `ToLetBro-Board-${qrData?.qrId || 'code'}`,
  });

  const downloadBoardImage = async () => {
    if (!componentRef.current) return;
    
    try {
      // Temporarily show the hidden board to capture it
      const board = componentRef.current;
      board.parentElement?.classList.remove('hidden');
      
      const dataUrl = await toPng(board, {
        quality: 1,
        pixelRatio: 2,
        width: 1122, // A4 landscape at 96dpi
        height: 794,
      });
      
      board.parentElement?.classList.add('hidden');

      const link = document.createElement('a');
      link.download = `ToLetBro-Board-${qrData?.qrId || 'code'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download board image:', err);
    }
  };

  useEffect(() => {
    const fetchQR = async () => {
      if (!user || !isAuthReady) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await api.getQRByOwnerId(user.id);
        setQrData(data || null);
      } catch (err) {
        console.error("Failed to fetch QR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [user, isAuthReady]);

  const handleGenerateSelf = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const success = await api.generateSelfQR(user.id);
      if (success) {
        const data = await api.getQRByOwnerId(user.id);
        setQrData(data || null);
      }
    } catch (err) {
      console.error("Failed to generate QR:", err);
    } finally {
      setGenerating(false);
    }
  };

  const getPublicUrl = (qrId: string) => `${window.location.origin}/scan/${qrId}`;

  const downloadQR = () => {
    const svg = document.querySelector('#qr-code-container svg') as SVGElement;
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = svg.clientWidth * 2;
      canvas.height = svg.clientHeight * 2;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `ToLetBro-QR-${qrData?.qrId || 'code'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (loading || !isAuthReady) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <Loader2 size={48} className="animate-spin text-brand mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Loading Dashboard...</h2>
      </div>
    );
  }
  
  if (!user || user.role !== 'OWNER') {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Access Restricted</h2>
        <p className="mt-2 text-[var(--text-secondary)]">This dashboard is only available for Property Owners.</p>
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
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-[var(--text-primary)]">Smart Tolet Board</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Manage your property's digital identity and physical board connectivity.</p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          {qrData ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.5rem] border border-brand/20 bg-brand/5 p-12 text-center"
            >
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-brand text-black">
                <QrCode size={40} />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)]">Your Active QR Code</h2>
              <p className="mb-12 text-[var(--text-secondary)]">This QR code is permanently linked to your profile and listings.</p>
              
              <div id="qr-code-container" className="mx-auto max-w-[280px]">
                <QRGenerator value={getPublicUrl(qrData.qrId)} size={240} />
              </div>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <button 
                  onClick={() => setShowBoardModal(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 font-bold text-black transition-transform hover:scale-105"
                >
                  <Layout size={20} />
                  Generate Smart Board
                </button>
                <button 
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-8 py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-105"
                >
                  <Download size={20} />
                  Download QR
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/scan')}
                className="flex w-full items-center justify-between rounded-[2rem] border border-[var(--border)] bg-[var(--card-bg)] p-6 transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Camera size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-[var(--text-primary)]">Link Physical Board</p>
                    <p className="text-sm text-[var(--text-secondary)]">Scan your physical board to link it to your account.</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[var(--text-secondary)]/40" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={handleGenerateSelf}
                disabled={generating}
                className="flex w-full items-center justify-between rounded-[2rem] border border-[var(--border)] bg-[var(--card-bg)] p-6 transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    {generating ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-[var(--text-primary)]">Generate Digital QR</p>
                    <p className="text-sm text-[var(--text-secondary)]">Create a QR code for your own marketing materials.</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[var(--text-secondary)]/40" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/list-property')}
                className="flex w-full items-center justify-between rounded-[2rem] border border-[var(--border)] bg-[var(--card-bg)] p-6 transition-all hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Building2 size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-[var(--text-primary)]">List New Property</p>
                    <p className="text-sm text-[var(--text-secondary)]">Add a new property to your portfolio.</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[var(--text-secondary)]/40" />
              </motion.button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 md:p-10">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Info size={24} />
            </div>
            <h3 className="mb-6 text-xl font-bold text-[var(--text-primary)]">How it works</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-black">1</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Scan or generate a unique QR code that links permanently to your profile.</p>
              </li>
              <li className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-black">2</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Tenants scanning your QR will be directed to your listings page automatically.</p>
              </li>
              <li className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-black">3</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">If you have only one property, tenants go straight to that property's details.</p>
              </li>
              <li className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-black">4</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Once linked, the QR cannot be reassigned or deleted for security.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Smart Board Generation Modal */}
      {showBoardModal && qrData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-[var(--bg-primary)] p-8 shadow-2xl md:p-12"
          >
            <button 
              onClick={() => setShowBoardModal(false)}
              className="absolute right-8 top-8 rounded-full bg-[var(--bg-secondary)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Plus size={24} className="rotate-45" />
            </button>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">Generate Smart To-Let Board</h2>
              <p className="mt-2 text-[var(--text-secondary)]">Customize your board details before printing or downloading.</p>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">BHK (e.g., 2 BHK)</label>
                    <input 
                      type="text" 
                      value={bhk}
                      onChange={(e) => setBhk(e.target.value)}
                      placeholder="Enter BHK"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Floor (e.g., 2nd Floor)</label>
                    <input 
                      type="text" 
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="Enter Floor"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button 
                    onClick={() => handlePrint()}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 font-bold text-black transition-transform hover:scale-105"
                  >
                    <Printer size={20} />
                    Print / Save PDF
                  </button>
                  <button 
                    onClick={downloadBoardImage}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-8 py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-105"
                  >
                    <Download size={20} />
                    Download Image
                  </button>
                </div>

                <div className="rounded-2xl bg-brand/5 p-6 border border-brand/10">
                  <h4 className="mb-3 flex items-center gap-2 font-bold text-[var(--text-primary)]">
                    <Info size={18} className="text-brand" />
                    Printing Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <li>• Use A4 size paper for best results.</li>
                    <li>• Set orientation to "Landscape" in print settings.</li>
                    <li>• Enable "Background Graphics" if colors don't appear.</li>
                    <li>• Use "Save as PDF" to keep a digital copy.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Live Preview</h4>
                <div className="relative aspect-[297/210] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-inner">
                  <div className="absolute inset-0 origin-top-left scale-[0.35] sm:scale-[0.45] md:scale-[0.55] lg:scale-[0.4] xl:scale-[0.5]">
                    <BoardPreview bhk={bhk} floor={floor} qrUrl={getPublicUrl(qrData.qrId)} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hidden Printable Board */}
      <div className="hidden">
        <div ref={componentRef} className="print-board-container">
          {qrData && <BoardPreview bhk={bhk} floor={floor} qrUrl={getPublicUrl(qrData.qrId)} isPrint />}
        </div>
      </div>
    </div>
  );
};

const BoardPreview: React.FC<{ bhk: string; floor: string; qrUrl: string; isPrint?: boolean }> = ({ bhk, floor, qrUrl, isPrint }) => {
  return (
    <div className="flex flex-col h-full w-full bg-white text-black font-sans overflow-hidden border border-gray-100 shadow-2xl">
      {/* Top Red Section */}
      <div className="flex h-[30%] w-full bg-[#E31E24] text-white px-16 py-8 items-center justify-between relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-[14rem] font-black leading-none tracking-tighter italic drop-shadow-2xl">TO-LET</h1>
        </div>
        
        <div className="flex flex-col gap-6 pr-8 relative z-10">
          <div className="flex items-center gap-8">
            <div className="w-40 h-28 bg-white rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform -rotate-2">
               <span className="text-black text-6xl font-black">{bhk || "—"}</span>
            </div>
            <span className="text-7xl font-black italic tracking-tight">BHK</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="w-40 h-28 bg-white rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform rotate-2">
               <span className="text-black text-6xl font-black">{floor || "—"}</span>
            </div>
            <span className="text-7xl font-black italic tracking-tighter">FLOOR</span>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-20 py-10">
        <div className="text-center mb-12">
           <p className="text-5xl font-black tracking-tight text-gray-900 mb-2">Scan, See Inside & Contact Owner</p>
           <div className="h-1.5 w-48 bg-[#00A651] mx-auto rounded-full"></div>
           <p className="text-2xl font-bold mt-4 text-gray-600 uppercase tracking-widest">Scan once see all other tolets near you</p>
        </div>

        <div className="flex w-full items-center justify-between gap-12">
           {/* Left Text */}
           <div className="w-[30%] text-center space-y-6">
              <div className="space-y-2">
                <p className="text-2xl font-medium text-gray-500 uppercase tracking-tighter">Option 1</p>
                <p className="text-3xl font-black leading-tight text-gray-900">Use your mobile Camera or Google Lens</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-[2px] flex-1 bg-gray-200"></div>
                <span className="text-xl font-bold text-gray-400 italic">OR</span>
                <div className="h-[2px] flex-1 bg-gray-200"></div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-medium text-gray-500 uppercase tracking-tighter">Option 2</p>
                <p className="text-3xl font-black leading-tight text-gray-900">Simply visit<br/><span className="text-[#E31E24]">www.ToletBro.com</span></p>
              </div>
           </div>

           {/* QR Code with Modern Frame */}
           <div className="relative p-16 bg-gray-50 rounded-[3rem] shadow-inner">
              {/* Modern Scanner Corners */}
              <div className="absolute top-4 left-4 w-24 h-24 border-t-[16px] border-l-[16px] border-[#00A651] rounded-tl-3xl"></div>
              <div className="absolute top-4 right-4 w-24 h-24 border-t-[16px] border-r-[16px] border-[#00A651] rounded-tr-3xl"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 border-b-[16px] border-l-[16px] border-[#00A651] rounded-bl-3xl"></div>
              <div className="absolute bottom-4 right-4 w-24 h-24 border-b-[16px] border-r-[16px] border-[#00A651] rounded-br-3xl"></div>
              
              <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <QRCodeSVG value={qrUrl} size={isPrint ? 300 : 220} level="H" includeMargin={false} />
              </div>
           </div>

           {/* Right Text (Telugu) */}
           <div className="w-[30%] text-center">
              <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-4xl font-bold leading-[1.6] text-gray-900">
                  స్కాన్ చేయండి, లోపల ఎలా ఉందో చూడండి,<br />
                  <span className="text-[#00A651]">మీకు నచ్చితేనే ఓనర్ కి కాల్ చేయండి</span>
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="w-full flex flex-col items-center mt-auto pb-8">
        <div className="w-[92%] h-1 bg-gray-100 mb-6"></div>
        <div className="flex items-center gap-6 mb-6">
          <div className="h-12 w-1 bg-[#E31E24]"></div>
          <h2 className="text-[6rem] font-black tracking-tighter text-black uppercase leading-none">SMART TOLET BOARDS</h2>
          <div className="h-12 w-1 bg-[#00A651]"></div>
        </div>
        
        <div className="w-full bg-[#00A651] py-6 text-center shadow-lg relative overflow-hidden">
           <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,white_25%,white_50%,transparent_50%,transparent_75%,white_75%,white_100%)] bg-[length:20px_20px]"></div>
           <p className="text-white text-5xl font-black tracking-widest relative z-10">POWERED BY TOLETBRO.COM</p>
        </div>
        
        <div className="pt-8 px-16 w-full flex justify-between items-center text-gray-500">
          <p className="text-2xl font-bold">
            Order your board at <span className="text-black">www.toletbro.com</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="h-8 w-[2px] bg-gray-300"></span>
            <p className="text-2xl font-bold">
              Support: <span className="text-black">8500482405</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
