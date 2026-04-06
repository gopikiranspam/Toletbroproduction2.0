import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRGeneratorProps {
  value: string;
  size?: number;
  label?: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ value, size = 200, label }) => {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 backdrop-blur-xl transition-colors duration-300">
      <div className="rounded-xl bg-white p-4">
        <QRCodeSVG value={value} size={size} level="H" includeMargin={true} />
      </div>
      {label && <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>}
      <p className="text-xs text-brand truncate max-w-[200px]">{value}</p>
    </div>
  );
};
