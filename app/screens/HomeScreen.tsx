import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Header from "../components/Header";
import { productService } from "../services/ProductService";
import Slider from "../components/Slider";
// ...existing code...
import LatestItemList from "../components/LatestItemList";

export default function HomeScreen() {
    const isFocused = useIsFocused();
    const [sliderList, setSliderList] = useState([]);
    // ...existing code...
    const [latestItemList, setLatestItemList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);
    
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            await Promise.all([
                getSliders(),
                // ...existing code...
                getLatestItemList()
            ]);
        } catch (err) {
            console.error('Lỗi tải dữ liệu:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Reload data when screen is focused (khi chuyển tab về)
    useEffect(() => {
        if (isFocused) {
            getLatestItemList();
        }
    }, [isFocused]);

    useEffect(() => {
        if (searchQuery === "") {
            setFilteredItems(latestItemList);
        } else {
            const filtered = latestItemList.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    }, [searchQuery, latestItemList]);

    const getSliders = async () => {
        // Sử dụng ảnh thực tế để slider hiển thị đẹp
        const mockSliders = [
            { name: 'Slider 1', image: 'https://vinfastauto.com/themes/porto/img/home/slider/vf9-1.jpg' },
            { name: 'Slider 2', image: 'https://vinfastauto.com/themes/porto/img/home/slider/vf8-1.jpg' },
        ];
        setSliderList(mockSliders);
    };

    // ...existing code...

    const getLatestItemList = async () => {
        try {
            const products = await productService.getProducts();
            // Convert sang format mà LatestItemList component mong đợi
            const formattedProducts = products
                .filter(p => p.status === 'active') // Chỉ lấy sản phẩm active
                .map(product => ({
                    id: product.id,
                    title: product.name,
                    category: product.category,
                    price: product.price,
                    desc: product.description,
                    image: product.image || 'https://via.placeholder.com/400x200?text=No+Image',
                    status: product.status,
                    createdAt: product.createdAt,
                }));
            setLatestItemList(formattedProducts);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData().finally(() => setRefreshing(false));
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#006266" />
                <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'red', marginBottom: 10 }}>Lỗi: {error}</Text>
                <Text style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>
                    Vui lòng kiểm tra kết nối internet và Firebase
                </Text>
            </View>
        );
    }

    // Lấy 2 sản phẩm mới nhất (giả sử đã được sắp xếp theo createdAt mới nhất)
    const latestTwo = filteredItems.slice(0, 2);
    return (
        <ScrollView
            nestedScrollEnabled={true}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={{ backgroundColor: '#f6f8fa' }}
        >
            <View style={styles.containerPro}>
                <Header onSearch={handleSearch} />
                <View style={{ marginTop: 24, marginBottom: 8 }}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#006266', marginBottom: 12, textAlign: 'center', letterSpacing: 0.5 }}>Sản phẩm mới nhất</Text>
                    <LatestItemList
                        latestItemList={latestTwo}
                        heading={null}
                        highlight
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    containerPro: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 16,
        backgroundColor: '#f6f8fa',
        minHeight: '100%',
    },
});
