
import React, { useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View, StyleSheet, Alert, ActivityIndicator, TextInput } from "react-native";
import { useAuth } from "../context/AuthContext";
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();


const LoginScreen = () => {
    const { signInWithGoogle, signInDemo, isGoogleAuthEnabled, signInWithEmailPassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleEmailPasswordLogin = async () => {
        if (!email || !password) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập email và mật khẩu.");
            return;
        }
        try {
            setIsLoading(true);
            await signInWithEmailPassword(email, password);
        } catch (err: any) {
            Alert.alert("Lỗi đăng nhập", err.message || "Sai email hoặc mật khẩu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!isGoogleAuthEnabled) {
            Alert.alert(
                "Tính năng không khả dụng",
                "Google Sign-In hiện đang bị tắt. Vui lòng sử dụng Demo Mode để vào app.",
                [{ text: "OK" }]
            );
            return;
        }
        
        try {
            setIsLoading(true);
            await signInWithGoogle();
        } catch (err: any) {
            console.error("OAuth error", err);
            Alert.alert(
                "Lỗi đăng nhập",
                err.message || "Không thể đăng nhập với Google.",
                [{ text: "OK" }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        try {
            setIsLoading(true);
            await signInDemo();
        } catch (err: any) {
            console.error("Demo login error", err);
            Alert.alert(
                "Lỗi",
                "Không thể đăng nhập Demo Mode. Vui lòng thử lại.",
                [{ text: "OK" }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ImageBackground source={require("../assets/bg.jpg")} style={styles.backgroundImage} >
            <View className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center bg-green-900 bg-gradient-to-bl px-8">
                    {/* Logo & Title */}
                    <View className="items-center mb-12">
                        <Text className="text-white text-[48px] font-bold">🚗</Text>
                        <Text className="text-white text-[32px] font-bold mt-2">CarApp</Text>
                        <Text className="text-white text-[16px] mt-1">Mua bán xe hơi dễ dàng</Text>
                    </View>

                    {/* Email/Password Login */}
                    <View className="w-full max-w-xs mb-4">
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#ccc"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            editable={!isLoading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mật khẩu"
                            placeholderTextColor="#ccc"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: '#16a34a', marginTop: 8, borderRadius: 12, padding: 12 }]}
                            onPress={handleEmailPasswordLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Đăng nhập</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Demo Login - Primary */}
                    <TouchableOpacity
                        className="w-full max-w-xs p-4 bg-white rounded-xl shadow-lg"
                        onPress={handleDemoLogin}
                        disabled={isLoading}
                        style={styles.primaryButton}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#16a34a" />
                        ) : (
                            <View className="flex-row items-center justify-center">
                                <Text className="text-[20px] mr-2">🚀</Text>
                                <Text className="text-green-600 text-[18px] font-bold">
                                    Vào App Ngay
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Google Login - Secondary (if enabled) */}
                    {isGoogleAuthEnabled && (
                        <TouchableOpacity
                            className="w-full max-w-xs p-3 bg-white/20 rounded-xl mt-3 border-2 border-white"
                            onPress={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            <View className="flex-row items-center justify-center">
                                <Text className="text-white text-[16px] font-semibold">
                                    Đăng nhập với Google
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Info Message */}
                    <View className="mt-10 px-6">
                        <Text className="text-white/80 text-[12px] text-center">
                            ✨ Không cần đăng ký - Bắt đầu ngay lập tức
                        </Text>
                        {!isGoogleAuthEnabled && (
                            <Text className="text-white/60 text-[11px] text-center mt-2">
                                (Google Sign-In tạm thời không khả dụng)
                            </Text>
                        )}
                    </View>
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
    primaryButton: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
    },
});