import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from './CartService';

export interface Order {
    id: string;
    orderId: string;
    userId: string;
    userName: string;
    userEmail: string;
    phone: string;
    address: string;
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    paymentMethod: 'COD' | 'VNPay' | 'MoMo';
    paymentStatus?: 'unpaid' | 'paid' | 'refunded';
    status: 'pending' | 'paid' | 'processing' | 'shipping' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    note?: string;
    paymentInfo?: {
        transactionId?: string;
        paidAt?: string;
    };
}


class OrderService {

    private normalizePaymentStatus(raw: any): any {
        if (!raw) return raw;
        if (raw.paymentStatus) return raw;
        const inferred = raw?.paymentInfo?.paidAt || raw?.status === 'paid' ? 'paid' : 'unpaid';
        return { ...raw, paymentStatus: inferred };
    }

    // Tạo đơn hàng mới
    async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const order = {
                ...orderData,
                paymentStatus: orderData.paymentStatus || 'unpaid',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            // Tạo đơn hàng
            const res = await fetch('https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/orders.json?auth=' + idToken, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order),
            });
            if (!res.ok) throw new Error('Permission denied');
            const data = await res.json();
            const orderKey = data.name;
            // Lưu vào danh sách đơn hàng của user
            await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/userOrders/${orderData.userId}/${orderKey}.json?auth=${idToken}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderData.orderId,
                    total: orderData.total,
                    status: orderData.status,
                    paymentStatus: orderData.paymentStatus || 'unpaid',
                    createdAt: order.createdAt
                }),
            });
            return orderKey;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    // Cập nhật trạng thái thanh toán (không đổi trạng thái xử lý/duyệt đơn)
    async updatePaymentStatus(
        orderId: string,
        paymentStatus: NonNullable<Order['paymentStatus']>,
        paymentInfo?: Order['paymentInfo']
    ): Promise<void> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const updateData: any = {
                paymentStatus,
                updatedAt: new Date().toISOString(),
            };
            if (paymentInfo) {
                updateData.paymentInfo = paymentInfo;
            }

            const res = await fetch(
                `https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json?auth=${idToken}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                }
            );
            if (!res.ok) throw new Error('Permission denied');

            // Update userOrders paymentStatus
            const orderRes = await fetch(
                `https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json?auth=${idToken}`
            );
            if (orderRes.ok) {
                const order = await orderRes.json();
                if (order && order.userId) {
                    await fetch(
                        `https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/userOrders/${order.userId}/${orderId}.json?auth=${idToken}`,
                        {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ paymentStatus }),
                        }
                    );
                }
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }

    // Lấy tất cả đơn hàng của một user
    async getUserOrders(userId: string): Promise<Order[]> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const isAdminStr = await AsyncStorage.getItem('isAdmin');
            const isAdmin = isAdminStr === 'true';
            console.log('🔑 getUserOrders - idToken:', idToken, '| isAdmin:', isAdmin);
            let orders: Order[] = [];
            if (isAdmin) {
                // Admin: lấy toàn bộ orders rồi lọc theo userId
                const url = `https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/orders.json?auth=${idToken}`;
                console.log('🔗 Admin fetching all orders URL:', url);
                const res = await fetch(url);
                if (!res.ok) throw new Error('Permission denied');
                const data = await res.json();
                if (data) {
                    orders = Object.keys(data)
                        .map(key => ({ id: key, ...this.normalizePaymentStatus(data[key]) }))
                        .filter(order => order.userId === userId);
                }
            } else {
                // User thường: userOrders chỉ lưu summary, cần hydrate chi tiết từ /orders/{orderKey}
                const url = `https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/userOrders/${userId}.json?auth=${idToken}`;
                console.log('🔗 User fetching userOrders URL:', url);
                const res = await fetch(url);
                if (!res.ok) throw new Error('Permission denied');
                const data = await res.json();
                if (!data) return [];

                const orderKeys = Object.keys(data);
                const hydrated = await Promise.all(
                    orderKeys.map(async (key) => {
                        try {
                            return await this.getOrderById(key);
                        } catch (e) {
                            return null;
                        }
                    })
                );
                orders = hydrated.filter((o): o is Order => !!o);
            }
            return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error('Error getting user orders:', error);
            throw error;
        }
    }

    // Lấy chi tiết một đơn hàng
    async getOrderById(orderId: string): Promise<Order | null> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json?auth=${idToken}`);
            if (!res.ok) throw new Error('Permission denied');
            const data = this.normalizePaymentStatus(await res.json());
            if (!data) return null;
            return {
                id: orderId,
                ...data
            };
        } catch (error) {
            console.error('Error getting order by id:', error);
            throw error;
        }
    }

    // Lấy đơn hàng theo mã đơn hàng (orderId)
    async getOrderByOrderId(orderId: string): Promise<Order | null> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch('https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/orders.json?orderBy="orderId"&equalTo="' + orderId + '"&auth=' + idToken);
            if (!res.ok) throw new Error('Permission denied');
            const data = await res.json();
            if (!data) return null;
            const key = Object.keys(data)[0];
            return {
                id: key,
                ...this.normalizePaymentStatus(data[key])
            };
        } catch (error) {
            console.error('Error getting order by orderId:', error);
            throw error;
        }
    }

    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(
        orderId: string, 
        status: Order['status'], 
        paymentInfo?: Order['paymentInfo']
    ): Promise<void> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const updateData: any = {
                status,
                updatedAt: new Date().toISOString()
            };
            if (paymentInfo) {
                updateData.paymentInfo = paymentInfo;
            }
            // Update order
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json?auth=${idToken}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });
            if (!res.ok) throw new Error('Permission denied');
            // Update userOrders status
            // Lấy order để lấy userId
            const orderRes = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json?auth=${idToken}`);
            if (orderRes.ok) {
                const order = await orderRes.json();
                if (order && order.userId) {
                    await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/userOrders/${order.userId}/${orderId}.json?auth=${idToken}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status }),
                    });
                }
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // Hủy đơn hàng
    async cancelOrder(orderId: string, reason?: string): Promise<void> {
        try {
            await this.updateOrderStatus(orderId, 'cancelled');
            if (reason) {
                const idToken = await AsyncStorage.getItem('idToken');
                await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/orders/${orderId}.json?auth=${idToken}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cancelReason: reason,
                        cancelledAt: new Date().toISOString()
                    }),
                });
            }
        } catch (error) {
            console.error('Error canceling order:', error);
            throw error;
        }
    }

    // Lấy tất cả đơn hàng (dành cho admin)
    async getAllOrders(): Promise<Order[]> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch('https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/orders.json?auth=' + idToken);
            if (!res.ok) throw new Error('Permission denied');
            const data = await res.json();
            if (!data) return [];
            const orders = Object.keys(data).map(key => ({
                id: key,
                ...this.normalizePaymentStatus(data[key])
            }));
            return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error('Error getting all orders:', error);
            throw error;
        }
    }

    // Thống kê đơn hàng theo trạng thái
    async getOrderStatistics(userId?: string): Promise<{
        total: number;
        pending: number;
        paid: number;
        processing: number;
        shipping: number;
        completed: number;
        cancelled: number;
    }> {
        try {
            const orders = userId 
                ? await this.getUserOrders(userId)
                : await this.getAllOrders();
            return {
                total: orders.length,
                pending: orders.filter(o => o.status === 'pending').length,
                paid: orders.filter(o => o.status === 'paid').length,
                processing: orders.filter(o => o.status === 'processing').length,
                shipping: orders.filter(o => o.status === 'shipping').length,
                completed: orders.filter(o => o.status === 'completed').length,
                cancelled: orders.filter(o => o.status === 'cancelled').length,
            };
        } catch (error) {
            console.error('Error getting order statistics:', error);
            throw error;
        }
    }

    // Tính tổng doanh thu
    async getTotalRevenue(userId?: string): Promise<number> {
        try {
            const orders = userId 
                ? await this.getUserOrders(userId)
                : await this.getAllOrders();
            return orders
                .filter(o => o.status !== 'cancelled')
                .reduce((total, order) => total + order.total, 0);
        } catch (error) {
            console.error('Error calculating total revenue:', error);
            return 0;
        }
    }
}

export const orderService = new OrderService();
