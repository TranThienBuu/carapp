import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Modal,
    ScrollView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderService, Order } from '../services/OrderService';
import { formatUSD } from '../utils/currency';

const AdminOrdersScreen = ({ navigation }: any) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<'all' | Order['status']>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const statusOptions: { value: Order['status']; label: string; color: string }[] = [
        { value: 'pending', label: 'Chờ xử lý', color: '#FFA500' },
        { value: 'paid', label: 'Đã thanh toán', color: '#4CAF50' },
        { value: 'processing', label: 'Đang xử lý', color: '#2196F3' },
        { value: 'shipping', label: 'Đang giao', color: '#9C27B0' },
        { value: 'completed', label: 'Hoàn thành', color: '#4CAF50' },
        { value: 'cancelled', label: 'Đã hủy', color: '#F44336' },
    ];

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [selectedStatus, orders]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const allOrders = await orderService.getAllOrders();
            setOrders(allOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterOrders = () => {
        if (selectedStatus === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(o => o.status === selectedStatus));
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadOrders();
    };

    const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
            loadOrders();
            setModalVisible(false);
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
        }
    };

    const handleUpdatePaymentStatus = async (
        orderId: string,
        paymentStatus: NonNullable<Order['paymentStatus']>
    ) => {
        try {
            await orderService.updatePaymentStatus(
                orderId,
                paymentStatus,
                paymentStatus === 'paid'
                    ? {
                        transactionId: selectedOrder?.paymentInfo?.transactionId || `MANUAL-${Date.now()}`,
                        paidAt: selectedOrder?.paymentInfo?.paidAt || new Date().toISOString(),
                    }
                    : undefined
            );

            Alert.alert('Thành công', 'Đã cập nhật trạng thái thanh toán');
            await loadOrders();
            setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus } : prev));
        } catch (error) {
            console.error('Error updating payment status:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái thanh toán');
        }
    };

    const openOrderDetail = (order: Order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const getStatusColor = (status: Order['status']) => {
        const option = statusOptions.find(o => o.value === status);
        return option?.color || '#757575';
    };

    const getStatusLabel = (status: Order['status']) => {
        const option = statusOptions.find(o => o.value === status);
        return option?.label || status;
    };

    const getPaymentMethodText = (method: Order['paymentMethod']) => {
        switch (method) {
            case 'COD': return 'Tiền mặt';
            case 'VNPay': return 'VNPay';
            case 'MoMo': return 'MoMo';
            default: return method;
        }
    };

    const getPaymentStatusText = (paymentStatus?: Order['paymentStatus']) => {
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

    const renderFilterTabs = () => (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
        >
            <TouchableOpacity
                style={[
                    styles.filterTab,
                    selectedStatus === 'all' && styles.filterTabActive
                ]}
                onPress={() => setSelectedStatus('all')}
            >
                <Text style={[
                    styles.filterTabText,
                    selectedStatus === 'all' && styles.filterTabTextActive
                ]}
                numberOfLines={1}>
                    Tất cả ({orders.length})
                </Text>
            </TouchableOpacity>

            {statusOptions.map((option) => {
                const count = orders.filter(o => o.status === option.value).length;
                return (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.filterTab,
                            selectedStatus === option.value && styles.filterTabActive,
                            selectedStatus === option.value && { backgroundColor: option.color }
                        ]}
                        onPress={() => setSelectedStatus(option.value)}
                    >
                        <Text style={[
                            styles.filterTabText,
                            selectedStatus === option.value && styles.filterTabTextActive
                        ]}
                        numberOfLines={1}>
                            {option.label} ({count})
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => openOrderDetail(item)}
        >
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderId}>#{item.orderId}</Text>
                    <Text style={styles.orderDate}>
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                </View>
            </View>

            <View style={styles.orderBody}>
                <View style={styles.orderRow}>
                    <Ionicons name="person" size={16} color="#666" />
                    <Text style={styles.orderLabel}>{item.userName}</Text>
                </View>
                <View style={styles.orderRow}>
                    <Ionicons name="call" size={16} color="#666" />
                    <Text style={styles.orderLabel}>{item.phone}</Text>
                </View>
                <View style={styles.orderRow}>
                    <Ionicons name="location" size={16} color="#666" />
                    <Text style={styles.orderLabel} numberOfLines={1}>{item.address}</Text>
                </View>
                <View style={styles.orderRow}>
                    <Ionicons name="card" size={16} color="#666" />
                    <Text style={styles.orderLabel}>{getPaymentMethodText(item.paymentMethod)}</Text>
                </View>
            </View>

            <View style={styles.orderFooter}>
                <View style={styles.itemCount}>
                    <Ionicons name="cart" size={16} color="#006266" />
                    <Text style={styles.itemCountText}>
                        {item.items.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm
                    </Text>
                </View>
                <Text style={styles.totalAmount}>
                    {formatUSD(item.total)}
                </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={{ color: '#666' }}>
                    Thanh toán: {getPaymentStatusText(item.paymentStatus)}
                </Text>
                <Text style={{ color: '#666' }}>
                    {getPaymentMethodText(item.paymentMethod)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderOrderDetailModal = () => {
        if (!selectedOrder) return null;

        return (
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Order Info */}
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Mã đơn:</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.orderId}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Ngày đặt:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Trạng thái:</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                                        <Text style={styles.statusText}>{getStatusLabel(selectedOrder.status)}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Customer Info */}
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Tên:</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.userName}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>SĐT:</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.phone}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Email:</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.userEmail}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Địa chỉ:</Text>
                                    <Text style={[styles.detailValue, { flex: 1 }]}>{selectedOrder.address}</Text>
                                </View>
                            </View>

                            {/* Products */}
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Sản phẩm</Text>
                                {selectedOrder.items.map((item, index) => (
                                    <View key={index} style={[styles.productRow, { alignItems: 'center' }]}>
                                        <Image
                                            source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                                            style={{ width: 46, height: 46, borderRadius: 8, marginRight: 10, backgroundColor: '#f1f5f9' }}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.productName}>{item.name}</Text>
                                            <Text style={styles.productQuantity}>SL: {item.quantity}</Text>
                                        </View>
                                        <Text style={styles.productPrice}>
                                            ${((item.price * item.quantity) || 0).toLocaleString('en-US')}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Payment Summary */}
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Thanh toán</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Tạm tính:</Text>
                                    <Text style={styles.detailValue}>${(selectedOrder.subtotal || 0).toLocaleString('en-US')}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Phí vận chuyển:</Text>
                                    <Text style={styles.detailValue}>${(selectedOrder.shippingFee || 0).toLocaleString('en-US')}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Phương thức:</Text>
                                    <Text style={styles.detailValue}>{getPaymentMethodText(selectedOrder.paymentMethod)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Trạng thái thanh toán:</Text>
                                    <Text style={styles.detailValue}>{getPaymentStatusText(selectedOrder.paymentStatus)}</Text>
                                </View>
                                <View style={[styles.detailRow, styles.totalRow]}>
                                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                                    <Text style={styles.totalValue}>${(selectedOrder.total || 0).toLocaleString('en-US')}</Text>
                                </View>
                            </View>

                            {/* Update Status */}
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Cập nhật trạng thái</Text>
                                <View style={styles.statusButtons}>
                                    {statusOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.statusButton,
                                                { backgroundColor: option.color },
                                                selectedOrder.status === option.value && styles.statusButtonActive
                                            ]}
                                            onPress={() => {
                                                Alert.alert(
                                                    'Xác nhận',
                                                    `Cập nhật trạng thái thành "${option.label}"?`,
                                                    [
                                                        { text: 'Hủy', style: 'cancel' },
                                                        {
                                                            text: 'Xác nhận',
                                                            onPress: () => handleUpdateStatus(selectedOrder.id, option.value)
                                                        }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Text style={styles.statusButtonText}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Update Payment Status */}
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Cập nhật thanh toán</Text>
                                <View style={styles.statusButtons}>
                                    {([
                                        { value: 'unpaid', label: 'Chưa thanh toán', color: '#64748b' },
                                        { value: 'paid', label: 'Đã thanh toán', color: '#16a34a' },
                                        { value: 'refunded', label: 'Hoàn tiền', color: '#7c3aed' },
                                    ] as const).map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.statusButton,
                                                { backgroundColor: option.color },
                                                selectedOrder.paymentStatus === option.value && styles.statusButtonActive,
                                            ]}
                                            onPress={() => {
                                                Alert.alert(
                                                    'Xác nhận',
                                                    `Cập nhật thanh toán thành "${option.label}"?`,
                                                    [
                                                        { text: 'Hủy', style: 'cancel' },
                                                        {
                                                            text: 'Xác nhận',
                                                            onPress: () =>
                                                                handleUpdatePaymentStatus(selectedOrder.id, option.value),
                                                        },
                                                    ]
                                                );
                                            }}
                                        >
                                            <Text style={styles.statusButtonText}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    if (loading && orders.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#006266" />
                <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Statistics Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{orders.length}</Text>
                    <Text style={styles.statLabel}>Tổng đơn</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#FFA500' }]}>
                        {orders.filter(o => o.status === 'pending').length}
                    </Text>
                    <Text style={styles.statLabel}>Chờ duyệt</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#2196F3' }]}>
                        {orders.filter(o => o.status === 'processing' || o.status === 'shipping').length}
                    </Text>
                    <Text style={styles.statLabel}>Đang xử lý</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                        {orders.filter(o => o.status === 'completed').length}
                    </Text>
                    <Text style={styles.statLabel}>Hoàn thành</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            {renderFilterTabs()}

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={100} color="#ccc" />
                    <Text style={styles.emptyText}>Không có đơn hàng</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
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
            )}

            {/* Order Detail Modal */}
            {renderOrderDetailModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#006266',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    filterContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 6,
    },
    filterContent: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        alignItems: 'center',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
        flexShrink: 0,
        minHeight: 36,
        justifyContent: 'center',
    },
    filterTabActive: {
        backgroundColor: '#006266',
    },
    filterTabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    filterTabTextActive: {
        color: '#fff',
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
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    orderDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    orderBody: {
        marginBottom: 12,
    },
    orderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    itemCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemCountText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#006266',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#006266',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalBody: {
        padding: 20,
    },
    detailSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productName: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    productQuantity: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 12,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#006266',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 2,
        borderTopColor: '#006266',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#006266',
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    statusButtonActive: {
        borderWidth: 3,
        borderColor: '#FFD700',
    },
    statusButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default AdminOrdersScreen;
