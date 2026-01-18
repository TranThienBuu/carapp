import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

function mapFirebaseAuthErrorToMessage(code?: string) {
  switch (code) {
    case "EMAIL_EXISTS":
      return "Email này đã được đăng ký.";
    case "INVALID_EMAIL":
      return "Email không hợp lệ.";
    case "WEAK_PASSWORD":
      return "Mật khẩu quá yếu (tối thiểu 6 ký tự).";
    case "OPERATION_NOT_ALLOWED":
      return "Email/Password chưa được bật trên Firebase Auth.";
    default:
      return null;
  }
}

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { signUpWithEmailPassword, signOut } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword
    );
  }, [email, password, confirmPassword]);

  const handleRegister = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Sai mật khẩu", "Mật khẩu xác nhận không khớp.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Mật khẩu yếu", "Mật khẩu cần tối thiểu 6 ký tự.");
      return;
    }

    try {
      setIsLoading(true);
      await signUpWithEmailPassword(email.trim(), password, fullName.trim());
      // Yêu cầu verify email: đăng xuất và yêu cầu người dùng xác thực trước khi đăng nhập
      await signOut();
      Alert.alert(
        "Đăng ký thành công",
        "Chúng tôi đã gửi email xác thực. Vui lòng mở mail và bấm link để kích hoạt tài khoản, sau đó đăng nhập lại.",
        [{ text: "OK", onPress: () => navigation.navigate('login') }]
      );
    } catch (err: any) {
      const rawMessage = err?.message || "Đăng ký thất bại";
      const code = typeof rawMessage === "string" ? rawMessage : undefined;
      const friendly = mapFirebaseAuthErrorToMessage(code);
      Alert.alert("Lỗi đăng ký", friendly || rawMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo tài khoản</Text>
      <Text style={styles.subtitle}>Đăng ký để mua bán xe dễ dàng hơn</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ và tên (tuỳ chọn)"
        value={fullName}
        onChangeText={setFullName}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.primaryButton, (!canSubmit || isLoading) && styles.disabledButton]}
        onPress={handleRegister}
        disabled={!canSubmit || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
        disabled={isLoading}
      >
        <Text style={styles.secondaryButtonText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  primaryButton: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: "center",
    padding: 14,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#006266",
    fontWeight: "700",
  },
});
