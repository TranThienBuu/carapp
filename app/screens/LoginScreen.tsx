import React from "react";
import {ImageBackground, Text, TouchableOpacity, View, StyleSheet} from "react-native";
import {useOAuth} from "@clerk/clerk-expo";
import {useWarmUpBrowser} from "../components/SignInWithOAuth";
import * as WebBrowser from 'expo-web-browser';
const LoginScreen=()=>{
    useWarmUpBrowser();

    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

    const onPress = React.useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } =
                await startOAuthFlow();

            if (createdSessionId) {
                setActive?.({ session: createdSessionId });
            } else {
                // Use signIn or signUp for next steps such as MFA
            }
        } catch (err) {
            console.error("OAuth error", err);
        }
    }, [startOAuthFlow]);

    return (
        <ImageBackground source={require("../assets/bg.jpg")} style={styles.backgroundImage} >
        <View className="flex-1 bg-white">

            <View className="flex-1 items-center justify-center bg-green-900 bg-gradient-to-bl">
                <Text className="text-[24px]">Planto!</Text>
                <Text className="text-[18px]">Buy - Sell Your Plants </Text>
                <TouchableOpacity className="mt-20" onPress={onPress}>
                    <Text className="text-[32px]">Get started</Text>
                </TouchableOpacity>
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