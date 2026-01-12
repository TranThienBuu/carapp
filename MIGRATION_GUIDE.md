# Plantu - Plant Marketplace App (Expo Go Compatible)

## ✅ Đã Migration từ Clerk sang Firebase Auth

App này đã được chuyển từ Clerk authentication sang Firebase Authentication để **tương thích với Expo Go**.

## 🔧 Setup Google Sign-In (Quan trọng!)

Để Google Sign-In hoạt động, bạn cần cấu hình OAuth credentials trong Firebase Console:

### 1. Lấy Google OAuth Client IDs

Truy cập [Firebase Console](https://console.firebase.google.com/):
1. Chọn project `planto-4cf44`
2. Vào **Authentication** > **Sign-in method**
3. Enable **Google** provider
4. Lấy **Web client ID** (đã có sẵn từ Firebase)

### 2. Tạo OAuth Credentials cho Android/iOS

Vào [Google Cloud Console](https://console.cloud.google.com/):
1. Chọn project Firebase của bạn
2. Vào **APIs & Services** > **Credentials**
3. Tạo **OAuth 2.0 Client ID**:
   - **Android**: Cần SHA-1 certificate fingerprint
   - **iOS**: Cần iOS bundle ID
   - **Web**: Đã có sẵn từ Firebase

### 3. Cập nhật AuthContext.tsx

Mở [app/context/AuthContext.tsx](app/context/AuthContext.tsx) dòng 42-44 và thay thế:

```tsx
const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});
```

**Lấy Client IDs:**
- **Web Client ID**: Từ Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration
- **Android Client ID**: Từ Google Cloud Console > Credentials (sau khi tạo OAuth client)
- **iOS Client ID**: Từ Google Cloud Console > Credentials (sau khi tạo OAuth client)

### 4. Lấy SHA-1 Certificate (cho Android)

```powershell
# Trong thư mục mobile:
cd android
./gradlew signingReport

# Hoặc dùng keytool:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy **SHA-1** và paste vào Google Cloud Console khi tạo Android OAuth Client ID.

## 📱 Chạy App với Expo Go

Sau khi setup xong OAuth credentials:

```powershell
cd mobile
npx expo start
```

Quét QR code bằng **Expo Go** trên điện thoại.

## 🎯 Các thay đổi chính

### Files đã xoá/thay thế:
- ❌ `@clerk/clerk-expo` dependency
- ✅ Tạo mới: [app/context/AuthContext.tsx](app/context/AuthContext.tsx)

### Files đã cập nhật:
- [App.tsx](App.tsx) - Dùng `AuthProvider` thay vì `ClerkProvider`
- [app/screens/LoginScreen.tsx](app/screens/LoginScreen.tsx) - Firebase Google Sign-In
- [app/components/Header.tsx](app/components/Header.tsx)
- [app/screens/AddPostScreen.tsx](app/screens/AddPostScreen.tsx)
- [app/screens/ProfileScreen.tsx](app/screens/ProfileScreen.tsx)
- [app/screens/MyProducts.tsx](app/screens/MyProducts.tsx)
- [app/screens/ProductDetail.tsx](app/screens/ProductDetail.tsx)
- [app/components/PostItem.tsx](app/components/PostItem.tsx)
- [app/components/LatestItemList.tsx](app/components/LatestItemList.tsx)

## 🚀 Auth API giống Clerk

Hook `useUser()` vẫn trả về cùng structure:

```tsx
const { user } = useUser();
// user.fullName
// user.imageUrl
// user.primaryEmailAddress.emailAddress
```

Hook `useAuth()`:
```tsx
const { signOut, isLoaded } = useAuth();
```

## ⚠️ Lưu ý

- Google Sign-In sẽ **KHÔNG hoạt động** cho đến khi bạn cấu hình đúng OAuth Client IDs
- Nếu test trên Android/iOS simulator, cần Client ID tương ứng
- Web Client ID là bắt buộc

## 🐛 Troubleshooting

**Lỗi: "Google Sign-In cancelled" hoặc không có response**
→ Kiểm tra Client IDs trong [AuthContext.tsx](app/context/AuthContext.tsx)

**Lỗi: "User cancelled" mà chưa mở popup**
→ Client ID không hợp lệ hoặc chưa enable Google provider trong Firebase

**App crash khi login**
→ Kiểm tra Firebase config trong [firebase.config.js](firebase.config.js)
