
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUser } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../services/CartService';
import { orderService } from '../services/OrderService';
import { cartService } from '../services/CartService';

interface RouteParams {
    cartItems?: CartItem[];
    totalAmount?: number;
}

export default function CheckoutScreen() {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { user } = useUser();
    
    const params = route.params as RouteParams;
    const { cartItems = [], totalAmount = 0 } = params || {};
    
    const [name, setName] = useState(user?.fullName || '');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [shippingFee, setShippingFee] = useState(30000);
    const [loading, setLoading] = useState(false);
    
    const finalTotal = totalAmount + shippingFee;

    // Thanh toán trực tiếp (COD)
    const handleCashPayment = async () => {
        if (!validateForm()) return;
        if (!user?.id) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt hàng');
            return;
        }
        
        setLoading(true);
        try {
            const orderId = `DH${new Date().getTime()}`;
            const orderData = {
                orderId,
                userId: user.id,
                userName: name,
                userEmail: user?.primaryEmailAddress?.emailAddress || '',
                phone,
                address,
                items: cartItems,
                subtotal: totalAmount,
                shippingFee,
                total: finalTotal,
                paymentMethod: 'COD' as const,
                status: 'pending' as const,
            };

            // Lưu đơn hàng vào Firebase Realtime Database
            await orderService.createOrder(orderData);

            // Xóa giỏ hàng sau khi đặt hàng thành công
            await cartService.clearCart(user.id);
            
            Alert.alert(
                '✅ Đặt hàng thành công!',
                `Đơn hàng của bạn đã được ghi nhận.\n\nThông tin:\n- Mã đơn hàng: ${orderId}\n- Người nhận: ${name}\n- SĐT: ${phone}\n- Tổng tiền: ${finalTotal.toLocaleString('vi-VN')}đ\n\nVui lòng chuẩn bị tiền mặt khi nhận hàng.`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('home')
                    }
                ]
            );
        } catch (error) {
            console.error('Lỗi:', error);
            Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Thanh toán online VNPay
    const handleOnlinePayment = async () => {
        if (!validateForm()) return;
        if (!user?.id) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt hàng');
            return;
        }
        
        setLoading(true);
        try {
            const orderId = `DH${new Date().getTime()}`;
            const orderData = {
                orderId,
                userId: user.id,
                userName: name,
                userEmail: user?.primaryEmailAddress?.emailAddress || '',
                phone,
                address,
                items: cartItems,
                subtotal: totalAmount,
                shippingFee,
                total: finalTotal,
                paymentMethod: 'VNPay' as const,
                status: 'pending' as const,
            };

            // Lưu đơn hàng vào Firebase Realtime Database
            await orderService.createOrder(orderData);
            
            // Chuyển sang màn hình thanh toán VNPay
            navigation.navigate('payment', {
                amount: finalTotal,
                productTitle: `Đơn hàng ${orderId.substring(0, 10)}`,
                orderId: orderId,
                orderData: orderData
            });
        } catch (error) {
            console.error('Lỗi:', error);
            Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên');
            return false;
        }
        if (!phone.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại');
            return false;
        }
        if (phone.length < 10) {
            Alert.alert('Số điện thoại không hợp lệ', 'Vui lòng nhập đúng số điện thoại');
            return false;
        }
        if (!address.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ giao hàng');
            return false;
        }
        return true;
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-green-600 p-4 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-[20px] font-bold">Thanh toán</Text>
            </View>

            <ScrollView className="flex-1">
                {/* Thông tin giao hàng */}
                <View className="bg-white m-3 p-4 rounded-lg shadow-sm border border-gray-200">
                    <Text className="text-[18px] font-bold mb-3 text-gray-800">📍 Thông tin giao hàng</Text>
                    
                    <Text className="text-gray-700 mb-1">Họ tên người nhận *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-3 text-[16px]"
                        placeholder="Nhập họ tên"
                        value={name}
                        onChangeText={setName}
                    />
                    
                    <Text className="text-gray-700 mb-1">Số điện thoại *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-3 text-[16px]"
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        maxLength={11}
                    />
                    
                    <Text className="text-gray-700 mb-1">Địa chỉ giao hàng *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 text-[16px]"
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Thông tin đơn hàng */}
                <View className="bg-white m-3 p-4 rounded-lg shadow-sm border border-gray-200">
                    <Text className="text-[18px] font-bold mb-3 text-gray-800">🛒 Chi tiết đơn hàng</Text>
                    
                    {cartItems.map((item, index) => (
                        <View key={index} className="flex-row justify-between mb-2 pb-2 border-b border-gray-100">
                            <View className="flex-1">
                                <Text className="text-gray-800">{item.name}</Text>
                                <Text className="text-gray-500 text-[12px]">SL: {item.quantity}</Text>
                            </View>
                            <Text className="text-gray-800 font-semibold">
                                {((item.price * item.quantity) || 0).toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    ))}
                    
                    <View className="border-t border-gray-300 mt-3 pt-3">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Tạm tính:</Text>
                            <Text className="text-gray-800">{totalAmount.toLocaleString('vi-VN')}đ</Text>
                        </View>
                        
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Phí vận chuyển:</Text>
                            <Text className="text-gray-800">{shippingFee.toLocaleString('vi-VN')}đ</Text>
                        </View>
                        
                        <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-300">
                            <Text className="text-[18px] font-bold text-gray-800">Tổng cộng:</Text>
                            <Text className="text-[20px] font-bold text-green-600">
                                {finalTotal.toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Phương thức thanh toán */}
                <View className="bg-white m-3 p-4 rounded-lg shadow-sm border border-gray-200">
                    <Text className="text-[18px] font-bold mb-3 text-gray-800">💳 Phương thức thanh toán</Text>
                    
                    {/* Thanh toán Online */}
                    <TouchableOpacity
                        className="bg-green-600 p-4 rounded-lg mb-3 flex-row items-center justify-center"
                        onPress={handleOnlinePayment}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="card" size={24} color="white" />
                                <Text className="text-white text-[16px] font-bold ml-2">
                                    Thanh toán Online (VNPay)
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                    
                    {/* Thanh toán khi nhận hàng */}
                    <TouchableOpacity
                        className="bg-orange-500 p-4 rounded-lg flex-row items-center justify-center"
                        onPress={handleCashPayment}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="cash" size={24} color="white" />
                                <Text className="text-white text-[16px] font-bold ml-2">
                                    Thanh toán khi nhận hàng (COD)
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="h-5" />
            </ScrollView>
        </View>
    );
}
