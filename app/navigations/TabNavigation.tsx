
import React from 'react';
import {View, Text} from "react-native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ExploreScreen from "../screens/ExploreScreen";
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from "../screens/ProfileScreen";
import HomeScreenStackNavigation from "./HomeScreenStackNavigation";
import ExploreScreenStackNavigation from "./ExploreScreenStackNavigation";
import ProfileStackNavigation from "./ProfileStackNavigation";
import AdminStackNavigation from "./AdminStackNavigation";
import { useUser } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const TabNavigation = () => {
    const { isAdmin } = useUser();
    return(
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#6ab04c",
        }}>
            <Tab.Screen name="home-nav" component={HomeScreenStackNavigation}
                        options={{
                            tabBarLabel:({color})=>(
                                <Text style={{color:color, fontSize: 16, marginBottom:3}}>Home</Text>
                            ), tabBarIcon:({color, size})=>(
                                <Ionicons name="home" size={size} color={color} />
                            )
                        }}
            />
            <Tab.Screen name="explore-nav" component={ExploreScreenStackNavigation}
                        options={{
                            tabBarLabel:({color})=>(
                                <Text style={{color:color, fontSize: 16, marginBottom:3}}>Explore</Text>
                            ), tabBarIcon:({color, size})=>(
                                <Ionicons name="search" size={size} color={color} />
                            )
                        }}
            />
            {isAdmin && (
                <Tab.Screen name="admin" component={AdminStackNavigation}
                            options={{
                                tabBarLabel:({color})=>(
                                    <Text style={{color:color, fontSize: 16, marginBottom:3}}>Admin</Text>
                                ), tabBarIcon:({color, size})=>(
                                    <Ionicons name="shield-checkmark" size={size} color={color} />
                                )
                            }}
                />
            )}
            <Tab.Screen name="profile-nav" component={ProfileStackNavigation}
                        options={{
                            tabBarLabel:({color})=>(
                                <Text style={{color:color, fontSize: 16, marginBottom:3}}>Profile</Text>
                            ), tabBarIcon:({color, size})=>(
                                <Ionicons name="person" size={size} color={color} />
                            )
                        }}
            />
        </Tab.Navigator>
    )
}
export default TabNavigation;