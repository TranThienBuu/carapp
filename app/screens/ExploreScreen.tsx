import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, Text, View, RefreshControl } from "react-native";
import { useIsFocused } from '@react-navigation/native';
import { mockDataService } from "../services/MockDataService";
import LatestItemList from "../components/LatestItemList";

export default function ExploreScreen() {
    const isFocused = useIsFocused();
    const [productList, setProductList] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getAllProducts();
    }, []);

    // Reload data when screen is focused (khi chuyển tab về)
    useEffect(() => {
        if (isFocused) {
            getAllProducts();
        }
    }, [isFocused]);

    const getAllProducts = async () => {
        try {
            const products = await mockDataService.getProducts();
            // Convert sang format mà LatestItemList component mong đợi
            const formattedProducts = products.map(product => ({
                id: product.id,
                title: product.name,
                category: product.category,
                price: product.price,
                desc: product.description,
                image: product.image || 'https://via.placeholder.com/400x200?text=No+Image',
                status: product.status,
                createdAt: product.createdAt,
            }));
            setProductList(formattedProducts);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getAllProducts().then(() => {
            setRefreshing(false);
        });
    }, []);

    return (
        <ScrollView
            className="p-5 py-8"
            nestedScrollEnabled={true}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text className="text-[30px] font-bold">Khám phá</Text>
            <LatestItemList latestItemList={productList} />
        </ScrollView>
    );
}
