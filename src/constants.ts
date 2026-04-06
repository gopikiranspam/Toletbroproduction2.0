import { Property, Owner, QRCodeData } from './types';

export const OWNERS: Owner[] = [
  { id: 'owner123', name: 'John Doe', phone: '9876543210', email: 'john@example.com', qrId: 'QR1001', role: 'OWNER' },
  { id: 'owner456', name: 'Jane Smith', phone: '9876543211', email: 'jane@example.com', role: 'OWNER' },
];

export const PROPERTIES: Property[] = [];

export const QR_CODES: QRCodeData[] = [
  {
    qrId: 'QR1001',
    createdBy: 'ADMIN',
    ownerId: 'owner123',
    status: 'LINKED',
    createdAt: '2026-03-01T10:00:00Z',
    publicUrl: `${window.location.origin}/scan/QR1001`,
  },
  {
    qrId: 'QR1002',
    createdBy: 'ADMIN',
    ownerId: null,
    status: 'UNLINKED',
    createdAt: '2026-03-10T12:00:00Z',
    publicUrl: `${window.location.origin}/scan/QR1002`,
  },
];
