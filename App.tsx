import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View} from 'react-native';
import TabNavigation from "./app/navigations/TabNavigation";
import {StatusBar} from "expo-status-bar";
import { AuthProvider, useAuth } from './app/context/AuthContext';
import AuthStackNavigation from './app/navigations/AuthStackNavigation';

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
            <NavigationContainer>
                {user ? <TabNavigation /> : <AuthStackNavigation />}
            </NavigationContainer>
        </View>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
