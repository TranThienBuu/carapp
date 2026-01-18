# 🔧 FIX LỖI: Permission Denied

## ⚠️ QUAN TRỌNG - Làm ngay 2 bước này:

### 📝 BƯỚC 1: Deploy Firebase Rules (BẮT BUỘC)

1. **Mở link này**: 
   👉 https://console.firebase.google.com/u/0/project/carapp-eb690/database/carapp-eb690-default-rtdb/rules

2. **XÓA HẾT rules cũ và PASTE code này vào:**

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

3. **Click nút PUBLISH màu xanh** ở góc phải trên

4. ✅ **Xác nhận** thấy thông báo "Rules published successfully"

---

### 🔍 BƯỚC 2: Kiểm tra Logs

Sau khi deploy rules xong, làm theo:

1. **Restart app trong terminal:**
   - Nhấn `Ctrl+C` để dừng Expo
   - Chạy lại: `npx expo start -c`

2. **Mở app và vào màn hình Giỏ hàng**

3. **Xem logs trong terminal, tìm những dòng này:**
   ```
   🔍 CartScreen - User object: { ... }
   🔍 CartScreen - User ID: abc123...
   ✅ User ID tồn tại, đang load giỏ hàng...
   🔍 CartService.getCartItems - userId: abc123...
   🔍 CartService.getCartItems - path: carts/abc123...
   📡 CartService: Đang gọi Firebase get()...
   ```

4. **Kiểm tra kết quả:**
   - ✅ Nếu thấy: `✅ CartService: Dữ liệu giỏ hàng:` hoặc `ℹ️ CartService: Giỏ hàng trống` → **THÀNH CÔNG!**
   - ❌ Nếu vẫn thấy: `❌ Permission denied` → **Làm BƯỚC 3 bên dưới**

---

### 🔒 BƯỚC 3: Nếu vẫn lỗi - Kiểm tra Authentication

Nếu sau khi deploy rules vẫn lỗi, có thể user chưa được xác thực với Firebase:

**Kiểm tra:**
1. Xem log có dòng `🔍 CartScreen - User ID: ???`
2. Nếu User ID là **null/undefined** → User chưa đăng nhập
3. Nếu User ID có giá trị nhưng vẫn lỗi → Firebase Auth chưa được setup

**Giải pháp tạm:**
Dùng rules test mode (CHỈ khi dev):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
⚠️ **CẢNH BÁO**: Rules này KHÔNG an toàn, chỉ dùng để test!

---

## 📋 Checklist

- [ ] Đã mở Firebase Console
- [ ] Đã paste rules mới
- [ ] Đã click PUBLISH
- [ ] Đã thấy "Rules published successfully"
- [ ] Đã restart app (`Ctrl+C` → `npx expo start -c`)
- [ ] Đã test thêm sản phẩm vào giỏ hàng
- [ ] Đã kiểm tra logs trong terminal

---

## ❓ Vẫn lỗi?

Copy **TOÀN BỘ logs** từ terminal (từ dòng "🔍 CartScreen" đến "❌ Error") và gửi cho tôi để debug tiếp!
