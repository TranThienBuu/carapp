import { getDatabase, ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { app } from '../../firebase.config';
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
    private db = getDatabase(app);

    // Tạo đơn hàng mới
    async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const ordersRef = ref(this.db, 'orders');
            const newOrderRef = push(ordersRef);
            
            const order: Omit<Order, 'id'> = {
                ...orderData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await set(newOrderRef, order);
            
            // Lưu vào danh sách đơn hàng của user
            const userOrderRef = ref(this.db, `userOrders/${orderData.userId}/${newOrderRef.key}`);
            await set(userOrderRef, {
                orderId: orderData.orderId,
                total: orderData.total,
                status: orderData.status,
                createdAt: order.createdAt
            });

            return newOrderRef.key || '';
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    // Lấy tất cả đơn hàng của một user
    async getUserOrders(userId: string): Promise<Order[]> {
        try {
            const ordersRef = ref(this.db, 'orders');
            const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(userId));
            const snapshot = await get(userOrdersQuery);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                const orders = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                
                // Sắp xếp theo thời gian tạo mới nhất
                return orders.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }
            return [];
        } catch (error) {
            console.error('Error getting user orders:', error);
            throw error;
        }
    }

    // Lấy chi tiết một đơn hàng
    async getOrderById(orderId: string): Promise<Order | null> {
        try {
            const orderRef = ref(this.db, `orders/${orderId}`);
            const snapshot = await get(orderRef);
            
            if (snapshot.exists()) {
                return {
                    id: orderId,
                    ...snapshot.val()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting order by id:', error);
            throw error;
        }
    }

    // Lấy đơn hàng theo mã đơn hàng (orderId)
    async getOrderByOrderId(orderId: string): Promise<Order | null> {
        try {
            const ordersRef = ref(this.db, 'orders');
            const orderQuery = query(ordersRef, orderByChild('orderId'), equalTo(orderId));
            const snapshot = await get(orderQuery);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                const key = Object.keys(data)[0];
                return {
                    id: key,
                    ...data[key]
                };
            }
            return null;
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
            const orderRef = ref(this.db, `orders/${orderId}`);
            const updateData: any = {
                status,
                updatedAt: new Date().toISOString()
            };

            if (paymentInfo) {
                updateData.paymentInfo = paymentInfo;
            }

            await update(orderRef, updateData);
            
            // Cập nhật trong userOrders
            const snapshot = await get(orderRef);
            if (snapshot.exists()) {
                const order = snapshot.val();
                const userOrderRef = ref(this.db, `userOrders/${order.userId}/${orderId}`);
                await update(userOrderRef, { status });
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
                const orderRef = ref(this.db, `orders/${orderId}`);
                await update(orderRef, { 
                    cancelReason: reason,
                    cancelledAt: new Date().toISOString()
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
            const ordersRef = ref(this.db, 'orders');
            const snapshot = await get(ordersRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                const orders = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                
                // Sắp xếp theo thời gian tạo mới nhất
                return orders.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }
            return [];
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
