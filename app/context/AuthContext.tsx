
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps } from 'firebase/app';

// Firebase config (dùng config của bạn, hoặc import từ file config)
const firebaseConfig = {
  apiKey: "AIzaSyBv75OD8GOFvHnG-1YU1y3OqcQxLr5S_-Y",
  authDomain: "carapp-eb690.firebaseapp.com",
  databaseURL: "https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "carapp-eb690",
  storageBucket: "carapp-eb690.appspot.com",
  messagingSenderId: "465301224798",
  appId: "1:465301224798:web:9e051408992089168923cf",
  measurementId: "G-H8WWWYVX1X"
};


let firebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

WebBrowser.maybeCompleteAuthSession();

const ENABLE_GOOGLE_AUTH = false; // Tạm tắt Google Auth

// ====== TYPES ======
interface User {
  id: string;
  fullName: string | null;
  imageUrl: string | null;
  primaryEmailAddress: { emailAddress: string | null };
  email?: string | null;
  isAdmin?: boolean;
}


interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  isGoogleAuthEnabled: boolean;
}

// ====== CONTEXT ======
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: false,
  isAdmin: false,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInDemo: async () => {},
  isGoogleAuthEnabled: ENABLE_GOOGLE_AUTH,
  signInWithEmailPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);
export const useUser = () => {
  const { user, isLoaded, isAdmin } = useContext(AuthContext);
  return { user, isLoaded, isAdmin };
};

// ====== PROVIDER ======
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // ===== Redirect URI =====
  // Sửa đoạn này trong AuthContext.tsx
  // Ép redirectUri về dạng https://auth.expo.io/@phongpham2410/carapp
  const redirectUri = `https://auth.expo.io/@phongpham2410/carapp`;
  console.log('🔥 redirectUri =', redirectUri);

  // ===== GOOGLE CONFIG =====
const googleAuthConfig = {
  clientId: '465301224798-glkisoveo058sus5jo59ivst675133vv.apps.googleusercontent.com', // Web Client ID bạn cung cấp
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
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAdmin(parsedUser.email === 'sphong2161857@gmail.com');
      }
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
      } else {
        console.error('❌ No accessToken in authentication:', authentication);
      }
    } else if (response.type === 'error') {
      console.error('❌ Google Auth Error:', response.error);
    } else {
      console.error('❌ Unknown response type:', response);
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

      // Lấy idToken từ Google accessToken qua Firebase REST API
      const firebaseApiKey = firebaseConfig.apiKey;
      const firebaseRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${firebaseApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postBody: `access_token=${token}&providerId=google.com`,
            requestUri: 'http://localhost',
            returnIdpCredential: true,
            returnSecureToken: true,
          }),
        }
      );
      const firebaseData = await firebaseRes.json();
      console.log('🔑 Firebase signInWithIdp response:', firebaseData);

      const newUser: User = {
        id: userInfo.id,
        fullName: userInfo.name,
        imageUrl: userInfo.picture,
        primaryEmailAddress: { emailAddress: userInfo.email },
        email: userInfo.email,
      };

      newUser.isAdmin = newUser.email === 'sphong2161857@gmail.com';
      setUser(newUser);
      setIsAdmin(newUser.isAdmin);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      if (firebaseData.idToken) {
        console.log('✅ Google login - idToken:', firebaseData.idToken);
        await AsyncStorage.setItem('idToken', firebaseData.idToken);
      } else {
        console.log('❌ Google login - idToken NOT FOUND:', firebaseData);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };


  // ===== SIGN IN GOOGLE =====
  const signInWithGoogle = async () => {
    if (!ENABLE_GOOGLE_AUTH) throw new Error('Google Authentication is disabled.');
    try {
      console.log('🚀 Start Google login...');
      console.log('📦 Request details:', request);
      const result = await promptAsync();
      console.log('🟢 promptAsync result =', result);
      // Nếu dùng Firebase Auth với Google, lấy accessToken và fetch profile như cũ
      if (result?.type === 'success' && result.authentication?.accessToken) {
        await getUserInfo(result.authentication.accessToken);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  // ===== SIGN IN EMAIL/PASSWORD =====
  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      const apiKey = firebaseConfig.apiKey;
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const newUser: User = {
        id: data.localId,
        fullName: data.displayName || '',
        imageUrl: null,
        primaryEmailAddress: { emailAddress: data.email },
        email: data.email,
      };
      newUser.isAdmin = newUser.email === 'sphong2161857@gmail.com';
      setUser(newUser);
      setIsAdmin(newUser.isAdmin);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      if (data.idToken) {
        await AsyncStorage.setItem('idToken', data.idToken);
      }
    } catch (error) {
      console.error('Firebase Email/Password Sign-In Error:', error);
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

    demoUser.isAdmin = demoUser.email === 'sphong2161857@gmail.com';
    setUser(demoUser);
    setIsAdmin(demoUser.isAdmin);
    await AsyncStorage.setItem('user', JSON.stringify(demoUser));
    await AsyncStorage.setItem('idToken', 'demo-token');
  };


  // ===== SIGN OUT =====
  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('idToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isAdmin,
        signOut,
        signInWithGoogle,
        signInDemo,
        signInWithEmailPassword,
        isGoogleAuthEnabled: ENABLE_GOOGLE_AUTH,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
