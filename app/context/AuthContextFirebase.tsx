import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { app } from '../db/Firestore';

// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface User {
  id: string;
  fullName: string | null;
  imageUrl: string | null;
  primaryEmailAddress: { emailAddress: string | null };
  email?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => Promise<void>;
  isGoogleAuthEnabled: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: false,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInDemo: async () => {},
  isGoogleAuthEnabled: true,
});

export const useAuth = () => useContext(AuthContext);
export const useUser = () => {
  const { user, isLoaded } = useContext(AuthContext);
  return { user, isLoaded };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user from AsyncStorage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const newUser: User = {
        id: firebaseUser.uid,
        fullName: firebaseUser.displayName,
        imageUrl: firebaseUser.photoURL,
        primaryEmailAddress: { emailAddress: firebaseUser.email },
        email: firebaseUser.email,
      };
      
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw new Error(error.message || 'Failed to authenticate with Google.');
    }
  };

  const signInDemo = async () => {
    try {
      const demoUser: User = {
        id: 'demo-user-' + Date.now(),
        fullName: 'Demo User',
        imageUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=4ade80&color=fff&size=200',
        primaryEmailAddress: { emailAddress: 'demo@carapp.com' },
        email: 'demo@carapp.com',
      };
      setUser(demoUser);
      await AsyncStorage.setItem('user', JSON.stringify(demoUser));
    } catch (error) {
      console.error('Demo Sign-In Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoaded, 
      signOut, 
      signInWithGoogle, 
      signInDemo,
      isGoogleAuthEnabled: true
    }}>
      {children}
    </AuthContext.Provider>
  );
};
