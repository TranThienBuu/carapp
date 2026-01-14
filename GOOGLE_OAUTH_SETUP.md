# Hướng dẫn sửa lỗi 404 - Cấu hình Google OAuth

## Vấn đề hiện tại
Lỗi 404 khi đăng nhập Google xảy ra vì **OAuth Client IDs chưa được cấu hình đúng**.

## Giải pháp nhanh: Sử dụng Demo Mode
Nhấn nút **"Dùng thử Demo Mode"** trên màn hình đăng nhập để test app mà không cần setup Google OAuth.

---

## Giải pháp đầy đủ: Cấu hình Google OAuth

### Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn (`planto-4cf44`)
3. Bật **Google+ API** và **Google People API**

### Bước 2: Tạo OAuth 2.0 Client IDs

1. Vào **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**

#### Tạo Web Client ID
- **Application type**: Web application
- **Name**: Plantu Web Client
- **Authorized redirect URIs**: 
  ```
  https://auth.expo.io/@your-expo-username/plantu
  ```
- Lưu **Client ID** (dạng: `xxxxx.apps.googleusercontent.com`)

#### Tạo Android Client ID
- **Application type**: Android
- **Name**: Plantu Android
- **Package name**: `com.bao.plantu` (từ app.json)
- **SHA-1 certificate fingerprint**: 
  ```bash
  # Lấy SHA-1 từ Expo
  expo credentials:manager -p android
  ```
- Lưu **Client ID**

#### Tạo iOS Client ID
- **Application type**: iOS
- **Name**: Plantu iOS
- **Bundle ID**: `com.bao.plantu`
- Lưu **Client ID**

### Bước 3: Cập nhật AuthContext.tsx

Mở file `app/context/AuthContext.tsx` và thay thế các placeholder bằng Client IDs thực:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: '105906920756-THAY_IOS_CLIENT_ID_VAO_DAY.apps.googleusercontent.com',
  androidClientId: '105906920756-THAY_ANDROID_CLIENT_ID_VAO_DAY.apps.googleusercontent.com',
  webClientId: '105906920756-THAY_WEB_CLIENT_ID_VAO_DAY.apps.googleusercontent.com',
  expoClientId: '105906920756-THAY_WEB_CLIENT_ID_VAO_DAY.apps.googleusercontent.com', // Dùng Web Client ID
});
```

### Bước 4: Cấu hình OAuth Consent Screen

1. Vào **OAuth consent screen**
2. Chọn **External** user type
3. Điền thông tin:
   - **App name**: Plantu
   - **User support email**: email của bạn
   - **Developer contact**: email của bạn
4. Thêm scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Thêm test users nếu app đang ở chế độ Testing

### Bước 5: Test

1. Rebuild app: `npm start` và reload
2. Nhấn "Đăng nhập với Google"
3. Đăng nhập bằng tài khoản Google

---

## Kiểm tra lỗi thường gặp

### Lỗi: Redirect URI mismatch
- Đảm bảo redirect URI trong Google Console khớp với URI Expo tạo ra
- Kiểm tra scheme trong app.json

### Lỗi: Invalid Client
- Kiểm tra lại Client ID đã copy đúng chưa
- Đảm bảo Client ID tương ứng với platform (Android/iOS/Web)

### Lỗi: Access blocked
- Thêm email test vào OAuth consent screen
- Publish app lên Production mode (không khuyến khích cho development)

---

## Tài liệu tham khảo

- [Expo Auth Session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth Setup](https://docs.expo.dev/guides/authentication/#google)
- [Firebase Console](https://console.firebase.google.com/)
