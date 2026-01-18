import { getDatabase, ref, push, set, get, update, remove, onValue } from 'firebase/database';
import { app } from '../../firebase.config';

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
    private db = getDatabase(app);

    // Lấy tất cả items trong giỏ hàng của user
    async getCartItems(userId: string): Promise<CartItem[]> {
        try {
            console.log('🔍 CartService.getCartItems - userId:', userId);
            const cartPath = `carts/${userId}`;
            console.log('🔍 CartService.getCartItems - path:', cartPath);
            
            const cartRef = ref(this.db, cartPath);
            console.log('📡 CartService: Đang gọi Firebase get()...');
            const snapshot = await get(cartRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log('✅ CartService: Dữ liệu giỏ hàng:', data);
                return Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
            }
            console.log('ℹ️ CartService: Giỏ hàng trống');
            return [];
        } catch (error) {
            console.error('❌ CartService.getCartItems error:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            throw error;
        }
    }

    // Lắng nghe thay đổi realtime của giỏ hàng
    onCartChange(userId: string, callback: (items: CartItem[]) => void) {
        const cartRef = ref(this.db, `carts/${userId}`);
        return onValue(cartRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const items = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                callback(items);
            } else {
                callback([]);
            }
        });
    }

    // Thêm sản phẩm vào giỏ hàng
    async addToCart(userId: string, item: Omit<CartItem, 'id' | 'userId'>): Promise<string> {
        try {
            // Kiểm tra xem sản phẩm đã có trong giỏ chưa
            const existingItems = await this.getCartItems(userId);
            const existingItem = existingItems.find(i => i.productId === item.productId);

            if (existingItem) {
                // Nếu đã có, cập nhật số lượng
                await this.updateCartItemQuantity(userId, existingItem.id, existingItem.quantity + item.quantity);
                return existingItem.id;
            } else {
                // Nếu chưa có, thêm mới
                const cartRef = ref(this.db, `carts/${userId}`);
                const newItemRef = push(cartRef);
                await set(newItemRef, {
                    ...item,
                    userId,
                    addedAt: new Date().toISOString()
                });
                return newItemRef.key || '';
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

            const itemRef = ref(this.db, `carts/${userId}/${itemId}`);
            await update(itemRef, { quantity });
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            throw error;
        }
    }

    // Xóa một sản phẩm khỏi giỏ hàng
    async deleteCartItem(userId: string, itemId: string): Promise<void> {
        try {
            const itemRef = ref(this.db, `carts/${userId}/${itemId}`);
            await remove(itemRef);
        } catch (error) {
            console.error('Error deleting cart item:', error);
            throw error;
        }
    }

    // Xóa toàn bộ giỏ hàng
    async clearCart(userId: string): Promise<void> {
        try {
            const cartRef = ref(this.db, `carts/${userId}`);
            await remove(cartRef);
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
