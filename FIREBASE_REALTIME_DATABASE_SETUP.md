# Hướng dẫn Tích hợp Firebase Realtime Database cho Giỏ hàng & Đơn hàng

## ✅ Đã hoàn thành

### 1. Cấu hình Firebase
- ✅ Đã thêm `databaseURL` vào [firebase.config.js](firebase.config.js)
- URL: `https://carapp-eb690-default-rtdb.asia-southeast1.firebasedatabase.app`

### 2. Services mới
- ✅ **CartService** ([app/services/CartService.ts](app/services/CartService.ts))
  - Thêm/xóa/cập nhật sản phẩm trong giỏ hàng
  - Lắng nghe thay đổi realtime
  - Tính tổng tiền giỏ hàng
  
- ✅ **OrderService** ([app/services/OrderService.ts](app/services/OrderService.ts))
  - Tạo đơn hàng mới
  - Lấy danh sách đơn hàng của user
  - Cập nhật trạng thái đơn hàng
  - Hủy đơn hàng
  - Thống kê đơn hàng

### 3. Screens đã cập nhật
- ✅ **CartScreen** - Sử dụng Firebase thay vì mockdata
  - Realtime updates khi giỏ hàng thay đổi
  - Yêu cầu đăng nhập
  
- ✅ **CheckoutScreen** - Lưu đơn hàng lên Firebase
  - Thanh toán COD
  - Thanh toán Online (VNPay)
  
- ✅ **OrdersScreen** - Xem & hủy đơn hàng
  - Hiển thị danh sách đơn hàng
  - Chức năng hủy đơn (với đơn pending)
  
- ✅ **ProductDetail** - Thêm vào giỏ hàng
  - Yêu cầu đăng nhập
  - Lưu vào Firebase Realtime Database

### 4. Database Rules
- ✅ Tạo file [database.rules.json](database.rules.json)

## 🚀 Các bước triển khai

### Bước 1: Deploy Database Rules lên Firebase

1. Mở Firebase Console: https://console.firebase.google.com
2. Chọn project **carapp-eb690**
3. Vào **Realtime Database** → **Rules**
4. Copy nội dung từ file [database.rules.json](database.rules.json) và paste vào editor
5. Click **Publish** để áp dụng rules

Hoặc dùng Firebase CLI:
```bash
firebase deploy --only database
```

### Bước 2: Cấu trúc dữ liệu trên Firebase

Dữ liệu sẽ được lưu theo cấu trúc:

```
carapp-eb690-default-rtdb/
├── carts/
│   └── {userId}/
│       └── {cartItemId}/
│           ├── productId
│           ├── name
│           ├── price
│           ├── quantity
│           ├── image
│           ├── description
│           └── addedAt
│
├── orders/
│   └── {orderId}/
│       ├── orderId (DH...)
│       ├── userId
│       ├── userName
│       ├── userEmail
│       ├── phone
│       ├── address
│       ├── items[]
│       ├── subtotal
│       ├── shippingFee
│       ├── total
│       ├── paymentMethod
│       ├── status
│       ├── createdAt
│       └── updatedAt
│
└── userOrders/
    └── {userId}/
        └── {orderId}/
            ├── orderId
            ├── total
            ├── status
            └── createdAt
```

### Bước 3: Cài đặt dependencies (nếu chưa có)

```bash
npm install firebase
# hoặc
yarn add firebase
```

### Bước 4: Test ứng dụng

1. **Khởi động app:**
```bash
npx expo start -c
```

2. **Test flow đầy đủ:**
   - Đăng nhập
   - Xem sản phẩm
   - Thêm vào giỏ hàng → Kiểm tra data trên Firebase Console
   - Xem giỏ hàng
   - Thay đổi số lượng
   - Checkout → Tạo đơn hàng
   - Xem danh sách đơn hàng
   - Hủy đơn hàng (nếu là pending)

### Bước 5: Kiểm tra trên Firebase Console

1. Mở Firebase Console → Realtime Database → Data
2. Bạn sẽ thấy:
   - `carts/{userId}` - Giỏ hàng của từng user
   - `orders/{orderId}` - Chi tiết đơn hàng
   - `userOrders/{userId}` - Index nhanh đơn hàng theo user

## 📊 Tính năng chính

### Giỏ hàng
- ✅ Thêm sản phẩm vào giỏ
- ✅ Cập nhật số lượng realtime
- ✅ Xóa sản phẩm
- ✅ Tính tổng tiền tự động
- ✅ Lắng nghe thay đổi realtime (multi-device sync)

### Đơn hàng
- ✅ Tạo đơn hàng với COD hoặc VNPay
- ✅ Lưu thông tin người nhận
- ✅ Xem lịch sử đơn hàng
- ✅ Hủy đơn hàng (pending only)
- ✅ Trạng thái đơn hàng: pending, paid, processing, shipping, completed, cancelled

## 🔒 Bảo mật (Database Rules)

- User chỉ đọc/ghi giỏ hàng của chính họ
- User chỉ đọc/ghi đơn hàng của chính họ
- Admin có thể đọc/ghi tất cả đơn hàng
- Yêu cầu authentication cho mọi thao tác

## 📝 Lưu ý quan trọng

1. **Authentication**: User phải đăng nhập mới sử dụng được giỏ hàng & đơn hàng
2. **Realtime Updates**: Giỏ hàng tự động đồng bộ giữa các thiết bị
3. **MockDataService**: Không còn sử dụng nữa, đã chuyển sang Firebase
4. **Database Rules**: Nhớ deploy rules lên Firebase để bảo mật

## 🐛 Xử lý lỗi phổ biến

### Lỗi: "Permission denied"
- Kiểm tra xem đã deploy database rules chưa
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra `user.id` có đúng không

### Lỗi: "Cannot read property of undefined"
- Kiểm tra user đã đăng nhập
- Kiểm tra data structure trên Firebase

### Lỗi: "Network error"
- Kiểm tra kết nối internet
- Kiểm tra Firebase config có đúng không
- Kiểm tra databaseURL có trong firebase.config.js

## 🎯 Tối ưu hóa

### Performance
- Sử dụng `onValue` listener chỉ khi cần realtime
- Unsubscribe listeners khi component unmount
- Index data theo userId để query nhanh

### Security
- Validate input trước khi lưu
- Giới hạn số lượng sản phẩm trong giỏ
- Kiểm tra giá trị thanh toán ở server-side (nếu có)

## 📱 Screenshots checklist

Test các màn hình sau:
- [ ] Thêm sản phẩm vào giỏ hàng
- [ ] Xem giỏ hàng (realtime update)
- [ ] Checkout với COD
- [ ] Checkout với VNPay
- [ ] Xem danh sách đơn hàng
- [ ] Hủy đơn hàng
- [ ] Kiểm tra data trên Firebase Console

## 🔗 Tài liệu tham khảo

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Security Rules](https://firebase.google.com/docs/database/security)
- [React Native Firebase](https://rnfirebase.io/)

---

**✨ Hoàn thành!** Giờ bạn đã có hệ thống giỏ hàng & đơn hàng thật với Firebase Realtime Database.
