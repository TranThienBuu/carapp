import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './app/screens/LoginScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View} from 'react-native';
import TabNavigation from "./app/navigations/TabNavigation";
import ExploreScreen from "./app/screens/ExploreScreen";
import ProfileScreen from "./app/screens/ProfileScreen";
import {StatusBar} from "expo-status-bar";

export default function App() {
    return (

        <ClerkProvider publishableKey="pk_test_dW5iaWFzZWQtdGFycG9uLTY4LmNsZXJrLmFjY291bnRzLmRldiQ">
        <View className="flex-1 bg-white">
            <StatusBar style="auto"/>
            {/*<Text>*/}
            {/*    Halo*/}
            {/*</Text>*/}


                    <SignedIn>
                        <NavigationContainer>
                            <TabNavigation/>
                        </NavigationContainer>
                    </SignedIn>
                    <SignedOut>
                        <LoginScreen />
                    </SignedOut>


        </View>
        </ClerkProvider>
    );
}
