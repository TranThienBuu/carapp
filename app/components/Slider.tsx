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
        <View style={{ marginTop: 5 }}>
            <FlatList
                data={sliderList}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item,index }) => (
                    <View style={styles.cardShadow}>
                        <Image source={{ uri: item?.image }}
                               style={styles.sliderImage}
                        />
                    </View>
                )}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
    },
    cardShadow: {
        marginRight: 16,
        borderRadius: 18,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    sliderImage: {
        width: 320,
        height: 180,
        borderRadius: 18,
        resizeMode: 'cover',
    },
});

export default Slider;
