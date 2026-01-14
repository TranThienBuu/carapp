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
            <View className="flex flex-row justify-between">
                <View className="flex flex-row items-center gap-2">
                    <Image
                        source={{ uri: user?.imageUrl }}
                        className="rounded-full w-12 h-12"
                    />
                    <View>
                        <Text className="text-[16px]">Xin chào</Text>
                        <Text className="text-[20px] font-bold">{user?.fullName}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("cart")}>
                    <Ionicons name="cart-outline" size={30} color="black" />
                </TouchableOpacity>
            </View>
            {/*search bar*/}
            <View className="p-3 px-5 flex flex-row bg-white items-center mt-5 rounded-full border-[1px] border-green-600">
                <MaterialIcons name="search" size={24} color="gray" />
                <TextInput
                    className="ml-2 text-[18px]"
                    placeholder={"Tìm kiếm"}
                    onChangeText={onSearch}
                />
            </View>
        </View>
    );
}
