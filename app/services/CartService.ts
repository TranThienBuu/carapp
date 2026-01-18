import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    description: string;
    userId: string;
}


class CartService {

    // Lấy tất cả items trong giỏ hàng của user
    async getCartItems(userId: string): Promise<CartItem[]> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch('https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/carts/' + userId + '.json?auth=' + idToken);
            if (!res.ok) throw new Error('Permission denied');
            const data = await res.json();
            if (!data) return [];
            return Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
        } catch (error) {
            console.error('❌ CartService.getCartItems error:', error);
            throw error;
        }
    }


    // Thêm sản phẩm vào giỏ hàng
    async addToCart(userId: string, item: Omit<CartItem, 'id' | 'userId'>): Promise<string> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            // Kiểm tra xem sản phẩm đã có trong giỏ chưa
            const existingItems = await this.getCartItems(userId);
            const existingItem = existingItems.find(i => i.productId === item.productId);
            if (existingItem) {
                // Nếu đã có, cập nhật số lượng
                await this.updateCartItemQuantity(userId, existingItem.id, existingItem.quantity + item.quantity);
                return existingItem.id;
            } else {
                // Nếu chưa có, thêm mới
                const res = await fetch('https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/carts/' + userId + '.json?auth=' + idToken, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...item,
                        userId,
                        addedAt: new Date().toISOString()
                    }),
                });
                if (!res.ok) throw new Error('Permission denied');
                const data = await res.json();
                return data.name; // Firebase trả về key mới ở trường 'name'
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    // Cập nhật số lượng sản phẩm trong giỏ
    async updateCartItemQuantity(userId: string, itemId: string, quantity: number): Promise<void> {
        try {
            if (quantity <= 0) {
                await this.deleteCartItem(userId, itemId);
                return;
            }
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/carts/${userId}/${itemId}.json?auth=${idToken}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity }),
            });
            if (!res.ok) throw new Error('Permission denied');
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            throw error;
        }
    }

    // Xóa một sản phẩm khỏi giỏ hàng
    async deleteCartItem(userId: string, itemId: string): Promise<void> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/carts/${userId}/${itemId}.json?auth=${idToken}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Permission denied');
        } catch (error) {
            console.error('Error deleting cart item:', error);
            throw error;
        }
    }

    // Xóa toàn bộ giỏ hàng
    async clearCart(userId: string): Promise<void> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/carts/${userId}.json?auth=${idToken}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Permission denied');
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }

    // Tính tổng tiền trong giỏ hàng
    calculateTotal(items: CartItem[]): number {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    // Đếm số lượng items trong giỏ hàng
    async getCartCount(userId: string): Promise<number> {
        try {
            const items = await this.getCartItems(userId);
            return items.reduce((count, item) => count + item.quantity, 0);
        } catch (error) {
            console.error('Error getting cart count:', error);
            return 0;
        }
    }
}

export const cartService = new CartService();
