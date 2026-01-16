import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockDataService, Product, User } from '../services/MockDataService';

// TODO: Khi connect Firebase, thay đổi import này:
// import { firebaseDataService as dataService } from '../services/FirebaseDataService';
const dataService = mockDataService;

const AdminScreen = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [statistics, setStatistics] = useState({
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
    });

    const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'users'>('stats');
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        image: '',
        email: '',
        role: 'user' as 'user' | 'admin',
    });

    // Load data on mount
    useEffect(() => {
        loadAllData();
    }, []);

    // Reload data when tab changes
    useEffect(() => {
        if (activeTab === 'products') loadProducts();
        else if (activeTab === 'users') loadUsers();
        else if (activeTab === 'stats') loadStatistics();
    }, [activeTab]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([loadProducts(), loadUsers(), loadStatistics()]);
        } catch (error) {
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await dataService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Load products error:', error);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await dataService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Load users error:', error);
        }
    };

    const loadStatistics = async () => {
        try {
            const stats = await dataService.getStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Load statistics error:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
    };

    // Product Management
    const handleAddProduct = async () => {
        if (!formData.name || !formData.category || !formData.price) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await dataService.addProduct({
                name: formData.name,
                category: formData.category,
                price: formData.price,
                description: formData.description,
                image: formData.image,
                status: 'active',
            });
            await loadProducts();
            await loadStatistics();
            resetForm();
            setModalVisible(false);
            Alert.alert('Success', 'Product added successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = async () => {
        if (!formData.name || !formData.category || !formData.price) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await dataService.updateProduct(currentItem.id, {
                name: formData.name,
                category: formData.category,
                price: formData.price,
                description: formData.description,
                image: formData.image,
            });
            await loadProducts();
            resetForm();
            setModalVisible(false);
            setEditMode(false);
            Alert.alert('Success', 'Product updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = (id: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this product?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await dataService.deleteProduct(id);
                            await loadProducts();
                            await loadStatistics();
                            Alert.alert('Success', 'Product deleted!');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete product');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const toggleProductStatus = async (id: string) => {
        setLoading(true);
        try {
            await dataService.toggleProductStatus(id);
            await loadProducts();
            await loadStatistics();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    // User Management
    const handleDeleteUser = (id: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await dataService.deleteUser(id);
                            await loadUsers();
                            await loadStatistics();
                            Alert.alert('Success', 'User deleted!');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const toggleUserRole = async (id: string) => {
        setLoading(true);
        try {
            await dataService.toggleUserRole(id);
            await loadUsers();
            await loadStatistics();
        } catch (error) {
            Alert.alert('Error', 'Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            price: '',
            description: '',
            image: '',
            email: '',
            role: 'user',
        });
        setCurrentItem(null);
    };

    const openEditModal = (item: Product) => {
        setCurrentItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            price: item.price,
            description: item.description,
            image: item.image || '',
            email: '',
            role: 'user',
        });
        setEditMode(true);
        setModalVisible(true);
    };

    const openAddModal = () => {
        resetForm();
        setEditMode(false);
        setModalVisible(true);
    };

    // Render Statistics Tab
    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.warningBanner}>
                <Ionicons name="flask" size={20} color="#FF9800" />
                <Text style={styles.warningText}>
                    🧪 TEST MODE - Using Mock Data (No Firebase)
                </Text>
            </View>

            <Text style={styles.sectionTitle}>Dashboard Overview</Text>
            
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="cart" size={32} color="white" />
                    <Text style={styles.statNumber}>{statistics.totalProducts}</Text>
                    <Text style={styles.statLabel}>Total Products</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
                    <Ionicons name="checkmark-circle" size={32} color="white" />
                    <Text style={styles.statNumber}>{statistics.activeProducts}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
                    <Ionicons name="people" size={32} color="white" />
                    <Text style={styles.statNumber}>{statistics.totalUsers}</Text>
                    <Text style={styles.statLabel}>Total Users</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: '#9C27B0' }]}>
                    <Ionicons name="shield-checkmark" size={32} color="white" />
                    <Text style={styles.statNumber}>{statistics.adminUsers}</Text>
                    <Text style={styles.statLabel}>Admins</Text>
                </View>
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={24} color="#2196F3" />
                <Text style={styles.infoText}>
                    Đang sử dụng Mock Data để test. Khi connect Firebase thành công, 
                    chỉ cần thay đổi import trong code là dùng được Firebase thật.
                </Text>
            </View>

            <View style={[styles.infoBox, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="code-slash" size={24} color="#FF9800" />
                <Text style={[styles.infoText, { color: '#E65100' }]}>
                    Tips: Data sẽ reset khi reload app. Mọi thao tác thêm/sửa/xóa 
                    đều hoạt động giống như Firebase thật!
                </Text>
            </View>
        </View>
    );

    // Render Products Tab
    const renderProducts = () => (
        <View style={styles.tabContent}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Product Management</Text>
                <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            {products.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="cart-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No products yet</Text>
                    <Text style={styles.emptySubtext}>Tap "Add" to create your first product</Text>
                </View>
            ) : (
                products.map(product => (
                    <View key={product.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>{product.name}</Text>
                                <Text style={styles.cardSubtitle}>{product.category}</Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: product.status === 'active' ? '#4CAF50' : '#9E9E9E' }
                            ]}>
                                <Text style={styles.statusText}>{product.status}</Text>
                            </View>
                        </View>

                        <Text style={styles.cardPrice}>${product.price}</Text>
                        <Text style={styles.cardDescription}>{product.description}</Text>

                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                                onPress={() => openEditModal(product)}
                            >
                                <Ionicons name="pencil" size={16} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                                onPress={() => toggleProductStatus(product.id)}
                            >
                                <Ionicons
                                    name={product.status === 'active' ? 'pause' : 'play'}
                                    size={16}
                                    color="white"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                                onPress={() => handleDeleteProduct(product.id)}
                            >
                                <Ionicons name="trash" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </View>
    );

    // Render Users Tab
    const renderUsers = () => (
        <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>User Management</Text>

            {users.map(user => (
                <View key={user.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>{user.name}</Text>
                            <Text style={styles.cardSubtitle}>{user.email}</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: user.role === 'admin' ? '#9C27B0' : '#607D8B' }
                        ]}>
                            <Text style={styles.statusText}>{user.role}</Text>
                        </View>
                    </View>

                    <View style={styles.cardActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#FF9800', flex: 1 }]}
                            onPress={() => toggleUserRole(user.id)}
                        >
                            <Ionicons name="swap-horizontal" size={16} color="white" />
                            <Text style={styles.actionButtonText}>
                                {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                            onPress={() => handleDeleteUser(user.id)}
                        >
                            <Ionicons name="trash" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
    );

    if (loading && products.length === 0 && users.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6ab04c" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#6ab04c" />
                </View>
            )}

            {/* Header */}
            <View style={styles.topHeader}>
                <Text style={styles.headerTitle}>Admin Panel</Text>
                <Text style={styles.headerSubtitle}>Test Mode - Mock Data</Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
                    onPress={() => setActiveTab('stats')}
                >
                    <Ionicons
                        name="stats-chart"
                        size={24}
                        color={activeTab === 'stats' ? '#6ab04c' : '#999'}
                    />
                    <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
                        Stats
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'products' && styles.activeTab]}
                    onPress={() => setActiveTab('products')}
                >
                    <Ionicons
                        name="cart"
                        size={24}
                        color={activeTab === 'products' ? '#6ab04c' : '#999'}
                    />
                    <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
                        Products
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && styles.activeTab]}
                    onPress={() => setActiveTab('users')}
                >
                    <Ionicons
                        name="people"
                        size={24}
                        color={activeTab === 'users' ? '#6ab04c' : '#999'}
                    />
                    <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
                        Users
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {activeTab === 'stats' && renderStats()}
                {activeTab === 'products' && renderProducts()}
                {activeTab === 'users' && renderUsers()}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editMode ? 'Edit Product' : 'Add New Product'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <Text style={styles.inputLabel}>Product Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter product name"
                                value={formData.name}
                                onChangeText={text => setFormData({ ...formData, name: text })}
                            />

                            <Text style={styles.inputLabel}>Category *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Sedan, SUV, Luxury"
                                value={formData.category}
                                onChangeText={text => setFormData({ ...formData, category: text })}
                            />

                            <Text style={styles.inputLabel}>Price (USD) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 25000"
                                value={formData.price}
                                onChangeText={text => setFormData({ ...formData, price: text })}
                                keyboardType="numeric"
                            />

                            <Text style={styles.inputLabel}>Image URL</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://example.com/image.jpg"
                                value={formData.image}
                                onChangeText={text => setFormData({ ...formData, image: text })}
                            />

                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter product description"
                                value={formData.description}
                                onChangeText={text => setFormData({ ...formData, description: text })}
                                multiline
                                numberOfLines={4}
                            />

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={editMode ? handleEditProduct : handleAddProduct}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {editMode ? 'Update Product' : 'Add Product'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    topHeader: {
        backgroundColor: '#6ab04c',
        padding: 20,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    warningBanner: {
        flexDirection: 'row',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    warningText: {
        marginLeft: 10,
        color: '#E65100',
        fontWeight: '600',
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 15,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#6ab04c',
    },
    tabText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    activeTabText: {
        color: '#6ab04c',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 15,
    },
    statsContainer: {
        padding: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginVertical: 10,
    },
    statLabel: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
        color: '#1976D2',
        fontSize: 13,
        lineHeight: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#6ab04c',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        marginLeft: 5,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 15,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 5,
    },
    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    cardPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6ab04c',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        marginHorizontal: 4,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#6ab04c',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AdminScreen;
