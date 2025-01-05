import React from 'react';
import {View, Image, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {useUser} from "@clerk/clerk-expo";
import {useNavigation} from "@react-navigation/native";


export default function PostItem({ item }) {
    const navigation = useNavigation();
    return (
    <TouchableOpacity className="flex-1 m-2 p-2 rounded-lg
                   border-[1px] border-slate-200 bg-green-50"
                      onPress={()=>navigation.push("product-detail",
        {
            product: item,
        })}>
        <Image source={{ uri: item.image }}
               className="w-full h-[170px]"/>
        <View>

            <Text className="text-[15px] mt-2 font-bold">{item.title}</Text>
            <Text className="text-[20px] font-semibold text-green-900">đ {item.price}</Text>
            <Text className="text-green-900 bg-gray-400 p-1 rounded-full px-3 text-center text-[10px] w-[80px]">{item.category}</Text>
        </View>
    </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        flexDirection: 'column',
        margin: 8,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'white',
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    itemDetails: {
        padding: 8,
    },
    categoryText: {
        fontSize: 16,
        color: 'gray',
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    priceText: {
        fontSize: 16,
        color: 'green',
    },
});


