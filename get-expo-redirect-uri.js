// Script to get the correct redirect URI for Google OAuth
const fs = require('fs');
const path = require('path');

console.log('\n🔧 Hướng dẫn cấu hình Google OAuth cho Plantu App\n');
console.log('═'.repeat(60));

// Read app.json to get slug
const appJsonPath = path.join(__dirname, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const slug = appJson.expo.slug;

console.log('\n📱 Thông tin App:');
console.log(`   - Tên: ${appJson.expo.name}`);
console.log(`   - Slug: ${slug}`);
console.log(`   - Package (Android): ${appJson.expo.android?.package || 'Chưa có'}`);

console.log('\n🌐 BƯỚC 1: Tạo OAuth Client IDs trên Google Cloud Console');
console.log('   → Truy cập: https://console.cloud.google.com/apis/credentials');
console.log('   → Chọn project: planto-4cf44 (hoặc tạo mới)');
console.log('   → Bật API: Google+ API và Google People API');

console.log('\n📋 BƯỚC 2: Tạo OAuth 2.0 Client ID cho từng platform:');

console.log('\n   A. WEB CLIENT ID (quan trọng nhất cho Expo Go)');
console.log('      • Application type: Web application');
console.log('      • Name: Plantu Web Client');
console.log('      • Authorized redirect URIs:');
console.log(`        https://auth.expo.io/@YOUR-EXPO-USERNAME/${slug}`);
console.log('      • Click Create và copy Client ID');

console.log('\n   B. ANDROID CLIENT ID (cho app build)');
console.log('      • Application type: Android');
console.log('      • Name: Plantu Android');
console.log(`      • Package name: ${appJson.expo.android?.package || 'com.bao.plantu'}`);
console.log('      • SHA-1: Chạy lệnh expo credentials:manager -p android');

console.log('\n   C. iOS CLIENT ID (cho app build)');
console.log('      • Application type: iOS');
console.log('      • Name: Plantu iOS');
console.log(`      • Bundle ID: ${appJson.expo.ios?.bundleIdentifier || appJson.expo.android?.package || 'com.bao.plantu'}`);

console.log('\n📝 BƯỚC 3: Cập nhật Client IDs trong code');
console.log('   → File: app/context/AuthContext.tsx');
console.log('   → Thay thế các dòng:');
console.log('      iosClientId: "105906920756-YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"');
console.log('      androidClientId: "105906920756-YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com"');
console.log('      webClientId: "105906920756-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"');
console.log('      expoClientId: "105906920756-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com" (dùng Web Client ID)');

console.log('\n⚙️ BƯỚC 4: Cấu hình OAuth Consent Screen');
console.log('   → User Type: External');
console.log('   → App name: Plantu');
console.log('   → Scopes: userinfo.email, userinfo.profile');
console.log('   → Test users: Thêm email của bạn');

console.log('\n🔄 BƯỚC 5: Test');
console.log('   → Reload app (nhấn r trong terminal)');
console.log('   → Nhấn nút "Đăng nhập với Google"');
console.log('   → Chọn tài khoản Google để đăng nhập');

console.log('\n💡 LƯU Ý QUAN TRỌNG:');
console.log('   ⚠️  Đang dùng Expo Go → Dùng Web Client ID cho cả webClientId VÀ expoClientId');
console.log('   ⚠️  Redirect URI phải chính xác khớp với Expo username của bạn');
console.log('   ⚠️  Nếu chưa setup xong, vẫn có thể dùng nút "Vào App Ngay" (Demo Mode)');

console.log('\n' + '═'.repeat(60));
console.log('\n✅ Sau khi setup xong, Google Sign-In sẽ hoạt động bình thường!');
console.log('❓ Cần trợ giúp? Xem file GOOGLE_OAUTH_SETUP.md\n');
