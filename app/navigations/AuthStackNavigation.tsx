import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

const Stack = createStackNavigator();

export default function AuthStackNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="register"
        component={RegisterScreen}
        options={{
          headerStyle: { backgroundColor: "#006266" },
          headerTintColor: "#fff",
          headerTitle: "Đăng ký",
        }}
      />
      <Stack.Screen
        name="forgot-password"
        component={ForgotPasswordScreen}
        options={{
          headerStyle: { backgroundColor: "#006266" },
          headerTintColor: "#fff",
          headerTitle: "Quên mật khẩu",
        }}
      />
    </Stack.Navigator>
  );
}
