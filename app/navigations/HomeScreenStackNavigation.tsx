import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from "../screens/HomeScreen";
import ItemList from "../screens/ItemList";
import {color} from "nativewind/dist/tailwind/native/color";
import ProductDetail from "../screens/ProductDetail";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import PaymentScreen from "../screens/PaymentScreen";


const Stack = createStackNavigator();


export default function HomeScreenStackNavigation() {

    return(
        <Stack.Navigator>
            <Stack.Screen name="home" component={HomeScreen}
            options={{headerShown:false}}
            />
            <Stack.Screen name="item-list" component={ItemList}
                          options={({ route }) => ({ title: route.params.category ,
                          headerStyle:{
                              backgroundColor:"#006266",
                          },
                          headerTintColor:"#fff"})}

            />


            <Stack.Screen name="product-detail" component={ProductDetail}
                          options={{
                          headerStyle:{
                              backgroundColor:"#006266",
                          },
                          headerTintColor:"#fff",
                          headerTitle:"Detail"}}

            />

            <Stack.Screen name="cart" component={CartScreen}
                          options={{
                          headerStyle:{
                              backgroundColor:"#006266",
                          },
                          headerTintColor:"#fff",
                          headerTitle:"Cart"}}

            />

            <Stack.Screen name="checkout" component={CheckoutScreen}
                          options={{ headerShown: false }}
            />

            <Stack.Screen name="payment" component={PaymentScreen}
                          options={{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}