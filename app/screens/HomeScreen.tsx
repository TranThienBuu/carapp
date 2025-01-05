import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import Header from "../components/Header";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from "../../firebase.config";
import Slider from "../components/Slider";
import Category from "../components/Category";
import LatestItemList from "../components/LatestItemList";

export default function HomeScreen() {
    const db = getFirestore(app);
    const [sliderList, setSliderList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [latestItemList, setLatestItemList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getSliders();
        getCategoryList();
        getLatestItemList();
    }, []);

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
        const querySnapshot = await getDocs(collection(db, "Sliders"));
        querySnapshot.forEach((doc) => {
            setSliderList(sliderList => [...sliderList, doc.data()]);
        });
    };

    const getCategoryList = async () => {
        setCategoryList([]);
        const querySnapshot = await getDocs(collection(db, "Category"));
        querySnapshot.forEach((doc) => {
            console.log(doc.data());
            setCategoryList(categoryList => [...categoryList, doc.data()]);
        });
    };

    const getLatestItemList = async () => {
        setLatestItemList([]);
        const querySnapshot = await getDocs(collection(db, "plants"));
        querySnapshot.forEach((doc) => {
            console.log(doc.data());
            setLatestItemList(latestItemList => [...latestItemList, doc.data()]);
        });
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getSliders().then(() => {
            getCategoryList().then(() => {
                getLatestItemList().then(() => {
                    setRefreshing(false);
                });
            });
        });
    }, []);

    return (
        <ScrollView
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
                    heading={"Latest Items"}
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
