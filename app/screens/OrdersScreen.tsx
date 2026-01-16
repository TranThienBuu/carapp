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
import { mockDataService, Order } from '../services/MockDataService';

const OrdersScreen = ({ navigation }: any) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await mockDataService.getOrders();
            // Sắp xếp theo ngày mới nhất
            const sortedOrders = data.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
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

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => {
                Alert.alert(
                    'Chi tiết đơn hàng',
                    `Mã đơn: ${item.orderId}\n` +
                    `Người nhận: ${item.userName}\n` +
                    `SĐT: ${item.phone}\n` +
                    `Địa chỉ: ${item.address}\n` +
                    `Số sản phẩm: ${item.items.length}\n` +
                    `Tổng tiền: ${item.total.toLocaleString('vi-VN')}đ\n` +
                    `Phương thức: ${item.paymentMethod}\n` +
                    `Trạng thái: ${getStatusText(item.status)}`
                );
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
                        {item.items.length} sản phẩm
                    </Text>
                    <Text style={styles.paymentMethod}>
                        {item.paymentMethod === 'COD' ? '💵 COD' : '💳 VNPay'}
                    </Text>
                </View>
                <Text style={styles.totalPrice}>
                    {item.total.toLocaleString('vi-VN')}đ
                </Text>
            </View>

            <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleString('vi-VN')}
            </Text>
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
