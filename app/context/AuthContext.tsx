import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: false,
  signOut: async () => {},
  signInWithGoogle: async () => {},
});

export const useAuth = () => useContext(AuthContext);
export const useUser = () => {
  const { user, isLoaded } = useContext(AuthContext);
  return { user, isLoaded };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '105906920756-YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: '105906920756-YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: '105906920756-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

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
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google Sign-In Error:', error);
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
    <AuthContext.Provider value={{ user, isLoaded, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
