import React from 'react';
import {FlatList, Image, TextInput, TouchableOpacity, View, StyleSheet, Text} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import PostItem from "./PostItem";



export default function LatestItemList({ latestItemList, heading }) {



    return (
        <View className="mt-3">

                <Text className="font-bold text-[20px]" >{heading}</Text>

            <FlatList
                data={latestItemList}
                numColumns={2}
                renderItem={({ item, index }) => (
                    <PostItem item={item}/>

                )}

            />
        </View>
    );
}

