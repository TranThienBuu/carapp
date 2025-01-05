import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, Text, View, RefreshControl } from "react-native";
import { collection, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
import { app } from "../../firebase.config";
import LatestItemList from "../components/LatestItemList";

export default function ExploreScreen() {
    const db = getFirestore(app);
    const [productList, setProductList] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getAllProducts();
    }, []);

    const getAllProducts = async () => {
        setProductList([]);
        const q = query(collection(db, "plants"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        snapshot.forEach((doc) => {
            setProductList(productList => [...productList, doc.data()]);
        });
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
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text className="text-[30px] font-bold">Khám phá</Text>
            <LatestItemList latestItemList={productList} />
        </ScrollView>
    );
}
