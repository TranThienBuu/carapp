import React from 'react';
import {FlatList, Image, TextInput, TouchableOpacity, View, StyleSheet, Text} from 'react-native';
import PostItem from "./PostItem";



export default function LatestItemList({ latestItemList, heading, highlight }) {
    return (
        <View style={[{ marginTop: 12 }, highlight && { backgroundColor: '#fff', borderRadius: 18, padding: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }] }>
            {heading ? (
                <Text className="font-bold text-[20px]" >{heading}</Text>
            ) : null}
            <FlatList
                scrollEnabled={false}
                data={latestItemList}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 2 }}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <PostItem item={item} highlight={highlight} />
                )}
            />
        </View>
    );
}

