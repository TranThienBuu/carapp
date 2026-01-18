import React from "react";
import {Text, View} from "react-native";
import {createStackNavigator} from "@react-navigation/stack";
import ProfileScreen from "../screens/ProfileScreen";
import ExploreScreen from "../screens/ExploreScreen";
import MyProductsScreen from "../screens/MyProducts";
import ProductDetail from "../screens/ProductDetail";
import OrdersScreen from "../screens/OrdersScreen";


const Stack = createStackNavigator();

export default function ProfileStackNavigation() {

    return(
        <Stack.Navigator>

            <Stack.Screen name="profile" component={ProfileScreen}

            />
            <Stack.Screen name="my-products" component={MyProductsScreen}
                          options={{
                              headerStyle:{
                                  backgroundColor:"#006266",
                              },
                              headerTintColor:"#fff",
                              headerTitle:"Sản phẩm của tôi"}}
            />

            <Stack.Screen name="orders" component={OrdersScreen}
                          options={{
                              headerStyle:{
                                  backgroundColor:"#006266",
                              },
                              headerTintColor:"#fff",
                              headerTitle:"Đơn hàng của tôi"}}
            />

            <Stack.Screen name="product-detail" component={ProductDetail}
                          options={{
                              headerStyle:{
                                  backgroundColor:"#006266",
                              },
                              headerTintColor:"#fff",
                              headerTitle:"Detail"}}

            />
        </Stack.Navigator>
    )
}