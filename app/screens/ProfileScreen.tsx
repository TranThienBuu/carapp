import React from "react";
import {FlatList, Image, Text, TouchableOpacity, View} from "react-native";
import {useAuth, useUser} from "../context/AuthContext";
import ChinesePanda from "../assets/menuList/ChinesePanda.jpg";
import {useNavigation} from "@react-navigation/native";




export default function ProfileScreen() {

    const {user}= useUser();
    const navigation = useNavigation();
    const{isLoaded, signOut} =useAuth();

    const onMenuPress=(item)=>{
        if(item.name=="Logout")
        {
signOut();
        }
        item?.path?navigation.navigate(item.path):null
    }




    const menuList=[
        {
            id:1,
            name:"Sản Phẩm của tôi",
            icon:ChinesePanda,
            path: "my-products",

        },
         {
            id:2,
            name:"Explore",
            icon:ChinesePanda,
             path: "explore-nav",

        },
         {
            id:3,
            name:"Tube",
            icon:ChinesePanda,
             url:"",

        },
         {
            id:4,
            name:"Logout",
            icon:ChinesePanda,

        },
    ]



    return(
        <View className="p-5 bg-white flex-1 ">
            <View className="items-center mt-14">
            <Image source={{uri:user?.imageUrl}}
                   className={"w-[100px] h-[100px] rounded-full "}/>
            <Text className="font-bold text-[25px] mt-2">{user?.fullName}</Text>
            <Text className=" text-[18px] mt-2 text-gray-500">{user?.primaryEmailAddress?.emailAddress}</Text>
            </View>

            <FlatList data={menuList}
                      numColumns={3}
                      style={{marginTop:20}}
                      renderItem={({item, index})=>(
                          <TouchableOpacity
                              onPress={()=>onMenuPress(item)}
                              className="flex-1 p-5 border-[1px] items-center
                          mx-0.5 mt-4 rounded-lg border-gray-300">
                              {item.icon&&<Image source={item?.icon}
                              className="w-[50px] h-[50px]"/>}
                              <Text className="text-[12px] mt-2 text-green-900">{item.name}</Text>
                          </TouchableOpacity>
                      )}/>

        </View>
    )
}