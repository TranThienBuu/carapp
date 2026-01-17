# ✅ Firebase Setup Checklist

Sử dụng checklist này để đảm bảo bạn đã hoàn thành tất cả các bước kết nối Firebase.

## 📋 Pre-Setup

- [ ] Đã có tài khoản Google
- [ ] Đã có internet ổn định
- [ ] Project React Native đã chạy được

## 🔥 Firebase Console Setup

### Tạo Project
- [ ] Truy cập https://console.firebase.google.com
- [ ] Tạo project mới (tên: carapp hoặc tùy chọn)
- [ ] Chọn location gần nhất (asia-southeast1)
- [ ] Project đã được tạo thành công

### Web App Setup
- [ ] Click icon Web (</>) trong Firebase Console
- [ ] Đặt app nickname: carapp-web
- [ ] Copy firebaseConfig
- [ ] Lưu config vào notepad/file text

### Authentication
- [ ] Vào menu Authentication
- [ ] Click "Get started"
- [ ] Enable "Email/Password" sign-in method
- [ ] (Optional) Enable "Google" sign-in method
- [ ] Lưu thay đổi

### Firestore Database
- [ ] Vào menu Firestore Database
- [ ] Click "Create database"
- [ ] Chọn "Start in test mode"
- [ ] Chọn location: asia-southeast1 (hoặc gần nhất)
- [ ] Database đã được tạo

### Storage (Optional)
- [ ] Vào menu Storage
- [ ] Click "Get started"
- [ ] Chọn "Start in test mode"
- [ ] Storage đã được tạo

## 💻 Code Setup

### Update Config
- [ ] Mở file `app/db/Firestore.ts`
- [ ] Paste firebaseConfig từ Firebase Console
- [ ] Kiểm tra tất cả fields: apiKey, authDomain, projectId, etc.
- [ ] Lưu file

### Verify Dependencies
- [ ] Package.json có "firebase": "^10.12.2"
- [ ] Nếu chưa: chạy `npm install firebase`
- [ ] Dependencies đã được cài đặt

## 🛠️ Firebase CLI Setup

### Install & Login
- [ ] Chạy: `npm install -g firebase-tools`
- [ ] Chạy: `firebase login`
- [ ] Đăng nhập thành công qua browser
- [ ] Terminal hiển thị "Success"

### Initialize (nếu cần)
- [ ] Chạy: `firebase init` (nếu chưa có firebase.json)
- [ ] Chọn: Firestore
- [ ] Chọn project của bạn
- [ ] Accept default files: firestore.rules, firestore.indexes.json

### Deploy Rules
- [ ] Chạy: `firebase deploy --only firestore:rules`
- [ ] Deploy thành công
- [ ] Kiểm tra rules trong Firebase Console

## 🧪 Testing

### Basic Connection Test
- [ ] Thêm `<FirebaseConnectionTest />` vào LoginScreen
- [ ] Chạy app: `npm start`
- [ ] Click icon 🧪 trong app
- [ ] Test pass (kiểm tra console)
- [ ] Xóa component test sau khi xong

### Create Admin Account
- [ ] Thêm `<AdminSetupHelper />` vào LoginScreen
- [ ] Chạy app
- [ ] Click "Tạo Admin Account"
- [ ] Nhận thông báo thành công
- [ ] Kiểm tra Firestore: collection "users" có admin
- [ ] Xóa component helper sau khi xong

### Test Registration
- [ ] Mở app
- [ ] Click "Đăng nhập với Email"
- [ ] Click "Đăng ký ngay"
- [ ] Điền form đăng ký
- [ ] Đăng ký thành công
- [ ] Kiểm tra Firebase Console:
  - [ ] Authentication → Users → Có user mới
  - [ ] Firestore → users → Có document mới

### Test Login - User
- [ ] Đăng xuất
- [ ] Đăng nhập với user vừa tạo
- [ ] Đăng nhập thành công
- [ ] Profile hiển thị đúng thông tin
- [ ] KHÔNG thấy tab "Admin"
- [ ] Có thể tạo sản phẩm

### Test Login - Admin
- [ ] Đăng xuất
- [ ] Đăng nhập với admin@carapp.com / Admin@123
- [ ] Đăng nhập thành công
- [ ] Profile có badge "👑 Admin"
- [ ] Thấy tab "Admin" trong bottom navigation
- [ ] Có thể truy cập màn hình Admin

### Test Permissions
- [ ] Đăng nhập user thường
- [ ] Tạo sản phẩm → OK
- [ ] Sửa sản phẩm của mình → OK
- [ ] Thử sửa sản phẩm người khác → Không được (nếu có)
- [ ] Đăng nhập admin
- [ ] Có thể sửa/xóa mọi sản phẩm → OK

## 🔒 Security

### Firestore Rules
- [ ] Rules đã được deploy
- [ ] Test permissions trong Firestore Rules Playground
- [ ] User chỉ đọc được data của mình
- [ ] Admin đọc được tất cả data

### Authentication Security
- [ ] Password minimum length: 6 characters
- [ ] Email validation hoạt động
- [ ] (Optional) Enable email verification
- [ ] (Optional) Setup password reset

## 📱 Platform Specific (Optional)

### Android
- [ ] Tải file `google-services.json`
- [ ] Đặt vào: `android/app/`
- [ ] Update `android/app/build.gradle`
- [ ] Build thành công

### iOS
- [ ] Tải file `GoogleService-Info.plist`
- [ ] Add vào Xcode project
- [ ] Build thành công

## 📊 Monitoring & Optimization

### Firebase Console Checks
- [ ] Xem Authentication users
- [ ] Xem Firestore data structure
- [ ] Check Usage tab (trong Budget)
- [ ] Setup billing alerts (nếu cần)

### App Performance
- [ ] App khởi động nhanh
- [ ] Login/register response time < 3s
- [ ] Firestore queries nhanh
- [ ] Không có memory leaks

## 🧹 Cleanup

### Development
- [ ] Xóa collection "test_connection" trong Firestore
- [ ] Xóa `<FirebaseConnectionTest />` khỏi code
- [ ] Xóa `<AdminSetupHelper />` khỏi code
- [ ] Comment out debug console.logs

### Security
- [ ] Không commit firebase config vào git public
- [ ] Add `google-services.json` vào .gitignore
- [ ] Add `GoogleService-Info.plist` vào .gitignore
- [ ] (Optional) Use environment variables

## 📚 Documentation

- [ ] Team biết cách login admin
- [ ] Team biết cách tạo user mới
- [ ] Team biết cách deploy rules
- [ ] Document Firebase structure

## 🎯 Production Ready

- [ ] Change Firestore rules từ test mode sang production
- [ ] Setup proper security rules
- [ ] Enable App Check (recommended)
- [ ] Setup backup & recovery
- [ ] Monitor quota & billing
- [ ] Setup error tracking
- [ ] Configure proper indexes

---

## 📝 Notes

**Admin Credentials:**
- Email: `admin@carapp.com`
- Password: `Admin@123`
- ⚠️ **QUAN TRỌNG**: Đổi password sau khi deploy production!

**Important Links:**
- Firebase Console: https://console.firebase.google.com
- Project: [Your project ID]
- Docs: [FIREBASE_SETUP_GUIDE.md](FIREBASE_SETUP_GUIDE.md)

**Team Contacts:**
- Firebase Admin: [Email]
- Developer: [Email]

---

**✅ Checklist Complete?**

Khi tất cả đã check ✅, Firebase đã sẵn sàng cho production!

---

_Last updated: [Date]_
_Updated by: [Name]_
