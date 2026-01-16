import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Header from "../components/Header";
import { mockDataService } from "../services/MockDataService";
import Slider from "../components/Slider";
import Category from "../components/Category";
import LatestItemList from "../components/LatestItemList";

export default function HomeScreen() {
    const isFocused = useIsFocused();
    const [sliderList, setSliderList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
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
                getCategoryList(),
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
        setSliderList([]);
        // Mock sliders data - bạn có thể custom lại
        const mockSliders = [
            { name: 'Slider 1', image: 'https://via.placeholder.com/400x200' },
            { name: 'Slider 2', image: 'https://via.placeholder.com/400x200' },
        ];
        setSliderList(mockSliders);
    };

    const getCategoryList = async () => {
        // Mock categories data - bạn có thể custom lại
        const mockCategories = [
            { name: 'Sedan', icon: '🚗', id: '1' },
            { name: 'SUV', icon: '🚙', id: '2' },
            { name: 'Luxury', icon: '🚘', id: '3' },
        ];
        setCategoryList(mockCategories);
    };

    const getLatestItemList = async () => {
        try {
            const products = await mockDataService.getProducts();
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

    return (
        <ScrollView
            nestedScrollEnabled={true}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.container}>
                <Header onSearch={handleSearch} />
                <Slider sliderList={sliderList} />
                <Category categoryList={categoryList} />
                <LatestItemList
                    latestItemList={filteredItems}
                    heading={"Sản phẩm mới nhất"}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: 'white',
    },
});
