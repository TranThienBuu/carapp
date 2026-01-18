import React from 'react';
import {View, Image, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {useNavigation} from "@react-navigation/native";


export default function PostItem({ item, highlight }) {
    const navigation = useNavigation();
    return (
        <TouchableOpacity
            style={[styles.card, highlight && styles.cardHighlight]}
            activeOpacity={0.85}
            onPress={() => navigation.push("product-detail", { product: item })}
        >
            <Image source={{ uri: item.image }} style={styles.imagePro} />
            <View style={{ padding: 10 }}>
                <Text style={[styles.titlePro, highlight && { color: '#006266' }]}>{item.title}</Text>
                <Text style={[styles.pricePro, highlight && { color: '#d35400' }]}>${item.price}</Text>
                <Text style={[styles.categoryPro, highlight && { backgroundColor: '#d35400' }]}>{item.category}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 8,
        borderRadius: 18,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    cardHighlight: {
        borderWidth: 2,
        borderColor: '#006266',
        backgroundColor: '#f0fdfa',
        shadowColor: '#006266',
        shadowOpacity: 0.18,
        elevation: 10,
    },
    imagePro: {
        width: '100%',
        height: 180,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        resizeMode: 'cover',
    },
    titlePro: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#222',
    },
    pricePro: {
        fontSize: 18,
        fontWeight: '600',
        color: '#006266',
        marginBottom: 4,
    },
    categoryPro: {
        fontSize: 12,
        color: '#fff',
        backgroundColor: '#006266',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        overflow: 'hidden',
    },
});


