
import React from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';



export default function Category({categoryList}) {

    const navigation = useNavigation();
    return (
        <View className="mt-5">
            <Text className="font-bold text-[20px] ">Categories</Text>
            <FlatList
                scrollEnabled={false}
                data={categoryList}
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity  className="flex-1 items-center justify-center p-2 border-[1px]
                   rounded-lg border-gray-300 m-1 h-[80px]"
                    onPress={()=>navigation.navigate("item-list",{
                        category:item.name
                    })}
                    >
                        <Image source={{ uri: item.icon }}
                               className="w-[35px] h-[35px]"/>
                        <Text
                            className="text-[12px] mt-1">{item.name}</Text>
                    </TouchableOpacity>
                )}

            />
        </View>
    );
};
