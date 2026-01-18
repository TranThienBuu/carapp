import { getDatabase, ref, push, set, get, update, remove, query, orderByChild } from 'firebase/database';
import { app } from '../../firebase.config';

export interface Product {
    id: string;
    name: string;
    category: string;
    price: string;
    description: string;
    status: 'active' | 'inactive';
    createdAt: string;
    userId?: string;
    image?: string;
}

class ProductService {
    private db = getDatabase(app);

    // Lấy tất cả sản phẩm
    async getProducts(): Promise<Product[]> {
        try {
            const productsRef = ref(this.db, 'products');
            const snapshot = await get(productsRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                return Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
            }
            return [];
        } catch (error) {
            console.error('Error getting products:', error);
            throw error;
        }
    }

    // Thêm sản phẩm mới
    async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
        try {
            const productsRef = ref(this.db, 'products');
            const newProductRef = push(productsRef);
            
            const productData = {
                ...product,
                createdAt: new Date().toISOString(),
            };

            await set(newProductRef, productData);
            return newProductRef.key || '';
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    // Cập nhật sản phẩm
    async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
        try {
            const productRef = ref(this.db, `products/${productId}`);
            await update(productRef, updates);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    // Xóa sản phẩm
    async deleteProduct(productId: string): Promise<void> {
        try {
            const productRef = ref(this.db, `products/${productId}`);
            await remove(productRef);
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    // Lấy sản phẩm theo ID
    async getProductById(productId: string): Promise<Product | null> {
        try {
            const productRef = ref(this.db, `products/${productId}`);
            const snapshot = await get(productRef);
            
            if (snapshot.exists()) {
                return {
                    id: productId,
                    ...snapshot.val()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting product by id:', error);
            throw error;
        }
    }

    // Toggle trạng thái sản phẩm
    async toggleProductStatus(productId: string): Promise<void> {
        try {
            const product = await this.getProductById(productId);
            if (product) {
                const newStatus = product.status === 'active' ? 'inactive' : 'active';
                await this.updateProduct(productId, { status: newStatus });
            }
        } catch (error) {
            console.error('Error toggling product status:', error);
            throw error;
        }
    }

    // Lấy thống kê sản phẩm
    async getProductStatistics() {
        try {
            const products = await this.getProducts();
            return {
                totalProducts: products.length,
                activeProducts: products.filter(p => p.status === 'active').length,
                inactiveProducts: products.filter(p => p.status === 'inactive').length,
            };
        } catch (error) {
            console.error('Error getting product statistics:', error);
            return {
                totalProducts: 0,
                activeProducts: 0,
                inactiveProducts: 0,
            };
        }
    }
}

export const productService = new ProductService();
