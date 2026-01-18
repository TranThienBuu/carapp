import React from "react";
import {FlatList, Image, Text, TouchableOpacity, View, ScrollView} from "react-native";
import {useAuth, useUser} from "../context/AuthContext";
import {useNavigation} from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
    const {user} = useUser();
    const navigation = useNavigation();
    const {isLoaded, signOut} = useAuth();

    const onMenuPress = (item) => {
        if(item.name == "Đăng xuất") {
            signOut();
        }
        item?.path ? navigation.navigate(item.path) : null;
    }

    const menuList = [
        {
            id: 2,
            name: "Đơn hàng của tôi",
            icon: "receipt",
            path: "orders",
            color: "#F59E0B",
            bgColor: "#FEF3C7"
        },
        {
            id: 3,
            name: "Khám phá",
            icon: "compass",
            path: "explore-nav",
            color: "#8B5CF6",
            bgColor: "#F5F3FF"
        },
        {
            id: 5,
            name: "Đăng xuất",
            icon: "log-out",
            color: "#EF4444",
            bgColor: "#FEF2F2"
        },
    ]

    const statsData = [
        { label: "Đơn hàng", value: "5", icon: "receipt" },
        { label: "Đánh giá", value: "4.8", icon: "star" },
        // Decor lại: thêm màu gradient cho card
    ]

    return(
        <ScrollView className="flex-1 bg-gray-100">
            {/* User Card Section */}
            <View className="px-5 pt-12 pb-6">
                <View style={{backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 10, elevation: 6}}>
                    {/* Avatar with border and shadow */}
                    <View style={{borderWidth: 4, borderColor: '#6ab04c', borderRadius: 100, padding: 4, backgroundColor: '#fff', shadowColor: '#6ab04c', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4}}>
                        <Image 
                            source={{uri: user?.imageUrl}}
                            style={{width: 120, height: 120, borderRadius: 60, backgroundColor: '#e5e7eb'}} 
                        />
                    </View>
                    {/* Name */}
                    <Text style={{fontWeight: 'bold', fontSize: 28, marginTop: 16, color: '#222'}}> {user?.fullName} </Text>
                    {/* Email */}
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6}}>
                        <Ionicons name="mail" size={18} color="#6ab04c" style={{marginRight: 6}} />
                        <Text style={{fontSize: 15, color: '#6ab04c', fontWeight: '600'}}>{user?.primaryEmailAddress?.emailAddress}</Text>
                    </View>
                    {/* Optional: Phone if available */}
                    {user?.phone && (
                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                            <Ionicons name="call" size={18} color="#6ab04c" style={{marginRight: 6}} />
                            <Text style={{fontSize: 15, color: '#6ab04c', fontWeight: '600'}}>{user.phone}</Text>
                        </View>
                    )}
                    {/* Edit Profile Button */}
                    <TouchableOpacity
                        style={{marginTop: 18, backgroundColor: '#6ab04c', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 20}}
                        onPress={() => navigation.navigate('ProfileEditScreen')}
                    >
                        <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Chỉnh sửa hồ sơ</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Cards */}
            <View className="flex-row justify-around px-5 mb-6">
                {statsData.map((stat, index) => (
                    <LinearGradient
                        key={index}
                        colors={["#e0e7ff", "#fff"]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={{ borderRadius: 18, padding: 18, alignItems: 'center', flex: 1, marginHorizontal: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 }}
                    >
                        <View style={{ backgroundColor: '#f3f4f6', borderRadius: 999, padding: 10, marginBottom: 8 }}>
                            <Ionicons name={stat.icon as any} size={28} color="#6366f1" />
                        </View>
                        <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#1e293b' }}>{stat.value}</Text>
                        <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{stat.label}</Text>
                    </LinearGradient>
                ))}
            </View>

            {/* Menu Items */}
            <View className="px-5 pb-8">
                <Text className="font-bold text-[18px] text-gray-800 mb-4">Chức năng</Text>
                <FlatList 
                    data={menuList}
                    scrollEnabled={false}
                    numColumns={2}
                    columnWrapperStyle={{justifyContent: 'space-between'}}
                    renderItem={({item, index}) => {
                        // Nếu là panel Đăng xuất, cho chiếm cả 2 cột
                        if (item.name === 'Đăng xuất') {
                            return (
                                <TouchableOpacity
                                    onPress={() => onMenuPress(item)}
                                    className="bg-white rounded-2xl p-5 mb-4 shadow-sm items-center"
                                    style={{width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center'}}
                                >
                                    <View 
                                        className="rounded-full p-4 mb-3"
                                        style={{backgroundColor: item.bgColor, marginRight: 16}}
                                    >
                                        <Ionicons 
                                            name={item.icon as any} 
                                            size={32} 
                                            color={item.color} 
                                        />
                                    </View>
                                    <Text 
                                        className="text-[16px] font-bold text-center"
                                        style={{color: item.color}}
                                    >
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }
                        // Panel thường
                        return (
                            <TouchableOpacity
                                onPress={() => onMenuPress(item)}
                                className="bg-white rounded-2xl p-5 mb-4 shadow-sm items-center"
                                style={{width: '48%'}}
                            >
                                <View 
                                    className="rounded-full p-4 mb-3"
                                    style={{backgroundColor: item.bgColor}}
                                >
                                    <Ionicons 
                                        name={item.icon as any} 
                                        size={32} 
                                        color={item.color} 
                                    />
                                </View>
                                <Text 
                                    className="text-[14px] font-semibold text-center"
                                    style={{color: item.color}}
                                >
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                />
            </View>
        </ScrollView>
    )
}