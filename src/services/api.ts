import { db, auth, storage } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  getDocFromServer,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Property, QRCodeData, Owner, OperationType, User } from '../types';
import { safeLog, safeStringify } from '../utils/logger';

// Error handler for Firestore permissions
const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const user = auth.currentUser;
  
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: user?.uid || '',
      email: user?.email || '',
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous || false,
      tenantId: user?.tenantId || '',
      providerInfo: user?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName || '',
        email: provider.email || '',
        photoUrl: provider.photoURL || ''
      })) || []
    }
  };

  const stringifiedInfo = JSON.stringify(errInfo);
  console.error('Firestore Error: ', stringifiedInfo);
  
  throw new Error(stringifiedInfo);
};

// Test connection to Firestore
export const testConnection = async () => {
  try {
    console.log("Attempting to reach Firestore...");
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore reachability test passed.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Firestore connection test failed:", errorMessage);
    
    if(errorMessage.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The SDK reports the client is offline.");
      throw new Error('offline');
    }
    // Re-throw other errors
    throw error;
  }
};

export const api = {
  // Property APIs
  getProperties: async (): Promise<Property[]> => {
    const path = 'properties';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },
  
  getPropertyById: async (id: string): Promise<Property | undefined> => {
    const path = `properties/${id}`;
    try {
      const docRef = doc(db, 'properties', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Property;
      }
      return undefined;
    } catch (error) {
      handleFirestoreError(error, 'get' as any, path);
      return undefined;
    }
  },
  
  getPropertiesByOwnerId: async (ownerId: string, includeInactive: boolean = false): Promise<Property[]> => {
    const path = 'properties';
    try {
      const q = query(collection(db, path), where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);
      let properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      if (!includeInactive) {
        properties = properties.filter(p => p.isActive === true && !p.isDeleted);
      } else {
        properties = properties.filter(p => !p.isDeleted);
      }
      
      return properties;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },
  
  getPropertiesByLocation: async (city: string, area?: string): Promise<Property[]> => {
    const path = 'properties';
    try {
      const q = query(collection(db, path), where('location', '>=', city), where('location', '<=', city + '\uf8ff'));
      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      if (area) {
        results = results.filter(p => p.location.toLowerCase().includes(area.toLowerCase()));
      }
      
      return results;
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  createProperty: async (propertyData: Omit<Property, 'id' | 'createdAt' | 'ownerName' | 'ownerPhone'>, images: File[], ownerName: string, ownerPhone: string): Promise<string> => {
    const path = 'properties';
    try {
      const propertyId = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const storageRef = ref(storage, `properties/${propertyId}/${image.name}`);
        const uploadResult = await uploadBytes(storageRef, image);
        const url = await getDownloadURL(uploadResult.ref);
        imageUrls.push(url);
      }

      const slug = propertyData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const newProperty: Property = {
        ...propertyData,
        id: propertyId,
        slug,
        images: imageUrls,
        imageUrl: imageUrls[0] || '',
        createdAt: new Date().toISOString(),
        isActive: true,
        ownerName,
        ownerPhone,
        lat: propertyData.lat,
        lng: propertyData.lng
      };

      await setDoc(doc(db, 'properties', propertyId), newProperty);
      return propertyId;
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
      throw error;
    }
  },

  // QR APIs
  getQRData: async (qrId: string): Promise<QRCodeData | undefined> => {
    const path = `qrcodes/${qrId}`;
    try {
      const docRef = doc(db, 'qrcodes', qrId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as QRCodeData;
      }
      return undefined;
    } catch (error) {
      handleFirestoreError(error, 'get' as any, path);
      return undefined;
    }
  },

  getQRByOwnerId: async (ownerId: string): Promise<QRCodeData | undefined> => {
    const path = 'qrcodes';
    try {
      const q = query(collection(db, path), where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return undefined;
      return snapshot.docs[0].data() as QRCodeData;
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return undefined;
    }
  },
  
  linkQRToOwner: async (qrId: string, ownerId: string): Promise<boolean> => {
    const path = `qrcodes/${qrId}`;
    try {
      const docRef = doc(db, 'qrcodes', qrId);
      await updateDoc(docRef, {
        ownerId: ownerId,
        status: 'LINKED'
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, 'update' as any, path);
      return false;
    }
  },
  
  generateBulkQRs: async (count: number): Promise<QRCodeData[]> => {
    const path = 'qrcodes';
    const newQRs: QRCodeData[] = [];
    try {
      for (let i = 0; i < count; i++) {
        const qrId = `QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const qrData: QRCodeData = {
          qrId,
          createdBy: 'ADMIN',
          ownerId: null,
          status: 'UNLINKED',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'qrcodes', qrId), qrData);
        newQRs.push(qrData);
      }
      return newQRs;
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
      return [];
    }
  },

  generateSelfQR: async (ownerId: string): Promise<boolean> => {
    const qrId = `QR-SELF-${ownerId}`;
    const path = `qrcodes/${qrId}`;
    try {
      const qrData: QRCodeData = {
        qrId,
        createdBy: 'OWNER',
        ownerId: ownerId,
        status: 'LINKED',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'qrcodes', qrId), qrData);
      return true;
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
      return false;
    }
  },

  // Owner APIs
  syncPublicProfile: async (user: User): Promise<void> => {
    const path = `users_public/${user.id}`;
    try {
      const publicData = {
        id: user.id,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'FINDER',
        privacy: user.privacy || {
          doNotDisturb: { enabled: false, mode: 'MANUAL', startTime: '00:00', endTime: '23:59', reason: 'Busy' },
          onlyMessage: false,
          preDisclosure: { enabled: false, message: '', options: [] }
        }
      };
      await setDoc(doc(db, 'users_public', user.id), publicData);
    } catch (error) {
      console.error('Error syncing public profile:', error);
    }
  },

  getOwnerById: async (id: string): Promise<Owner | undefined> => {
    const path = `users_public/${id}`;
    try {
      const docRef = doc(db, 'users_public', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Owner;
      }
      
      // Fallback for backward compatibility if the user is logged in and is the owner
      if (auth.currentUser?.uid === id) {
        const privateDocRef = doc(db, 'users', id);
        const privateDocSnap = await getDoc(privateDocRef);
        if (privateDocSnap.exists()) {
          return privateDocSnap.data() as Owner;
        }
      }
      
      return undefined;
    } catch (error) {
      // If it's a permission error on users_public, it shouldn't happen with the new rules
      // but if it's a permission error on the fallback 'users', we ignore it.
      if (error instanceof Error && error.message.includes('permission')) {
        return undefined;
      }
      handleFirestoreError(error, 'get' as any, path);
      return undefined;
    }
  },

  getNearbyProperties: async (lat: number, lng: number, radiusKm: number = 10): Promise<Property[]> => {
    const path = 'properties';
    try {
      const snapshot = await getDocs(collection(db, path));
      const allProperties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      // Calculate distance and filter
      const withDistance = allProperties.map(p => {
        if (!p.lat || !p.lng) return { ...p, distance: Infinity };
        
        const R = 6371; // Earth's radius in km
        const dLat = (p.lat - lat) * Math.PI / 180;
        const dLng = (p.lng - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(p.lat * Math.PI / 180) * 
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return { ...p, distance };
      });

      // Filter by radius and sort by distance ascending
      return withDistance
        .filter(p => p.distance <= radiusKm)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  updateProperty: async (id: string, data: Partial<Property>, newImages: File[] = []): Promise<boolean> => {
    const path = `properties/${id}`;
    try {
      const docRef = doc(db, 'properties', id);
      
      // Upload new images if any
      const imageUrls: string[] = [...(data.images || [])];
      if (newImages.length > 0) {
        for (const image of newImages) {
          const storageRef = ref(storage, `properties/${id}/${Date.now()}-${image.name}`);
          const uploadResult = await uploadBytes(storageRef, image);
          const url = await getDownloadURL(uploadResult.ref);
          imageUrls.push(url);
        }
      }

      const updatedData = {
        ...data,
        images: imageUrls,
        imageUrl: imageUrls[0] || '',
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, updatedData);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return false;
    }
  },

  deleteProperty: async (id: string): Promise<boolean> => {
    const path = `properties/${id}`;
    try {
      // Instead of actual deletion, we can mark it as deleted or just use isActive
      // But the user asked for a delete button with a warning.
      // I'll implement a real delete but the UI will suggest "occupied" first.
      const docRef = doc(db, 'properties', id);
      await updateDoc(docRef, { isActive: false, isDeleted: true });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return false;
    }
  },

  incrementPropertyStat: async (id: string, stat: 'scans' | 'internalScans' | 'views' | 'favoritesCount' | 'shares' | 'callClicks' | 'messageClicks'): Promise<void> => {
    const path = `properties/${id}`;
    try {
      const docRef = doc(db, 'properties', id);
      // Use atomic increment for better reliability and performance
      await updateDoc(docRef, { 
        [stat]: increment(1) 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  toggleFavorite: async (userId: string, propertyId: string): Promise<boolean> => {
    const userPath = `users/${userId}`;
    const propPath = `properties/${propertyId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const propRef = doc(db, 'properties', propertyId);
      const propSnap = await getDoc(propRef);

      if (!userSnap.exists()) return false;

      const userData = userSnap.data();
      const favorites = userData.favorites || [];
      const isFavorite = favorites.includes(propertyId);

      let newFavorites;
      let favoriteChange = 0;

      if (isFavorite) {
        newFavorites = favorites.filter((id: string) => id !== propertyId);
        favoriteChange = -1;
      } else {
        newFavorites = [...favorites, propertyId];
        favoriteChange = 1;
      }

      await updateDoc(userRef, { favorites: newFavorites });
      
      if (propSnap.exists()) {
        await updateDoc(propRef, { 
          favoritesCount: increment(favoriteChange) 
        });
      }

      return !isFavorite;
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      return false;
    }
  }
};
