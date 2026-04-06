import { PrivacySettings } from '../types';

export const isDNDActive = (privacy?: PrivacySettings) => {
  if (!privacy?.doNotDisturb?.enabled) return false;
  
  const dnd = privacy.doNotDisturb;
  
  // If manual mode, it's always active if enabled
  if (dnd.mode === 'MANUAL') return true;
  
  // If scheduled mode, check date and time
  const now = new Date();
  
  // Check date range if provided
  if (dnd.startDate && dnd.endDate) {
    const today = now.toISOString().split('T')[0];
    if (today < dnd.startDate || today > dnd.endDate) {
      return false;
    }
  }
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startH, startM] = (dnd.startTime || "00:00").split(':').map(Number);
  const [endH, endM] = (dnd.endTime || "23:59").split(':').map(Number);
  
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;
  
  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Overnights (e.g. 22:00 to 06:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
};
