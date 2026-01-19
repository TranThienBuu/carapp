import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Order, orderService } from '../services/OrderService';

type RouteParams = {
  orderId: string;
};

const formatCurrency = (value: number) => `$${(value || 0).toLocaleString('en-US')}`;

const getStatusText = (status: Order['status']) => {
  const texts: Record<Order['status'], string> = {
    pending: 'Chờ duyệt',
    paid: 'Đã thanh toán',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };
  return texts[status] || status;
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

export default function OrderDetailScreen() {
  const route = useRoute();
  const { orderId } = (route.params || {}) as RouteParams;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId);
        if (mounted) setOrder(data);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (orderId) {
      load();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const totalItems = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [order?.items]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#006266" />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#999" />
        <Text style={{ marginTop: 10, color: '#666' }}>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        <Text style={styles.title}>#{order.orderId}</Text>
        <Text style={styles.sub}>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái đơn:</Text>
          <Text style={styles.value}>{getStatusText(order.status)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Thanh toán:</Text>
          <Text style={styles.value}>{getPaymentStatusText(order.paymentStatus)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phương thức:</Text>
          <Text style={styles.value}>{order.paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Người nhận:</Text>
          <Text style={styles.value}>{order.userName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>SĐT:</Text>
          <Text style={styles.value}>{order.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{order.userEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Địa chỉ:</Text>
          <Text style={[styles.value, { flex: 1 }]}>{order.address}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sản phẩm ({totalItems})</Text>

        {order.items?.map((item, index) => (
          <View key={`${item.productId}-${index}`} style={styles.itemRow}>
            <Image
              source={{ uri: item.image || 'https://via.placeholder.com/80' }}
              style={styles.itemImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.itemMeta}>SL: {item.quantity}</Text>
              <Text style={styles.itemMeta}>{formatCurrency(item.price)} / sp</Text>
            </View>
            <Text style={styles.itemTotal}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tổng thanh toán</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tạm tính:</Text>
          <Text style={styles.value}>{formatCurrency(order.subtotal)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phí vận chuyển:</Text>
          <Text style={styles.value}>{formatCurrency(order.shippingFee)}</Text>
        </View>
        <View style={[styles.row, { marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' }]}>
          <Text style={[styles.label, { fontWeight: '800' }]}>Tổng cộng:</Text>
          <Text style={[styles.value, { fontWeight: '800', color: '#006266' }]}>
            {formatCurrency(order.total)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  sub: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    color: '#0f172a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  label: {
    color: '#64748b',
    fontSize: 13,
  },
  value: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748b',
  },
  itemTotal: {
    fontWeight: '800',
    color: '#006266',
  },
});
