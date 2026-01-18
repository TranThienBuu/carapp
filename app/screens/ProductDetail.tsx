import React, { useCallback, useEffect, useState } from "react";
import {
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    Linking,
    Share,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useUser } from "../context/AuthContext";
import { doc, deleteDoc, getFirestore, query, where, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebase.config";
import { cartService } from "../services/CartService";

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





    const handleAddToCart = async () => {
        if (!product) return;
        if (!user?.id) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
            return;
        }
        
        setLoading(true);
        try {
            // Thêm sản phẩm vào giỏ hàng qua Firebase Realtime Database
            await cartService.addToCart(user.id, {
                productId: product.id || Date.now().toString(),
                name: product.title,
                price: parseFloat(product.price) || 0,
                quantity: quantity,
                image: product.image || 'https://via.placeholder.com/400',
                description: product.description || '',
            });

            Alert.alert(
                '✅ Thành công', 
                `Đã thêm ${quantity} ${product.title} vào giỏ hàng`,
                [
                    { text: 'Tiếp tục mua', style: 'cancel' },
                    { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('cart') }
                ]
            );
            setQuantity(1); // Reset về 1
        } catch (error) {
            console.error("Error adding to cart:", error);
            Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
        } finally {
            setLoading(false);
        }
    };





    return (
        <ScrollView style={styles.container}>
            {/* Product Image */}
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: product.image }} 
                    style={styles.productImage}
                    resizeMode="cover"
                />
            </View>

            {/* Product Info Card */}
            <View style={styles.contentCard}>
                {/* Title & Category */}
                <View style={styles.headerSection}>
                    <Text style={styles.productTitle}>{product?.title}</Text>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{product.category}</Text>
                    </View>
                </View>

                {/* Price & Actions */}
                <View style={styles.priceSection}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Giá</Text>
                        <Text style={styles.priceValue}>${product.price?.toLocaleString()}</Text>
                    </View>

                    {user?.primaryEmailAddress?.emailAddress !== product.userEmail && (
                        <View style={styles.quantitySection}>
                            {/* Quantity Controls */}
                            <View style={styles.quantityControl}>
                                <TouchableOpacity 
                                    style={styles.quantityButton}
                                    onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                >
                                    <Ionicons name="remove" size={20} color="#006266" />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{quantity}</Text>
                                <TouchableOpacity 
                                    style={styles.quantityButton}
                                    onPress={() => setQuantity((prev) => prev + 1)}
                                >
                                    <Ionicons name="add" size={20} color="#006266" />
                                </TouchableOpacity>
                            </View>

                            {/* Add to Cart Button */}
                            <TouchableOpacity 
                                style={[styles.addToCartButton, loading && styles.addToCartButtonDisabled]}
                                onPress={handleAddToCart} 
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="cart" size={20} color="white" />
                                        <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text" size={20} color="#006266" />
                        <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                    </View>
                    <Text style={styles.descriptionText}>{product?.description}</Text>
                </View>

                {/* Seller Info */}
                <View style={styles.sellerSection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-circle" size={20} color="#006266" />
                        <Text style={styles.sectionTitle}>Thông tin người bán</Text>
                    </View>
                    <View style={styles.sellerCard}>
                        <Image 
                            source={{ uri: product.userImage }} 
                            style={styles.sellerAvatar}
                        />
                        <View style={styles.sellerInfo}>
                            <Text style={styles.sellerName}>{product.userName}</Text>
                            <Text style={styles.sellerEmail}>{product.userEmail}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                {user?.primaryEmailAddress?.emailAddress === product.userEmail ? (
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={deleteUserPost}
                    >
                        <Ionicons name="trash" size={20} color="white" />
                        <Text style={styles.deleteButtonText}>Xóa bài đăng</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={styles.contactButton}
                        onPress={sendEmailMessage}
                    >
                        <Ionicons name="mail" size={20} color="white" />
                        <Text style={styles.contactButtonText}>Gửi tin nhắn cho người bán</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: '#fff',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    contentCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    headerSection: {
        marginBottom: 16,
    },
    productTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#065F46',
    },
    priceSection: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    priceContainer: {
        marginBottom: 16,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#006266',
    },
    quantitySection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    quantityButton: {
        padding: 8,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        color: '#333',
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#006266',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#006266',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    addToCartButtonDisabled: {
        backgroundColor: '#999',
    },
    addToCartText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    descriptionSection: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#666',
    },
    sellerSection: {
        marginBottom: 20,
    },
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    sellerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#e0e0e0',
    },
    sellerInfo: {
        flex: 1,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    sellerEmail: {
        fontSize: 14,
        color: '#666',
    },
    actionButtons: {
        padding: 20,
        paddingBottom: 30,
    },
    contactButton: {
        flexDirection: 'row',
        backgroundColor: '#006266',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#006266',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    contactButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        flexDirection: 'row',
        backgroundColor: '#EF4444',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

