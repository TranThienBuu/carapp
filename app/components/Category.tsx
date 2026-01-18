
import React from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';



export default function Category({categoryList}) {

    const navigation = useNavigation();
    return (
        <View className="mt-5">
            <Text className="font-bold text-[20px] ">Danh mục</Text>
            <FlatList
                data={categoryList}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="items-center justify-center p-3 rounded-lg border-[1px] border-gray-300 mr-3"
                        onPress={()=>navigation.navigate("item-list",{
                            category:item.name
                        })}
                    >
                        <Text className="text-[22px]">{item.icon}</Text>
                        <Text className="text-[12px] mt-1">{item.name}</Text>
                    </TouchableOpacity>
                )}

            />
        </View>
    );
};
