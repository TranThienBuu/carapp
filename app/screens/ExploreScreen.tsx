import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, Text, View, RefreshControl, TextInput } from "react-native";
import { useIsFocused } from '@react-navigation/native';
import { productService } from "../services/ProductService";
import LatestItemList from "../components/LatestItemList";

export default function ExploreScreen() {
    const isFocused = useIsFocused();
    const [productList, setProductList] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        getAllProducts();
    }, []);

    // Reload data when screen is focused (khi chuyển tab về)
    useEffect(() => {
        if (isFocused) {
            getAllProducts();
        }
    }, [isFocused]);

    // Lọc sản phẩm theo searchQuery
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredProducts(productList);
        } else {
            setFilteredProducts(
                productList.filter(product =>
                    product.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
    }, [searchQuery, productList]);

    const getAllProducts = async () => {
        try {
            const products = await productService.getProducts();
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

    // Phân loại xe theo hãng (dựa trên filteredProducts)
    const groupedByBrand = {};
    filteredProducts.forEach(product => {
        const brand = product.category || 'Khác';
        if (!groupedByBrand[brand]) groupedByBrand[brand] = [];
        groupedByBrand[brand].push(product);
    });

    return (
        <ScrollView
            style={{ backgroundColor: '#f6f8fa' }}
            contentContainerStyle={{ padding: 18, paddingTop: 28, paddingBottom: 32 }}
            nestedScrollEnabled={true}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#006266', marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 }}>Khám phá xe theo hãng</Text>
            <TextInput
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    fontSize: 16,
                    marginBottom: 18,
                    borderWidth: 1,
                    borderColor: '#e0e0e0',
                }}
            />
            {Object.keys(groupedByBrand).length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#888', marginTop: 24 }}>Không tìm thấy sản phẩm phù hợp.</Text>
            ) : (
                Object.keys(groupedByBrand).map(brand => (
                    <View key={brand} style={{ marginBottom: 36, backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#006266', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#00997a', marginBottom: 14, textAlign: 'left', letterSpacing: 0.5 }}>{brand}</Text>
                        <LatestItemList latestItemList={groupedByBrand[brand]} highlight />
                    </View>
                ))
            )}
        </ScrollView>
    );
}
