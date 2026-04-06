import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { User, UserRole } from '../types';
import { safeLog } from '../utils/logger';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthReady: boolean;
  loginWithGoogle: () => Promise<void>;
  setupRecaptcha: (container: HTMLElement | string) => void;
  clearRecaptcha: () => void;
  sendOtp: (phoneNumber: string) => Promise<ConfirmationResult>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  completeProfile: (name: string, role: UserRole) => Promise<void>;
  checkUserExists: (uid: string) => Promise<boolean>;
  toggleFavorite: (propertyId: string) => Promise<boolean>;
  authModal: { isOpen: boolean; mode: 'USER' | 'ADMIN' };
  openAuth: (mode?: 'USER' | 'ADMIN') => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'USER' | 'ADMIN' }>({
    isOpen: false,
    mode: 'USER'
  });
  const isRecaptchaInitialized = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser);
      let userUnsubscribe: (() => void) | null = null;

      if (fUser) {
        // Use onSnapshot for real-time profile updates
        userUnsubscribe = onSnapshot(
          doc(db, 'users', fUser.uid),
          (userDoc) => {
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              setUser(userData);
              // Sync to public profile
              api.syncPublicProfile(userData);
            } else {
              setUser(null);
            }
            setLoading(false);
            setIsAuthReady(true);
          },
          (error) => {
            safeLog.error('Error listening to user profile:', error);
            setLoading(false);
            setIsAuthReady(true);
          }
        );
      } else {
        setUser(null);
        setLoading(false);
        setIsAuthReady(true);
      }

      return () => {
        if (userUnsubscribe) userUnsubscribe();
      };
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Initialize recaptcha once on mount
    const timer = setTimeout(() => {
      setupRecaptcha('recaptcha-container');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      safeLog.error('Login failed:', error);
      throw error;
    }
  };

  const setupRecaptcha = (containerOrId: HTMLElement | string) => {
    if (!containerOrId) {
      safeLog.error('Recaptcha container or ID is missing');
      return;
    }

    // If already initialized, don't do it again unless it's a different container
    if (isRecaptchaInitialized.current && recaptchaVerifier) {
      safeLog.log('Recaptcha already initialized, skipping setup');
      return;
    }

    safeLog.log('DEEP DIVE: Initializing RecaptchaVerifier with:', typeof containerOrId === 'string' ? containerOrId : 'HTMLElement');
    safeLog.log('Auth Domain:', auth.config.authDomain);
    safeLog.log('API Key:', auth.config.apiKey ? 'Present' : 'MISSING');

    try {
      // If it's an ID string, verify the element exists
      if (typeof containerOrId === 'string') {
        const el = document.getElementById(containerOrId);
        if (!el) {
          safeLog.error(`Element with ID "${containerOrId}" not found in DOM`);
          return;
        }
        el.innerHTML = ''; // Clear it
      } else {
        containerOrId.innerHTML = ''; // Clear it
      }

      // Clean up existing verifier if it exists
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          safeLog.warn('Error clearing previous recaptcha:', e);
        }
      }

      // Initialize new verifier
      // Using 'invisible' size for better UX and reliability.
      const verifier = new RecaptchaVerifier(auth, containerOrId, {
        size: 'invisible',
        callback: (response: any) => {
          safeLog.log('Recaptcha resolved successfully');
        },
        'expired-callback': () => {
          safeLog.log('Recaptcha expired, resetting...');
          verifier.render().then(widgetId => {
            if ((window as any).grecaptcha) {
              (window as any).grecaptcha.reset(widgetId);
            }
          });
        }
      });

      // Pre-render the verifier to ensure it's ready
      safeLog.log('Attempting to render Recaptcha...');
      verifier.render().then((widgetId) => {
        safeLog.log('Recaptcha rendered successfully with widgetId:', widgetId);
        isRecaptchaInitialized.current = true;
      }).catch((err) => {
        safeLog.error('Recaptcha render failed with error:', err);
        isRecaptchaInitialized.current = false;
        
        // Detailed deep-dive logging for internal-error
        if (err.code === 'auth/internal-error' || err.message?.includes('internal-error')) {
          safeLog.error('DEEP DIVE: auth/internal-error detected during render.');
          safeLog.error('This is a CRITICAL configuration error. Please check:');
          safeLog.error('1. Identity Toolkit API: https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com');
          safeLog.error('2. API Key Restrictions: https://console.cloud.google.com/apis/credentials');
          safeLog.error('3. Authorized Domains: https://console.firebase.google.com/project/_/authentication/settings');
          safeLog.error('4. Current Domain: ' + window.location.hostname);
        }
      });

      setRecaptchaVerifier(verifier);
    } catch (error: any) {
      safeLog.error('Error setting up recaptcha:', error);
      isRecaptchaInitialized.current = false;
    }
  };

  const clearRecaptcha = () => {
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        // Ignore internal errors during clear
      }
      setRecaptchaVerifier(null);
      isRecaptchaInitialized.current = false;
      safeLog.log('Recaptcha cleared successfully');
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    if (!recaptchaVerifier) {
      safeLog.error('Recaptcha not initialized when calling sendOtp');
      throw new Error('Recaptcha not initialized. Please try again.');
    }
    try {
      // signInWithPhoneNumber handles rendering if not already rendered
      return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    } catch (error: any) {
      safeLog.error('Send OTP failed:', error);
      
      // Handle timeout specifically
      if (error.message?.includes('timeout') || error.code === 'auth/captcha-check-failed') {
        safeLog.log('Recaptcha timeout or failure, resetting...');
        try {
          // Reset the verifier if possible
          const widgetId = await recaptchaVerifier.render();
          (window as any).grecaptcha?.reset(widgetId);
        } catch (e) {
          safeLog.warn('Failed to reset recaptcha:', e);
        }
        throw new Error('Verification timed out. Please try again.');
      }

      if (error.code === 'auth/internal-error') {
        throw new Error('Firebase internal error. Please ensure your domain is added to Authorized Domains in Firebase Console.');
      }
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number. Please include country code (e.g., +91).');
      }
      throw error;
    }
  };

  const checkUserExists = async (uid: string): Promise<boolean> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists();
    } catch (error) {
      safeLog.error('Error checking user existence:', error);
      return false;
    }
  };

  const completeProfile = async (name: string, role: UserRole) => {
    if (!firebaseUser) return;
    try {
      const newUser: User = {
        id: firebaseUser.uid,
        name,
        phone: firebaseUser.phoneNumber || '',
        email: firebaseUser.email || '',
        role,
        favorites: []
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      await api.syncPublicProfile(newUser);
      setUser(newUser);
    } catch (error) {
      safeLog.error('Complete profile failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      safeLog.error('Logout failed:', error);
    }
  };

  const updateUserRole = async (role: UserRole) => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), { role });
      if (user) {
        const updatedUser = { ...user, role };
        await api.syncPublicProfile(updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      safeLog.error('Update role failed:', error);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return false;
    
    try {
      const newStatus = await api.toggleFavorite(user.id, propertyId);
      
      // Update local state
      setUser(prev => {
        if (!prev) return prev;
        const favorites = prev.favorites || [];
        const newFavorites = newStatus 
          ? [...favorites, propertyId]
          : favorites.filter(id => id !== propertyId);
        
        return {
          ...prev,
          favorites: newFavorites
        };
      });
      
      return newStatus;
    } catch (error) {
      safeLog.error("Failed to toggle favorite:", error);
      return false;
    }
  };

  const openAuth = (mode: 'USER' | 'ADMIN' = 'USER') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuth = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      isAuthReady, 
      loginWithGoogle, 
      setupRecaptcha,
      clearRecaptcha,
      sendOtp,
      logout,
      updateUserRole,
      completeProfile,
      checkUserExists,
      toggleFavorite,
      authModal,
      openAuth,
      closeAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
