import React from 'react';
import {View, FlatList, StyleSheet, Image, Text} from 'react-native';


type SliderItem = {
    image: string;
};

type SliderProps = {
    sliderList: SliderItem[];
};

const Slider: React.FC<SliderProps> = ({ sliderList }) => {

    return (
        <View className="mt-5">
            <Text className="font-semibold text-[16px]">Gợi ý cho bạn!</Text>
            <FlatList
                data={sliderList}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item,index }) => (
                    <View >
                        <Image source={{ uri: item?.image }}
                               className="h-[200px] w-[300px] mr-3 rounded-lg object-contain"
                        />
                    </View>
                )}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    contentContainer: {
        alignItems: 'center',
    },
    itemContainer: {
        marginHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: 300,
        height: 150,
    },
});

export default Slider;
