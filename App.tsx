import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './app/screens/LoginScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View} from 'react-native';
import TabNavigation from "./app/navigations/TabNavigation";
import ExploreScreen from "./app/screens/ExploreScreen";
import ProfileScreen from "./app/screens/ProfileScreen";
import {StatusBar} from "expo-status-bar";
import { AuthProvider, useAuth } from './app/context/AuthContext';

function AppContent() {
    const { user, isLoaded } = useAuth();

    if (!isLoaded) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="auto"/>
            {user ? (
                <NavigationContainer>
                    <TabNavigation/>
                </NavigationContainer>
            ) : (
                <LoginScreen />
            )}
        </View>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
