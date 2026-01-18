import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { useUser } from "../context/AuthContext";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

export default function Header({ onSearch }) {
    const { user } = useUser();
    const navigation = useNavigation();

    return (
        <View className="mt-8">
            {/*user info section*/}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f0fdfa', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1.2, borderColor: '#006266', shadowColor: '#006266', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}>
                    <Image
                        source={{ uri: user?.imageUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                        style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, borderColor: '#006266', marginRight: 10, backgroundColor: '#fff' }}
                    />
                    <View>
                        <Text style={{ fontSize: 16, color: '#006266', fontWeight: 'bold', letterSpacing: 0.2 }}>Xin chào</Text>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: '#00997a',
                            marginTop: 2,
                            textShadowColor: 'rgba(0,0,0,0.13)',
                            textShadowOffset: { width: 1, height: 2 },
                            textShadowRadius: 4,
                            letterSpacing: 0.3,
                        }}>{user?.fullName || 'Khách hàng'}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("cart")}
                    style={{
                        backgroundColor: '#00997a',
                        borderRadius: 24,
                        padding: 10,
                        shadowColor: '#00997a',
                        shadowOpacity: 0.18,
                        shadowRadius: 8,
                        elevation: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="cart-outline" size={26} color="#fff" />
                </TouchableOpacity>
            </View>
            {/* App intro banner */}
            <View style={{
                backgroundColor: '#f0fdfa',
                borderRadius: 18,
                marginTop: 22,
                paddingVertical: 20,
                paddingHorizontal: 18,
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: '#006266',
                shadowColor: '#006266',
                shadowOpacity: 0.10,
                shadowRadius: 8,
                elevation: 4,
            }}>
                <Text style={{ color: '#006266', fontSize: 22, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5, textAlign: 'center' }}>
                    MBB Car - Xe tốt, giá tốt
                </Text>
                <Text style={{ color: '#222', fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '500' }}>
                    Nền tảng mua bán xe chuyên nghiệp, uy tín hàng đầu.
                    {'\n'}Đảm bảo chất lượng, giao dịch an toàn, thủ tục nhanh chóng, hỗ trợ tận tâm.
                </Text>
            </View>
        </View>
    );
}
