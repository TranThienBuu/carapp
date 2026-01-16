import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

// Configuration: Set to true to enable Google OAuth (requires valid Client IDs)
const ENABLE_GOOGLE_AUTH = true;

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
  isGoogleAuthEnabled: ENABLE_GOOGLE_AUTH,
});

export const useAuth = () => useContext(AuthContext);
export const useUser = () => {
  const { user, isLoaded } = useContext(AuthContext);
  return { user, isLoaded };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Google OAuth Client IDs
  const googleAuthConfig = {
    iosClientId: ENABLE_GOOGLE_AUTH ? '465301224798-glkisoveo058sus5jo59ivst675133vv.apps.googleusercontent.com' : 'dummy-ios-client-id',
    androidClientId: ENABLE_GOOGLE_AUTH ? '465301224798-glkisoveo058sus5jo59ivst675133vv.apps.googleusercontent.com' : 'dummy-android-client-id',
    webClientId: ENABLE_GOOGLE_AUTH ? '465301224798-glkisoveo058sus5jo59ivst675133vv.apps.googleusercontent.com' : 'dummy-web-client-id',
    expoClientId: ENABLE_GOOGLE_AUTH ? '465301224798-glkisoveo058sus5jo59ivst675133vv.apps.googleusercontent.com' : 'dummy-expo-client-id',
    // Luôn hiện màn hình chọn tài khoản Google
    selectAccount: true,
    // Don't use redirectUri - let Expo auto-generate the correct one
  };

  const [request, response, promptAsync] = Google.useAuthRequest(googleAuthConfig);

  // Load user from AsyncStorage on mount
  useEffect(() => {
    loadUser();
    
    // Set up interval to check for user changes (for demo login)
    const interval = setInterval(() => {
      loadUser();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (JSON.stringify(parsedUser) !== JSON.stringify(user)) {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      if (!isLoaded) {
        setIsLoaded(true);
      }
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        getUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const getUserInfo = async (token: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await response.json();
      
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

  const signInWithGoogle = async () => {
    if (!ENABLE_GOOGLE_AUTH) {
      throw new Error('Google Authentication is disabled. Please use Demo Mode.');
    }
    try {
      const result = await promptAsync();
      if (result.type === 'error') {
        console.error('Google Sign-In Error:', result.error);
        throw new Error('Failed to authenticate with Google. Please check OAuth configuration.');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signInDemo = async () => {
    try {
      const demoUser: User = {
        id: 'demo-user-' + Date.now(),
        fullName: 'Demo User',
        imageUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=4ade80&color=fff&size=200',
        primaryEmailAddress: { emailAddress: 'demo@plantu.app' },
        email: 'demo@plantu.app',
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
      isGoogleAuthEnabled: ENABLE_GOOGLE_AUTH 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
