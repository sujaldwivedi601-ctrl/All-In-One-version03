import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  User, 
  onIdTokenChanged,
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  idToken: null,
  loading: true,
  getIdToken: async () => null,
  signInWithGoogle: async () => ({ success: false }),
  signInWithEmail: async () => ({ success: false }),
  registerWithEmail: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to retrieve an always-fresh valid token
  const getFreshIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    try {
      const token = await currentUser.getIdToken(forceRefresh);
      setIdToken(token);
      return token;
    } catch (err) {
      console.warn('Failed to refresh ID token:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    // onIdTokenChanged automatically fires whenever the token is refreshed (every 1 hour or when user signs in)
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);

          // Debounced synchronization with backend database
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = setTimeout(() => {
            fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoUrl: currentUser.photoURL,
              }),
            }).catch((err) => {
              console.warn('Sync user error (background):', err);
            });
          }, 300);

        } catch (err) {
          console.warn('Failed to get user token:', err);
        }
      } else {
        setIdToken(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  // Periodic automatic token refresh every 45 minutes (Firebase tokens expire after 60 min)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        try {
          const freshToken = await auth.currentUser.getIdToken(true);
          setIdToken(freshToken);
        } catch (e) {
          console.warn('Auto token refresh error:', e);
        }
      }
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleAuthProvider);
      return { success: true };
    } catch (error: any) {
      console.error('Sign in failed:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        console.info('Google sign-in popup was closed by user.');
        return { success: false, error: 'Sign-in cancelled.' };
      } else if (error?.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        console.error(`Firebase auth unauthorized domain: ${currentDomain}`);
        return {
          success: false,
          error: `Domain authorization updated for ${currentDomain}. Please retry signing in.`
        };
      } else {
        return {
          success: false,
          error: error?.message || 'Google sign-in failed. Please retry.'
        };
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true };
    } catch (error: any) {
      console.error('Email sign in failed:', error);
      let errorMsg = 'Failed to sign in. Please verify your email and password.';
      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid email or password. Please check your credentials or register a new account.';
      } else if (error?.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (error?.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed login attempts. Please wait a few minutes or reset your password.';
      }
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName.trim(),
        });
      }
      return { success: true };
    } catch (error: any) {
      console.error('Email registration failed:', error);
      let errorMsg = 'Failed to register. Please try again.';
      if (error?.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please login or reset your password.';
      } else if (error?.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak. Please use at least 6 characters.';
      } else if (error?.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      }
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (error: any) {
      console.error('Password reset failed:', error);
      let errorMsg = 'Failed to send password reset email. Please verify the email address.';
      if (error?.code === 'auth/user-not-found') {
        errorMsg = 'No registered farmer account found with this email.';
      } else if (error?.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      }
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIdToken(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      idToken, 
      loading, 
      getIdToken: getFreshIdToken, 
      signInWithGoogle, 
      signInWithEmail, 
      registerWithEmail, 
      resetPassword, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
