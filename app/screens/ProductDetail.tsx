import React, { useCallback, useEffect, useState } from "react";
import {
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    Linking,
    Share,
    Alert, ToastAndroid
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useUser } from "../context/AuthContext";
import { doc, deleteDoc, getFirestore, query, where, collection, getDocs, getDoc, setDoc } from "firebase/firestore";
import { app } from "../../firebase.config";

export default function ProductDetail({ navigation }) {

    const [loading, setLoading] = useState<boolean>(false);
    const { params } = useRoute();
    const [product, setProduct] = useState([]);
    const [quantity, setQuantity] = useState<number>(1);
    const { user } = useUser();
    const db = getFirestore(app);
    const nav = useNavigation();

    useEffect(() => {
        params && setProduct(params.product);
        shareButton();
    }, [params, navigation]);

    const shareButton = () => {
        navigation.setOptions({
            headerRight: () => (
                <Ionicons name="share-social-outline" size={24} color="white"
                          style={{ marginRight: 15 }}
                          onPress={() => shareProduct()} />
            ),
        });
    }

    const shareProduct = () => {
        const content = {
            message: product?.title + "\n" + product?.description,
        }
        Share.share(content).then(resp => {
            console.log(resp);
        }, (error) => {
            console.log(error);
        });
    }

    const sendEmailMessage = () => {
        const subject = "Liên hệ về " + product.title;
        const body = "Chào " + product.userName + "\n" + "Tôi muốn mua xe này ";
        Linking.openURL("mailto:" + product.userEmail + "?subject=" + subject + "&body=" + body);
    }

    const deleteUserPost = () => {
        Alert.alert('Xác nhận xóa', "Bạn có chắc chắn muốn xóa sản phẩm này không?", [
            {
                text: "Xóa",
                onPress: () => deleteFromFirestore()
            },
            {
                text: "Hủy",
                onPress: () => console.log("Cancel pressed"),
                style: "cancel",
            }
        ])
    }

    const deleteFromFirestore = async () => {
        console.log("Deleted");
        const q = query(collection(db, "cars"), where("title", "==", product.title));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            deleteDoc(doc.ref).then(resp => {
                console.log("Delete the doc...");
                nav.goBack();
            })
        })
    }





    const handleAddToCart = useCallback(
        async () => {
            setLoading(true);
            try {
                const cartRef = doc(collection(db, "carts"), "userCart"); // Sửa firestore thành db
                const cartDoc = await getDoc(cartRef);

                let cartData = {};
                if (cartDoc.exists()) {
                    const existingProducts = cartDoc.data().products || [];
                    const existingQuantities = cartDoc.data().quantities || [];
                    const existingProductIndex = existingProducts.indexOf(product?.title);
                    // const buyerName = "";


                    if (existingProductIndex !== -1) {
                        existingQuantities[existingProductIndex] += quantity;
                    } else {
                        existingProducts.push(product?.title);
                        existingQuantities.push(quantity);

                    }
                    cartData = {
                        products: existingProducts,
                        quantities: existingQuantities,
                        // buyerName:user.fullName,

                    };
                } else {
                    cartData = {
                        products: [product?.title],
                        quantities: [quantity],
                        // buyerName:user.fullName,
                    };
                }
                await setDoc(cartRef, cartData, { merge: true });

               ToastAndroid.show("Đã thêm vào giỏ hàng thành công!", ToastAndroid.SHORT)
            } catch (error) {
                console.error("Error adding to cart: ", error);
            } finally {
                setLoading(false);
                setQuantity(1);
            }
        },
        [quantity, db]
    );





    return (
        <ScrollView className="bg-white">
            <Image source={{ uri: product.image }}
                   className="h-[320px] w-full" />

            <View className="p-3">
                <Text className="text-[24px] font-bold">{product?.title}</Text>
                <View className="items-baseline">
                    <Text className="text-green-800 bg-green-200 p-1 px-2">{product.category}</Text>
                    <View className="flex-row justify-between">
                        <Text className="text-[28px] p-1 px-2">{product.price}</Text>

                        {user?.primaryEmailAddress?.emailAddress === product.userEmail ?

                            <View className="flex-row justify-between"></View>
                            :
                        <View className="flex-row pl-10">
                        <View className="flex-row mx-2 px-0.5 mr-10 items-center justify-between border-[0.5px]">
                            <TouchableOpacity onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                                <Ionicons name="remove-circle-outline" size={24} color="black" />
                            </TouchableOpacity>
                            <Text>{quantity}</Text>
                            <TouchableOpacity onPress={() => setQuantity((prev) =>prev + 1)}>
                                <Ionicons name="add-circle-outline" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => handleAddToCart(product)} disabled={loading}>
                            <Text className="text-[16px] font-bold">Thêm vào giỏ</Text>
                        </TouchableOpacity>
                    </View>
                        }
                    </View>
                </View>
                <Text className="text-[20px] mt-5 font-semibold">Mô tả</Text>
                <Text className="text-[18px] text-gray-700">{product?.description}</Text>
            </View>

            <View className="p-3 m-3 flex flex-row items-center bg-gray-50 border-gray-300">
                <Image source={{ uri: product.userImage }}
                       className="w-12 h-12 rounded-full" />
                <View className="">
                    <Text className="font-semibold text-[16px]">
                        {product.userName}
                    </Text>
                    <Text className="text-gray-500">
                        {product.userEmail}
                    </Text>
                </View>
            </View>

            {user?.primaryEmailAddress?.emailAddress === product.userEmail ?
                <View>

                    <TouchableOpacity className="z-40 bg-red-500 rounded-full p-3 m-2"
                                      onPress={() => deleteUserPost()}
                    >
                        <Text className="text-white text-center font-bold">Xóa bài đăng</Text>
                    </TouchableOpacity>
                </View>
                :
                <TouchableOpacity className="z-40 bg-green-600 rounded-full p-3 m-2"
                                  onPress={() => sendEmailMessage()}
                >
                    <Text className="text-white text-center font-bold">Gửi tin nhắn</Text>
                </TouchableOpacity>
            }
        </ScrollView>
    )
}

