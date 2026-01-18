import AsyncStorage from '@react-native-async-storage/async-storage';

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
    // Lấy tất cả sản phẩm
    async getProducts(): Promise<Product[]> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch('https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/products.json?auth=' + idToken);
            if (!res.ok) throw new Error('Permission denied');
            const data = await res.json();
            if (!data) return [];
            return Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
        } catch (error) {
            console.error('Error getting products:', error);
            throw error;
        }
    }

    // Thêm sản phẩm mới
    async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const productData = {
                ...product,
                createdAt: new Date().toISOString(),
            };
            const res = await fetch('https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/products.json?auth=' + idToken, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });
            if (!res.ok) throw new Error('Permission denied');
            const data = await res.json();
            return data.name; // Firebase trả về key mới ở trường 'name'
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    // Cập nhật sản phẩm
    async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/products/${productId}.json?auth=${idToken}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error('Permission denied');
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    // Xóa sản phẩm
    async deleteProduct(productId: string): Promise<void> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/products/${productId}.json?auth=${idToken}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Permission denied');
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    // Lấy sản phẩm theo ID
    async getProductById(productId: string): Promise<Product | null> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/products/${productId}.json?auth=${idToken}`);
            if (!res.ok) throw new Error('Permission denied');
            const data = await res.json();
            if (!data) return null;
            return {
                id: productId,
                ...data
            };
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
