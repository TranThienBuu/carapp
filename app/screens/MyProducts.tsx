import React, {useEffect, useState} from "react";
import {Text, View} from "react-native";
import {collection, getDocs, getFirestore, query, where} from "firebase/firestore";
import {app} from "../../firebase.config";
import {useUser} from "../context/AuthContext";
import LatestItemList from "../components/LatestItemList";
import {useNavigation} from "@react-navigation/native";

export default function MyProductsScreen() {

    const db=getFirestore(app);

    const {user}= useUser();

    const [productList, setProductList] = useState([]);

    const navigation =useNavigation();

    useEffect(() => {
    user&&getUSerPost();
    }, [user]);

    useEffect(() => {
navigation.addListener("focus",(e)=>{
    console.log(e);
    getUSerPost();
})
    }, [navigation]);


    const getUSerPost=async ()=>{
        setProductList([]);
        const q=query(collection(db, "cars"), where("userEmail", "==",
        user?.primaryEmailAddress?.emailAddress))
        const snapshot= await getDocs(q);
        snapshot.forEach(doc=>{
        setProductList(productList=>[...productList, doc.data()]);
    })

    }

    return(
        <View>
          <LatestItemList latestItemList={productList}

          />
        </View>
    )
}