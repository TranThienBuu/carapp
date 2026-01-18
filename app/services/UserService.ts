import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
    imageUrl?: string;
    phone?: string;
}


class UserService {

    // Lấy tất cả users
    async getUsers(): Promise<User[]> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch('https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/users.json?auth=' + idToken);
            if (!res.ok) throw new Error('Permission denied');
            const data = await res.json();
            if (!data) return [];
            return Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }

    // Thêm user mới
    async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<string> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const userData = {
                ...user,
                createdAt: new Date().toISOString(),
            };
            const res = await fetch('https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/users.json?auth=' + idToken, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!res.ok) throw new Error('Permission denied');
            const data = await res.json();
            return data.name; // Firebase trả về key mới ở trường 'name'
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }

    // Cập nhật user
    async updateUser(userId: string, updates: Partial<User>): Promise<void> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}.json?auth=${idToken}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error('Permission denied');
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Xóa user
    async deleteUser(userId: string): Promise<void> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}.json?auth=${idToken}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Permission denied');
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Lấy user theo ID
    async getUserById(userId: string): Promise<User | null> {
        try {
            const idToken = await AsyncStorage.getItem('idToken');
            const res = await fetch(`https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app/users/${userId}.json?auth=${idToken}`);
            if (!res.ok) throw new Error('Permission denied');
            const data = await res.json();
            if (!data) return null;
            return {
                id: userId,
                ...data
            };
        } catch (error) {
            console.error('Error getting user by id:', error);
            throw error;
        }
    }

    // Toggle role user
    async toggleUserRole(userId: string): Promise<void> {
        try {
            const user = await this.getUserById(userId);
            if (user) {
                const newRole = user.role === 'admin' ? 'user' : 'admin';
                await this.updateUser(userId, { role: newRole });
            }
        } catch (error) {
            console.error('Error toggling user role:', error);
            throw error;
        }
    }

    // Lấy thống kê users
    async getUserStatistics() {
        try {
            const users = await this.getUsers();
            return {
                totalUsers: users.length,
                adminUsers: users.filter(u => u.role === 'admin').length,
                regularUsers: users.filter(u => u.role === 'user').length,
            };
        } catch (error) {
            console.error('Error getting user statistics:', error);
            return {
                totalUsers: 0,
                adminUsers: 0,
                regularUsers: 0,
            };
        }
    }
}

export const userService = new UserService();
