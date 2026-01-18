# 🔥 Setup Firebase Anonymous Authentication

## ✅ Đã sửa code
- [app/context/AuthContext.tsx](app/context/AuthContext.tsx) - Thêm Firebase Anonymous Auth cho demo login

## 🚀 BẠN CẦN LÀM (2 phút):

### BƯỚC 1: Bật Anonymous Auth trên Firebase

1. **Mở link này:**
   👉 https://console.firebase.google.com/u/0/project/carapp-eb690/authentication/providers

2. **Tìm "Anonymous" trong danh sách**

3. **Click vào "Anonymous"**

4. **Toggle switch để BẬT** (Enable)

5. **Click "Save"**

---

### BƯỚC 2: Deploy Database Rules mới

1. **Mở link này:**
   👉 https://console.firebase.google.com/u/0/project/carapp-eb690/database/carapp-eb690-default-rtdb/rules

2. **Paste rules này và PUBLISH:**

```json
{
  "rules": {
    "carts": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "userOrders": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "products": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

### BƯỚC 3: Test lại

1. **Restart app:**
   ```bash
   # Terminal đang chạy Expo, nhấn Ctrl+C
   npx expo start -c
   ```

2. **Đăng xuất và đăng nhập lại với Demo User**

3. **Thử thêm sản phẩm vào giỏ hàng**

4. **Xem logs - sẽ thấy:**
   ```
   🔐 Đăng nhập demo và xác thực với Firebase...
   ✅ Firebase Auth UID: abcd1234...
   ✅ Demo user đã được xác thực với Firebase
   🔍 CartScreen - User ID: abcd1234...
   ✅ CartService: Dữ liệu giỏ hàng: ...
   ```

---

## 📋 Checklist

- [ ] Đã bật Anonymous Auth trên Firebase Console
- [ ] Đã deploy rules mới
- [ ] Đã restart app
- [ ] Đã đăng xuất và đăng nhập lại
- [ ] Giỏ hàng hoạt động không lỗi

---

## 🎯 Kết quả mong đợi

- ✅ Demo user được xác thực với Firebase Auth
- ✅ User ID = Firebase Auth UID (không còn là `demo-user-timestamp`)
- ✅ Giỏ hàng lưu trên Firebase thành công
- ✅ Không còn lỗi "Permission denied"

---

## ⚠️ Nếu vẫn lỗi

**Cách test nhanh:** Dùng rules test mode (KHÔNG an toàn):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Sau đó debug xem Firebase Auth có hoạt động không.
