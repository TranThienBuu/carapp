import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator} from "react-native";
import {useRoute} from "@react-navigation/native";
import {collection, getDocs, getFirestore, query, where} from "firebase/firestore";
import {app} from "../../firebase.config";
import LatestItemList from "../components/LatestItemList";

export default function ItemList() {
    const {params}=useRoute();
    const db= getFirestore(app);
    const [itemList, setItemList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        params&&getItemListByCategory();
    }, [params]);

    const getItemListByCategory = async () => {
        setItemList([]);
        setLoading(true);
        const q=query(collection(db, "cars"), where("category", "==", params.category));
        const snapshot=await  getDocs(q);
        setLoading(false)
        snapshot.forEach(doc=>{
            console.log(doc.data());
            setItemList(itemList=>[...itemList, doc.data()]);
            setLoading(false)
        })
    }
    return(
        <View className="p-2">
            {loading?
                <ActivityIndicator className="mt-24" size="large" color="#C8C8C8"/>
            :
            itemList?.length>0? <LatestItemList latestItemList={itemList}
            heading={""}/>
            :<Text className="p-5 justify-center mt-28 text-center text-[20px] text-gray-500">Không tìm thấy sản phẩm</Text>}
            </View>
    )
}