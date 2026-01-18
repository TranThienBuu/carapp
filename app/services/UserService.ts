import { getDatabase, ref, push, set, get, update, remove } from 'firebase/database';
import { app } from '../../firebase.config';

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
    private db = getDatabase(app);

    // Lấy tất cả users
    async getUsers(): Promise<User[]> {
        try {
            const usersRef = ref(this.db, 'users');
            const snapshot = await get(usersRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                return Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
            }
            return [];
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }

    // Thêm user mới
    async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<string> {
        try {
            const usersRef = ref(this.db, 'users');
            const newUserRef = push(usersRef);
            
            const userData = {
                ...user,
                createdAt: new Date().toISOString(),
            };

            await set(newUserRef, userData);
            return newUserRef.key || '';
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }

    // Cập nhật user
    async updateUser(userId: string, updates: Partial<User>): Promise<void> {
        try {
            const userRef = ref(this.db, `users/${userId}`);
            await update(userRef, updates);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Xóa user
    async deleteUser(userId: string): Promise<void> {
        try {
            const userRef = ref(this.db, `users/${userId}`);
            await remove(userRef);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Lấy user theo ID
    async getUserById(userId: string): Promise<User | null> {
        try {
            const userRef = ref(this.db, `users/${userId}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                return {
                    id: userId,
                    ...snapshot.val()
                };
            }
            return null;
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
