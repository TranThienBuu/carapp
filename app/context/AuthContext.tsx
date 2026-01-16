import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const ENABLE_GOOGLE_AUTH = true;

// ====== TYPES ======
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

// ====== CONTEXT ======
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: false,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInDemo: async () => {},
  isGoogleAuthEnabled: ENABLE_GOOGLE_AUTH,
});

export const useAuth = () => useContext(AuthContext);
export const useUser = () => {
  const { user, isLoaded } = useContext(AuthContext);
  return { user, isLoaded };
};

// ====== PROVIDER ======
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // ===== Redirect URI =====
  // Sửa đoạn này trong AuthContext.tsx
  const redirectUri = AuthSession.makeRedirectUri({
    // Thay vì dùng scheme: 'carapp', hãy để Expo tự xử lý proxy khi dev
    useProxy: true,
  });
  console.log('🔥 redirectUri =', redirectUri);

  // ===== GOOGLE CONFIG =====
const googleAuthConfig = {
  // QUAN TRỌNG: Khi dùng Expo Go, bạn nên dùng Web Client ID
  clientId: '465301224798-fdnf9d34b1jg842uhafl1l3ngfcbs00s.apps.googleusercontent.com',
  androidClientId: '465301224798-fdnf9d34b1jg842uhafl1l3ngfcbs00s.apps.googleusercontent.com',
  iosClientId: '465301224798-fdnf9d34b1jg842uhafl1l3ngfcbs00s.apps.googleusercontent.com',
  redirectUri,
};

  console.log('🧩 googleAuthConfig =', googleAuthConfig);

  const [request, response, promptAsync] = Google.useAuthRequest(googleAuthConfig);

  useEffect(() => {
    console.log('🧩 Auth request object =', request);
  }, [request]);

  // ===== LOAD USER =====
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  // ===== HANDLE AUTH RESPONSE =====
  useEffect(() => {
    if (!response) return;

    console.log('📥 Auth response =', response);

    if (response.type === 'success') {
      const { authentication } = response;
      console.log('✅ authentication =', authentication);

      if (authentication?.accessToken) {
        getUserInfo(authentication.accessToken);
      }
    }

    if (response.type === 'error') {
      console.error('❌ Google Auth Error:', response.error);
    }
  }, [response]);

  // ===== FETCH GOOGLE PROFILE =====
  const getUserInfo = async (token: string) => {
    try {
      console.log('🔑 Access token =', token);

      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userInfo = await res.json();
      console.log('👤 Google userInfo =', userInfo);

      const newUser: User = {
        id: userInfo.id,
        fullName: userInfo.name,
        imageUrl: userInfo.picture,
        primaryEmailAddress: { emailAddress: userInfo.email },
        email: userInfo.email,
      };

      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };

  // ===== SIGN IN =====
  const signInWithGoogle = async () => {
    if (!ENABLE_GOOGLE_AUTH) throw new Error('Google Authentication is disabled.');

    try {
      console.log('🚀 Start Google login...');
      console.log('📦 Request details:', request);
      const result = await promptAsync();
      console.log('🟢 promptAsync result =', result);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  // ===== DEMO LOGIN =====
  const signInDemo = async () => {
    const demoUser: User = {
      id: 'demo-user-' + Date.now(),
      fullName: 'Demo User',
      imageUrl:
        'https://ui-avatars.com/api/?name=Demo+User&background=4ade80&color=fff&size=200',
      primaryEmailAddress: { emailAddress: 'demo@plantu.app' },
      email: 'demo@plantu.app',
    };

    setUser(demoUser);
    await AsyncStorage.setItem('user', JSON.stringify(demoUser));
  };

  // ===== SIGN OUT =====
  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        signOut,
        signInWithGoogle,
        signInDemo,
        isGoogleAuthEnabled: ENABLE_GOOGLE_AUTH,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
