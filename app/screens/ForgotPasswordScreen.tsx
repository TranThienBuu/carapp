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

function mapFirebaseResetErrorToMessage(code?: string) {
  switch (code) {
    case "INVALID_EMAIL":
      return "Email không hợp lệ.";
    case "EMAIL_NOT_FOUND":
      return "Email này chưa được đăng ký.";
    case "OPERATION_NOT_ALLOWED":
      return "Email/Password chưa được bật trên Firebase Auth.";
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.";
    default:
      return null;
  }
}

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { sendPasswordResetEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 0, [email]);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email.");
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(email.trim());
      Alert.alert(
        "Đã gửi email",
        "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      const rawMessage = err?.message || "Gửi email thất bại";
      const code = typeof rawMessage === "string" ? rawMessage : undefined;
      const friendly = mapFirebaseResetErrorToMessage(code);
      Alert.alert("Lỗi", friendly || rawMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.subtitle}>
        Nhập email để nhận link đặt lại mật khẩu
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.primaryButton, (!canSubmit || isLoading) && styles.disabledButton]}
        onPress={handleSend}
        disabled={!canSubmit || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Gửi email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
        disabled={isLoading}
      >
        <Text style={styles.secondaryButtonText}>Quay lại đăng nhập</Text>
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
