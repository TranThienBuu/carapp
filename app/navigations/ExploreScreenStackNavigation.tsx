import React from 'react';
import {Text, View} from "react-native";
import {createStackNavigator} from "@react-navigation/stack";
import HomeScreenStackNavigation from "./HomeScreenStackNavigation";
import ExploreScreen from "../screens/ExploreScreen";
import ProductDetail from "../screens/ProductDetail";



const Stack = createStackNavigator();

export default function ExploreScreenStackNavigation() {

    return(
        <Stack.Navigator >
            <Stack.Screen name="explore" component={ExploreScreen}/>
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