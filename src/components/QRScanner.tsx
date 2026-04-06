import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Image as ImageIcon, Zap, ZapOff, RefreshCw } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanFailure }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrCodeInstance = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTransitioning = useRef(false);

  const startScanner = async () => {
    if (isTransitioning.current) return;
    
    try {
      isTransitioning.current = true;
      setIsLoading(true);
      setError(null);

      // Check for mediaDevices support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("BROWSER_NOT_SUPPORTED");
      }

      // Ensure the element exists in DOM
      const element = document.getElementById("qr-reader");
      if (!element) {
        console.error("QR reader element not found");
        isTransitioning.current = false;
        // Retry once after a short delay
        setTimeout(startScanner, 200);
        return;
      }

      // If already scanning, don't restart
      if (qrCodeInstance.current?.isScanning) {
        isTransitioning.current = false;
        setIsLoading(false);
        setIsScanning(true);
        return;
      }

      // If we have an instance but it's not scanning, it might be in a weird state.
      // Let's try to clear it if possible, or just create a new one.
      if (qrCodeInstance.current) {
        try {
          // Attempt to clear any existing state
          await qrCodeInstance.current.clear();
        } catch (e) {
          console.warn("Failed to clear existing QR instance", e);
        }
        qrCodeInstance.current = null;
      }

      qrCodeInstance.current = new Html5Qrcode("qr-reader");

      const config = {
        fps: 15, // Slightly higher FPS for smoother detection
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          if (minEdge <= 0) return { width: 250, height: 250 };
          // Ensure box is at least 200px and at most 80% of the screen
          const qrboxSize = Math.max(200, Math.floor(minEdge * 0.8));
          return { width: qrboxSize, height: qrboxSize };
        },
        // Remove fixed aspectRatio for better compatibility
      };

      const tryStart = async (cameraConfig: any) => {
        if (!qrCodeInstance.current) return;
        await qrCodeInstance.current.start(
          cameraConfig,
          config,
          (decodedText) => onScanSuccess(decodedText),
          () => {}
        );
      };

      try {
        // Attempt 1: Back camera via facingMode
        try {
          await tryStart({ facingMode: "environment" });
        } catch (e1: any) {
          const errStr = e1?.toString() || "";
          
          // If permission denied, don't bother trying other cameras
          if (errStr.includes("NotAllowedError") || errStr.includes("Permission denied")) {
            throw e1;
          }

          // Attempt 2: Get cameras and try the first one (more reliable on some devices than facingMode)
          let cameras: any[] = [];
          try {
            cameras = await Html5Qrcode.getCameras();
          } catch (camErr) {
            // Silently fail here, we have more fallbacks
          }

          if (cameras && cameras.length > 0) {
            // Try to find a back camera first
            const backCamera = cameras.find(c => 
              c.label.toLowerCase().includes('back') || 
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('camera 0')
            ) || cameras[0];
            
            try {
              await tryStart(backCamera.id);
            } catch (e3) {
              try {
                await tryStart({ facingMode: "user" });
              } catch (e4) {
                // Final attempt: generic video
                await tryStart(true as any); // Passing true often works as a generic constraint
              }
            }
          } else {
            // Attempt 3: facingMode user
            try {
              await tryStart({ facingMode: "user" });
            } catch (e5) {
              // Final attempt: generic video
              await tryStart(true as any);
            }
          }
        }
      } catch (finalErr: any) {
        console.error("All camera start attempts failed", finalErr);
        throw finalErr;
      }
      
      setIsScanning(true);
      setIsLoading(false);

      // Check if flashlight is supported
      try {
        if (qrCodeInstance.current && typeof qrCodeInstance.current.getRunningTrack === 'function') {
          const track = qrCodeInstance.current.getRunningTrack();
          if (track) {
            const capabilities = track.getCapabilities() as any;
            setHasFlash(!!capabilities.torch);
          }
        }
      } catch (e) {
        console.warn("Flashlight capabilities check failed", e);
      }
    } catch (err: any) {
      console.error("Failed to start scanner", err);
      setIsLoading(false);
      const errStr = err?.toString() || "";
      
      if (errStr.includes("BROWSER_NOT_SUPPORTED")) {
        setError("Your browser does not support camera access. Please use a modern browser like Chrome or Safari.");
      } else if (errStr.includes("NotAllowedError") || errStr.includes("Permission denied")) {
        setError("Camera permission denied. Please allow camera access in your browser settings and refresh.");
      } else if (errStr.includes("NotReadableError") || errStr.includes("Could not start video source")) {
        setError("Camera is already in use by another application or tab. Please close other apps and try again.");
      } else if (errStr.includes("NotFoundError") || errStr.includes("Requested device not found") || errStr.includes("No cameras found")) {
        setError("No camera detected on this device. You can still upload a photo of the QR code.");
      } else if (errStr.includes("already under transition")) {
        // Ignore this specific error
      } else {
        setError("Could not start camera. Please ensure your camera is connected and try refreshing.");
      }
    } finally {
      isTransitioning.current = false;
    }
  };

  const stopScanner = async () => {
    // During unmount, we want to stop regardless of isTransitioning if possible
    if (qrCodeInstance.current) {
      try {
        if (qrCodeInstance.current.isScanning) {
          await qrCodeInstance.current.stop();
        }
        await qrCodeInstance.current.clear();
        setIsScanning(false);
        setIsFlashOn(false);
      } catch (err) {
        console.error("Failed to stop/clear scanner", err);
      }
    }
  };

  const toggleFlash = async () => {
    if (isTransitioning.current) return;
    
    if (qrCodeInstance.current && hasFlash) {
      try {
        isTransitioning.current = true;
        const newFlashState = !isFlashOn;
        await qrCodeInstance.current.applyVideoConstraints({
          advanced: [{ torch: newFlashState }]
        } as any);
        setIsFlashOn(newFlashState);
      } catch (err) {
        console.error("Failed to toggle flash", err);
      } finally {
        isTransitioning.current = false;
      }
    }
  };

  const scanWithJsQR = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error("Could not get canvas context"));
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          
          if (code) {
            resolve(code.data);
          } else {
            reject(new Error("No QR code detected by jsQR"));
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setIsLoading(true);
      
      // If scanning, stop it first
      if (isScanning || qrCodeInstance.current?.isScanning) {
        await stopScanner();
      }

      // Re-initialize instance for file scanning to ensure clean state
      if (qrCodeInstance.current) {
        try {
          await qrCodeInstance.current.clear();
        } catch (e) {
          // Ignore clear errors
        }
        qrCodeInstance.current = null;
      }
      
      qrCodeInstance.current = new Html5Qrcode("qr-reader");

      // Small delay to show loading state and let DOM settle
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        // Attempt 1: html5-qrcode's built-in scanner
        const decodedText = await qrCodeInstance.current.scanFile(file, true);
        onScanSuccess(decodedText);
        setIsLoading(false);
      } catch (html5Err) {
        console.warn("Html5Qrcode scanFile failed, trying jsQR fallback", html5Err);
        
        // Attempt 2: jsQR fallback (often more robust for static images)
        try {
          const decodedText = await scanWithJsQR(file);
          onScanSuccess(decodedText);
          setIsLoading(false);
        } catch (jsqrErr) {
          console.error("jsQR fallback also failed", jsqrErr);
          throw new Error("No MultiFormat Readers"); // Standardize error for UI
        }
      }
    } catch (err: any) {
      console.error("Failed to scan file", err);
      setIsLoading(false);
      const errStr = err?.toString() || "";
      let userMsg = "Could not find a valid QR code in this image.";
      
      if (errStr.includes("No MultiFormat Readers")) {
        userMsg = "No QR code detected. Please ensure the QR code is clear, well-lit, and not blurry. Try cropping the image to just the QR code.";
      }
      
      if (onScanFailure) onScanFailure(userMsg);
      setError(userMsg);
    } finally {
      // Reset file input so same file can be selected again
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      startScanner();
    }, 500); // Give DOM a moment to settle

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black min-h-[300px] flex items-center justify-center">
      <div id="qr-reader" className="w-full aspect-square min-h-[250px]"></div>
      
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
          <RefreshCw size={40} className="animate-spin text-brand mb-4" />
          <p className="text-sm font-medium text-white/60">
            {isScanning ? "Scanning..." : (fileInputRef.current?.value ? "Scanning image..." : "Initializing camera...")}
          </p>
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex justify-between">
          <button 
            onClick={startScanner}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition-colors hover:bg-white/20"
            title="Restart Camera"
          >
            <RefreshCw size={20} className={isScanning ? "" : "animate-spin"} />
          </button>

          <div className="flex gap-2">
            {hasFlash && (
              <button 
                onClick={toggleFlash}
                className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-colors ${isFlashOn ? "bg-brand text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {isFlashOn ? <Zap size={20} /> : <ZapOff size={20} />}
              </button>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition-colors hover:bg-white/20"
            >
              <ImageIcon size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="space-y-3">
            <div className="rounded-xl bg-red-500/20 px-4 py-3 text-center text-xs text-red-400 backdrop-blur-md border border-red-500/20">
              {error}
            </div>
            <div className="rounded-xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Scanning Tips</p>
              <ul className="text-[10px] text-white/30 space-y-1 list-disc pl-3">
                <li>Ensure the QR code is centered and flat</li>
                <li>Avoid glares, reflections, or shadows</li>
                <li>Make sure the image is sharp and well-lit</li>
                <li>Try moving closer or further away</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <div className="h-1 w-12 rounded-full bg-white/20"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Align QR code within frame</p>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
