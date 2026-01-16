import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { mockDataService } from '../services/MockDataService';

interface PaymentScreenProps {
  route?: any;
  navigation?: any;
}

export default function PaymentScreen({ route, navigation }: PaymentScreenProps) {
  const [showGateway, setShowGateway] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Lấy thông tin từ route params hoặc dùng giá trị mặc định
  const amount = route?.params?.amount || 100000;
  const productTitle = route?.params?.productTitle || 'Đơn hàng';
  const orderId = route?.params?.orderId || `DH${new Date().getTime()}`;
  const orderData = route?.params?.orderData || {};

  // QUAN TRỌNG: Thay đổi IP này thành IP máy tính chạy Spring Boot của bạn
  // Nếu dùng emulator Android: http://10.0.2.2:8080
  // Nếu dùng điện thoại thật: http://192.168.x.x:8080 (IP LAN của máy)
  const BACKEND_URL = 'http://10.0.2.2:8080';
  
  // CHẾ ĐỘ DEMO: Bật để test không cần backend - TẠO URL VNPAY TRỰC TIẾP
  const DEMO_MODE = true; // Đổi thành false khi có Spring Boot backend
  
  // VNPay Config (Sandbox)
  // Dùng tài khoản của bạn
  const vnp_TmnCode = 'V5G6FBYC';
  const vnp_HashSecret = 'NZMPMWYXWH1RMV5NOWA2CT785EF7PQQ6';
  
  const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const vnp_ReturnUrl = 'http://localhost:8080/project/vnpay-ipn'; // Đổi để giống Java

  // Hàm encode giống URLEncoder.encode của Java (application/x-www-form-urlencoded)
  const urlEncodeJava = (str: string): string => {
    return encodeURIComponent(str)
      .replace(/%20/g, '+')      // Space thành +
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/~/g, '%7E');
  };

  // Tạo URL VNPay trực tiếp (không cần backend)
  const createVNPayUrl = () => {
    // ✅ Chỉ dùng giá trị thật từ đơn hàng
    const orderId = `${new Date().getTime()}`;
    const vnp_Amount = Math.floor(amount * 100);
    
    // Lấy thời gian hiện tại theo GMT+7 (Việt Nam)
    const now = new Date();
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Thêm 7 giờ
    
    const vnp_CreateDate = 
      vnTime.getUTCFullYear().toString() +
      ('0' + (vnTime.getUTCMonth() + 1)).slice(-2) +
      ('0' + vnTime.getUTCDate()).slice(-2) +
      ('0' + vnTime.getUTCHours()).slice(-2) +
      ('0' + vnTime.getUTCMinutes()).slice(-2) +
      ('0' + vnTime.getUTCSeconds()).slice(-2);
    
    // Thời gian hết hạn: 60 phút (1 giờ)
    const expireTime = new Date(vnTime.getTime() + 60 * 60 * 1000);
    const vnp_ExpireDate = 
      expireTime.getUTCFullYear().toString() +
      ('0' + (expireTime.getUTCMonth() + 1)).slice(-2) +
      ('0' + expireTime.getUTCDate()).slice(-2) +
      ('0' + expireTime.getUTCHours()).slice(-2) +
      ('0' + expireTime.getUTCMinutes()).slice(-2) +
      ('0' + expireTime.getUTCSeconds()).slice(-2);
    
    console.log('💰 Original amount:', amount);
    console.log('💵 VNPay amount (x100):', vnp_Amount);
    console.log('🕒 CreateDate (GMT+7):', vnp_CreateDate);
    console.log('⏰ ExpireDate (GMT+7):', vnp_ExpireDate);
    console.log('📦 OrderId:', orderId);

    const vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnp_TmnCode,
      vnp_Amount: vnp_Amount.toString(),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang:${orderId}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: '0:0:0:0:0:0:0:1',
      vnp_CreateDate: vnp_CreateDate,
      vnp_ExpireDate: vnp_ExpireDate
    };

    // Log parameters giống Java
    console.log('------------VNPay Request Parameters------------');
    console.log('vnp_CurrCode:', vnp_Params.vnp_CurrCode);
    console.log('vnp_OrderType:', vnp_Params.vnp_OrderType);
    console.log('vnp_ReturnUrl:', vnp_Params.vnp_ReturnUrl);
    console.log('vnp_TmnCode:', vnp_Params.vnp_TmnCode);
    console.log('vnp_TxnRef:', vnp_Params.vnp_TxnRef);
    console.log('vnp_OrderInfo:', vnp_Params.vnp_OrderInfo);
    console.log('vnp_Amount:', vnp_Params.vnp_Amount);
    console.log('vnp_IpAddr:', vnp_Params.vnp_IpAddr);
    console.log('vnp_Locale:', vnp_Params.vnp_Locale);
    console.log('vnp_Command:', vnp_Params.vnp_Command);
    console.log('vnp_ExpireDate:', vnp_Params.vnp_ExpireDate);
    console.log('vnp_CreateDate:', vnp_Params.vnp_CreateDate);
    console.log('vnp_Version:', vnp_Params.vnp_Version);
    console.log('------------------------------------------------');

    // Sắp xếp params theo alphabet
    const sortedKeys = Object.keys(vnp_Params).sort();
    
    // Tạo hashData và query theo đúng cách của VNPay (Java code)
    const hashDataParts: string[] = [];
    const queryParts: string[] = [];
    
    sortedKeys.forEach((key, index) => {
      const value = vnp_Params[key];
      if (value !== null && value !== undefined && value !== '') {
        // hashData: PHẢI encode value giống URLEncoder.encode của Java
        const encodedValue = urlEncodeJava(value);
        hashDataParts.push(`${key}=${encodedValue}`);
        
        // query: encode cả key và value giống Java
        const encodedKey = urlEncodeJava(key);
        queryParts.push(`${encodedKey}=${encodedValue}`);
      }
    });

    // Tạo chuỗi hash data
    const signData = hashDataParts.join('&');
    
    console.log('📝 Hash Data (trước khi hash):');
    console.log(signData);
    console.log('🔑 Hash Secret:', vnp_HashSecret);
    
    // Tạo chữ ký HMAC SHA512 - Đảm bảo dùng UTF-8 giống Java
    const hmac = CryptoJS.HmacSHA512(signData, vnp_HashSecret);
    const vnp_SecureHash = hmac.toString(CryptoJS.enc.Hex);

    // Tạo URL cuối cùng
    const finalUrl = `${vnp_Url}?${queryParts.join('&')}&vnp_SecureHash=${vnp_SecureHash}`;
    
    // Log URL giống Java
    console.log('VNPay Payment URL:', finalUrl);
    console.log('vnp_SecureHash:', vnp_SecureHash);
    console.log('� Expected hash: 6c6aa59cf65b4f4fe89ea53eae633288dbf159f59aa195be45c8e6ebf23295bea687fc63df1596899089207f097a26a66f52676a06523c98001fee32173fbc22');
    console.log('================================================');
    
    return finalUrl;
  };

  // 1. Hàm gọi API Spring Boot để tạo URL thanh toán
  const handlePayment = async () => {
    setLoading(true);
    try {
      // NẾU BẬT DEMO MODE - Tạo URL VNPay trực tiếp
      if (DEMO_MODE) {
        const vnpayUrl = createVNPayUrl();
        setPaymentUrl(vnpayUrl);
        setShowGateway(true);
        setLoading(false);
        return;
      }
      
      // NẾU TẮT DEMO MODE - Gọi API Spring Boot thật
      const orderId = `DH${new Date().getTime()}`;
      const response = await axios.get(
        `${BACKEND_URL}/api/payment/create_payment`,
        {
          params: {
            amount: amount,
            orderId: orderId
          }
        }
      );
      
      if (response.data.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl);
        setShowGateway(true);
      } else {
        Alert.alert('Lỗi', 'Không nhận được URL thanh toán');
      }
    } catch (error: any) {
      console.error('Lỗi gọi API:', error);
      Alert.alert(
        'Lỗi kết nối Backend', 
        'Không thể kết nối đến Spring Boot server.\n\nĐể sửa:\n1. Đảm bảo Spring Boot đang chạy (port 8080)\n2. Kiểm tra IP trong BACKEND_URL\n3. Hoặc bật DEMO_MODE = true để test'
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm lưu/cập nhật đơn hàng trong mock data
  const updateOrderStatus = async (status: 'paid' | 'pending') => {
    try {
      // Tìm đơn hàng theo orderId và cập nhật trạng thái
      const orders = await mockDataService.getOrders();
      const order = orders.find(o => o.orderId === orderId);
      
      if (order) {
        await mockDataService.updateOrderStatus(order.id, status);
        console.log(`✅ Đã cập nhật trạng thái đơn hàng ${orderId} thành ${status}`);
        
        // Xóa giỏ hàng sau khi thanh toán thành công
        if (status === 'paid') {
          await mockDataService.clearCart();
        }
      }
    } catch (error) {
      console.error('❌ Lỗi cập nhật đơn hàng:', error);
      // Không throw error để không block flow thanh toán
    }
  };

  // 2. Hàm xử lý khi URL thay đổi trong WebView
  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;

    // Kiểm tra nếu URL trả về chứa returnUrl từ backend
    if (url.includes('/payment-result') || url.includes('vnpay-ipn')) {
      // Đóng WebView ngay lập tức
      setShowGateway(false);

      // Phân tích kết quả từ URL (ResponseCode = 00 là thành công)
      if (url.includes('vnp_ResponseCode=00')) {
        // Cập nhật trạng thái đơn hàng thành 'paid'
        await updateOrderStatus('paid');
        
        Alert.alert(
          'Thanh toán thành công!', 
          'Giao dịch đã hoàn tất và đơn hàng đã được lưu.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Quay về màn hình trước hoặc Home
                if (navigation) {
                  navigation.goBack();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Thanh toán thất bại', 
          'Giao dịch bị hủy hoặc lỗi.',
          [
            {
              text: 'Đóng',
              onPress: () => {
                if (navigation) {
                  navigation.goBack();
                }
              }
            }
          ]
        );
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-5 bg-green-600">
        <Text className="text-white text-[24px] font-bold">Thanh toán</Text>
      </View>

      {/* Thông tin đơn hàng */}
      <View className="p-5">
        <View className="bg-gray-50 p-4 rounded-lg mb-5">
          <Text className="text-[16px] text-gray-600 mb-2">Sản phẩm</Text>
          <Text className="text-[20px] font-bold mb-4">{productTitle}</Text>
          
          <View className="flex-row justify-between items-center border-t border-gray-200 pt-3">
            <Text className="text-[18px] font-semibold">Tổng tiền:</Text>
            <Text className="text-[24px] font-bold text-green-600">
              {amount.toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>

        {/* Hướng dẫn */}
        <View className="bg-blue-50 p-4 rounded-lg mb-5">
          <Text className="text-[14px] text-blue-800 font-semibold mb-2">
            📌 Thông tin test VNPay Sandbox:
          </Text>
          <Text className="text-[12px] text-blue-700">
            • Số thẻ: 9704198526191432198{'\n'}
            • Tên chủ thẻ: NGUYEN VAN A{'\n'}
            • Ngày phát hành: 07/15{'\n'}
            • Mật khẩu OTP: 123456
          </Text>
        </View>

        {/* Nút thanh toán */}
        <TouchableOpacity
          className="bg-green-600 p-4 rounded-lg items-center"
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-[18px] font-bold">
              Thanh toán ngay
            </Text>
          )}
        </TouchableOpacity>

        {/* Nút quay lại */}
        {navigation && (
          <TouchableOpacity
            className="mt-3 p-4 items-center"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-gray-600 text-[16px]">Quay lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal WebView - Cổng thanh toán VNPay */}
      <Modal
        visible={showGateway}
        onRequestClose={() => setShowGateway(false)}
        animationType="slide"
      >
        <View className="flex-1">
          {/* Header modal */}
          <View className="bg-green-600 p-4 flex-row justify-between items-center">
            <Text className="text-white text-[18px] font-bold">
              Cổng thanh toán VNPay
            </Text>
            <TouchableOpacity onPress={() => setShowGateway(false)}>
              <Text className="text-white text-[16px]">✕ Đóng</Text>
            </TouchableOpacity>
          </View>

          {/* WebView */}
          <WebView
            source={{ uri: paymentUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#16a34a" />
                <Text className="mt-3 text-gray-600">Đang tải...</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
