import React from "react";
import {ImageBackground, Text, TouchableOpacity, View, StyleSheet} from "react-native";
import {useAuth} from "../context/AuthContext";
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen=()=>{
    const { signInWithGoogle } = useAuth();

    const onPress = async () => {
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error("OAuth error", err);
        }
    };

    // Demo login for testing without Google OAuth setup
    const onDemoLogin = async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const demoUser = {
            id: 'demo-user',
            fullName: 'Demo User',
            imageUrl: 'https://via.placeholder.com/150',
            primaryEmailAddress: { emailAddress: 'demo@example.com' },
            email: 'demo@example.com',
        };
        await AsyncStorage.setItem('user', JSON.stringify(demoUser));
        // Force reload to trigger context update
        window.location.reload();
    };

    return (
        <ImageBackground source={require("../assets/bg.jpg")} style={styles.backgroundImage} >
        <View className="flex-1 bg-white">

            <View className="flex-1 items-center justify-center bg-green-900 bg-gradient-to-bl">
                <Text className="text-[24px]">Planto!</Text>
                <Text className="text-[18px]">Buy - Sell Your Plants </Text>
                <TouchableOpacity className="mt-20" onPress={onPress}>
                    <Text className="text-[32px]">Get started</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="mt-10 p-3 bg-gray-700 rounded-lg" onPress={onDemoLogin}>
                    <Text className="text-white text-[16px]">Skip Login (Demo Mode)</Text>
                </TouchableOpacity>
                
                <Text className="text-[12px] text-gray-600 mt-5 px-10 text-center">
                    Note: Google Sign-In requires OAuth setup. Use Demo Mode to test the app.
                </Text>
            </View>
        </View>
        </ImageBackground>
    );
}
export default LoginScreen;

const styles = StyleSheet.create({

    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
})