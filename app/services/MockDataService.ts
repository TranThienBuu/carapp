// Mock Data Service - Sẽ thay thế bằng Firebase sau
// Giữ cùng interface để dễ dàng chuyển đổi

export interface Product {
    id: string;
    name: string;
    category: string;
    price: string;
    description: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    userId?: string;
    image?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: Date;
}

// Mock data
let mockProducts: Product[] = [
    {
        id: '1',
        name: 'Toyota Camry 2020',
        category: 'Sedan',
        price: '25000',
        description: 'Well maintained sedan, low mileage',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
    },
    {
        id: '2',
        name: 'Honda CR-V 2021',
        category: 'SUV',
        price: '32000',
        description: 'Family SUV, excellent condition',
        status: 'active',
        createdAt: new Date('2024-01-16'),
        image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=400',
    },
    {
        id: '3',
        name: 'BMW 3 Series 2022',
        category: 'Luxury',
        price: '45000',
        description: 'Premium sedan with full options',
        status: 'inactive',
        createdAt: new Date('2024-01-17'),
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
    },
];

let mockUsers: User[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date('2024-01-10'),
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        createdAt: new Date('2024-01-11'),
    },
    {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'user',
        createdAt: new Date('2024-01-12'),
    },
];

// Mock Data Service Class
class MockDataService {
    // ============ PRODUCT METHODS ============
    
    async getProducts(): Promise<Product[]> {
        // Simulate API delay
        await this.delay(500);
        return [...mockProducts];
    }

    async getProductById(id: string): Promise<Product | null> {
        await this.delay(300);
        return mockProducts.find(p => p.id === id) || null;
    }

    async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
        await this.delay(500);
        const newProduct: Product = {
            image: product.image || 'https://via.placeholder.com/400x200?text=No+Image',
            ...product,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        mockProducts.push(newProduct);
        return newProduct;
    }

    async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
        await this.delay(500);
        const index = mockProducts.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Product not found');
        
        mockProducts[index] = { ...mockProducts[index], ...updates };
        return mockProducts[index];
    }

    async deleteProduct(id: string): Promise<void> {
        await this.delay(500);
        mockProducts = mockProducts.filter(p => p.id !== id);
    }

    async toggleProductStatus(id: string): Promise<Product> {
        await this.delay(300);
        const index = mockProducts.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Product not found');
        
        mockProducts[index].status = mockProducts[index].status === 'active' ? 'inactive' : 'active';
        return mockProducts[index];
    }

    // ============ USER METHODS ============

    async getUsers(): Promise<User[]> {
        await this.delay(500);
        return [...mockUsers];
    }

    async getUserById(id: string): Promise<User | null> {
        await this.delay(300);
        return mockUsers.find(u => u.id === id) || null;
    }

    async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
        await this.delay(500);
        const newUser: User = {
            ...user,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        mockUsers.push(newUser);
        return newUser;
    }

    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        await this.delay(500);
        const index = mockUsers.findIndex(u => u.id === id);
        if (index === -1) throw new Error('User not found');
        
        mockUsers[index] = { ...mockUsers[index], ...updates };
        return mockUsers[index];
    }

    async deleteUser(id: string): Promise<void> {
        await this.delay(500);
        mockUsers = mockUsers.filter(u => u.id !== id);
    }

    async toggleUserRole(id: string): Promise<User> {
        await this.delay(300);
        const index = mockUsers.findIndex(u => u.id === id);
        if (index === -1) throw new Error('User not found');
        
        mockUsers[index].role = mockUsers[index].role === 'admin' ? 'user' : 'admin';
        return mockUsers[index];
    }

    // ============ STATISTICS ============

    async getStatistics() {
        await this.delay(300);
        return {
            totalProducts: mockProducts.length,
            activeProducts: mockProducts.filter(p => p.status === 'active').length,
            inactiveProducts: mockProducts.filter(p => p.status === 'inactive').length,
            totalUsers: mockUsers.length,
            adminUsers: mockUsers.filter(u => u.role === 'admin').length,
            regularUsers: mockUsers.filter(u => u.role === 'user').length,
        };
    }

    // Helper method to simulate API delay
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const mockDataService = new MockDataService();

// Khi connect Firebase, bạn sẽ tạo FirebaseDataService với cùng interface
// và chỉ cần thay đổi import trong AdminScreen
