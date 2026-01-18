import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { cartService, CartItem } from '../services/CartService';
import { useUser } from '../context/AuthContext';

const CartScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useUser();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Load cart items khi component mount
    useEffect(() => {
        console.log('🔍 CartScreen - User object:', JSON.stringify(user, null, 2));
        console.log('🔍 CartScreen - User ID:', user?.id);
        
        if (user?.id) {
            console.log('✅ User ID tồn tại, đang load giỏ hàng...');
            loadCartItems();
        } else {
            console.log('❌ Không có User ID, không thể load giỏ hàng');
            setCartItems([]);
        }
    }, [user]);

    const loadCartItems = async () => {
        if (!user?.id) {
            console.log('❌ loadCartItems: Không có user.id');
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem giỏ hàng');
            return;
        }
        
        console.log('📥 loadCartItems: Đang tải giỏ hàng cho user:', user.id);
        setLoading(true);
        try {
            const items = await cartService.getCartItems(user.id);
            console.log('✅ loadCartItems: Đã lấy được', items.length, 'sản phẩm');
            setCartItems(items);
        } catch (error) {
            console.error('❌ Error loading cart:', error);
            Alert.alert('Lỗi', 'Không thể tải giỏ hàng. Vui lòng kiểm tra Firebase Rules.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadCartItems();
    };

    const handleIncrease = async (itemId: string) => {
        if (!user?.id) return;
        
        try {
            const item = cartItems.find(i => i.id === itemId);
            if (!item) return;
            
            await cartService.updateCartItemQuantity(user.id, itemId, item.quantity + 1);
            // State sẽ tự động cập nhật qua realtime listener
        } catch (error) {
            console.error('Error increasing quantity:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật số lượng');
        }
    };

    const handleDecrease = async (itemId: string) => {
        if (!user?.id) return;
        
        try {
            const item = cartItems.find(i => i.id === itemId);
            if (!item || item.quantity <= 1) return;
            
            await cartService.updateCartItemQuantity(user.id, itemId, item.quantity - 1);
            // State sẽ tự động cập nhật qua realtime listener
        } catch (error) {
            console.error('Error decreasing quantity:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật số lượng');
        }
    };

    const handleDeleteItem = (itemId: string) => {
        if (!user?.id) return;
        
        Alert.alert(
            'Xóa sản phẩm',
            'Bạn có chắc muốn xóa sản phẩm này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cartService.deleteCartItem(user.id, itemId);
                            // State sẽ tự động cập nhật qua realtime listener
                            Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng');
                        } catch (error) {
                            console.error('Error deleting item:', error);
                            Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
                        }
                    }
                }
            ]
        );
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleProceedToCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán');
            return;
        }

        const totalAmount = calculateSubtotal();
        navigation.navigate('checkout', {
            cartItems: cartItems,
            totalAmount: totalAmount
        });
    };

    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                </Text>
                <Text style={styles.itemPrice}>
                    {item.price.toLocaleString('vi-VN')}đ
                </Text>
            </View>
            <View style={styles.itemActions}>
                <View style={styles.quantityControl}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleDecrease(item.id)}
                    >
                        <Ionicons name="remove" size={20} color="#006266" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleIncrease(item.id)}
                    >
                        <Ionicons name="add" size={20} color="#006266" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id)}
                >
                    <Ionicons name="trash-outline" size={24} color="#ff4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading && cartItems.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#006266" />
                <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
            </View>
        );
    }

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={100} color="#ccc" />
                <Text style={styles.emptyText}>Giỏ hàng trống</Text>
                <Text style={styles.emptySubText}>
                    Hãy thêm sản phẩm vào giỏ hàng để mua sắm
                </Text>
                <TouchableOpacity
                    style={styles.shopNowButton}
                    onPress={() => navigation.navigate('home')}
                >
                    <Text style={styles.shopNowText}>Mua sắm ngay</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />

            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tạm tính:</Text>
                    <Text style={styles.summaryValue}>
                        {calculateSubtotal().toLocaleString('vi-VN')}đ
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handleProceedToCheckout}
                >
                    <Text style={styles.checkoutButtonText}>Tiến hành thanh toán</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#006266',
    },
    itemActions: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 4,
    },
    quantityButton: {
        padding: 4,
    },
    quantityText: {
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 8,
        marginTop: 8,
    },
    summaryContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#006266',
    },
    checkoutButton: {
        backgroundColor: '#006266',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 8,
        marginBottom: 24,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    shopNowButton: {
        backgroundColor: '#006266',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopNowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CartScreen;
