import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderService, Order } from '../services/OrderService';
import { useUser } from '../context/AuthContext';

const OrdersScreen = ({ navigation }: any) => {
    const { user } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        if (!user?.id) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem đơn hàng');
            navigation.goBack();
            return;
        }

        setLoading(true);
        try {
            const data = await orderService.getUserOrders(user.id);
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadOrders();
    };

    const handleCancelOrder = (order: Order) => {
        if (order.status !== 'pending') {
            Alert.alert('Không thể hủy', 'Chỉ có thể hủy đơn hàng đang chờ xử lý');
            return;
        }

        Alert.alert(
            'Hủy đơn hàng',
            `Bạn có chắc muốn hủy đơn hàng ${order.orderId}?`,
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy đơn',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await orderService.cancelOrder(order.id, 'Người dùng hủy đơn');
                            Alert.alert('Thành công', 'Đã hủy đơn hàng');
                            loadOrders();
                        } catch (error) {
                            console.error('Error canceling order:', error);
                            Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: Order['status']) => {
        const colors = {
            pending: '#FFA500',
            paid: '#4CAF50',
            processing: '#2196F3',
            shipping: '#FF9800',
            completed: '#4CAF50',
            cancelled: '#F44336',
        };
        return colors[status] || '#999';
    };

    const getStatusText = (status: Order['status']) => {
        const texts = {
            pending: 'Chờ xử lý',
            paid: 'Đã thanh toán',
            processing: 'Đang xử lý',
            shipping: 'Đang giao',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
        };
        return texts[status] || status;
    };

    const getPaymentStatusText = (paymentStatus?: Order['paymentStatus'], method?: Order['paymentMethod']) => {
        if (!paymentStatus) {
            // Backward-compatible for old orders
            return method === 'VNPay' ? 'Chưa thanh toán' : 'Chưa thanh toán';
        }
        switch (paymentStatus) {
            case 'paid':
                return 'Đã thanh toán';
            case 'refunded':
                return 'Đã hoàn tiền';
            case 'unpaid':
            default:
                return 'Chưa thanh toán';
        }
    };

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => {
                navigation.navigate('order-detail', { orderId: item.id });
            }}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderIdContainer}>
                    <Ionicons name="receipt-outline" size={20} color="#006266" />
                    <Text style={styles.orderId}>{item.orderId}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>

            <View style={styles.orderInfo}>
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.userName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
                </View>
            </View>

            <View style={styles.orderFooter}>
                <View style={styles.itemsInfo}>
                    <Text style={styles.itemsCount}>
                        {(item.items && Array.isArray(item.items)) ? item.items.length : 0} sản phẩm
                    </Text>
                    <Text style={styles.paymentMethod}>
                        {item.paymentMethod === 'COD' ? '💵 COD' : '💳 VNPay'}
                    </Text>
                </View>
                <Text style={styles.totalPrice}>
                    {item.total.toLocaleString('vi-VN')}đ
                </Text>
            </View>

            <Text style={[styles.orderDate, { textAlign: 'left' }]}>
                Thanh toán: {getPaymentStatusText(item.paymentStatus, item.paymentMethod)}
            </Text>

            <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleString('vi-VN')}
            </Text>

            {item.status === 'pending' && (
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelOrder(item)}
                >
                    <Ionicons name="close-circle-outline" size={18} color="#F44336" />
                    <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    if (loading && orders.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#006266" />
                <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={100} color="#ccc" />
                <Text style={styles.emptyText}>Chưa có đơn hàng</Text>
                <Text style={styles.emptySubText}>
                    Các đơn hàng của bạn sẽ hiển thị ở đây
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#006266']}
                    />
                }
            />
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
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    orderInfo: {
        gap: 8,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginBottom: 8,
    },
    itemsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemsCount: {
        fontSize: 14,
        color: '#666',
    },
    paymentMethod: {
        fontSize: 12,
        color: '#006266',
        fontWeight: '600',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#006266',
    },
    orderDate: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FFEBEE',
    },
    cancelButtonText: {
        marginLeft: 6,
        color: '#F44336',
        fontSize: 14,
        fontWeight: '600',
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
        textAlign: 'center',
    },
});

export default OrdersScreen;
