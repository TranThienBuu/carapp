import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AdminScreen from "../screens/AdminScreen";
import AdminOrdersScreen from "../screens/AdminOrdersScreen";

const Stack = createStackNavigator();

export default function AdminStackNavigation() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="admin-dashboard" 
                component={AdminScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="admin-orders" 
                component={AdminOrdersScreen}
                options={{
                    headerStyle: {
                        backgroundColor: "#006266",
                    },
                    headerTintColor: "#fff",
                    headerTitle: "Quản lý đơn hàng"
                }}
            />
        </Stack.Navigator>
    );
}
