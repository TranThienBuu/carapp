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
        // ...Ẩn mục Sản phẩm của tôi
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
            id: 4,
            name: "Hướng dẫn",
            icon: "help-circle",
            url: "",
            color: "#10B981",
            bgColor: "#ECFDF5"
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
            {/* Header with Gradient */}
            <View className="bg-gradient-to-b from-blue-500 to-blue-600 pb-8 pt-12 rounded-b-3xl shadow-lg">
                <View className="items-center px-5">
                    {/* Avatar with border */}
                    <View className="bg-white rounded-full p-1 shadow-xl">
                        <Image 
                            source={{uri: user?.imageUrl}}
                            className="w-[120px] h-[120px] rounded-full"
                        />
                    </View>
                    
                    {/* User Info */}
                    <Text className="font-bold text-[28px] mt-4 text-white">
                        {user?.fullName}
                    </Text>
                    <Text className="text-[16px] mt-1 text-blue-100">
                        {user?.primaryEmailAddress?.emailAddress}
                    </Text>
                    
                    {/* Edit Profile Button */}
                    <TouchableOpacity className="mt-4 bg-white/20 px-6 py-2 rounded-full border border-white/30">
                        <Text className="text-white font-semibold">Chỉnh sửa hồ sơ</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Cards */}
            <View className="flex-row justify-around px-5 -mt-8 mb-6">
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
                    renderItem={({item, index}) => (
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
                    )}
                />
            </View>
        </ScrollView>
    )
}