import React, { useEffect, useState } from "react";
import {
    Text,
    TextInput,
    View,
    StyleSheet,
    Button,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    ToastAndroid,
    Alert,
    KeyboardAvoidingView,
    ScrollView
} from "react-native";
import { app } from "../../firebase.config";
import { getFirestore, getDocs, collection, addDoc } from "firebase/firestore";
import { Formik } from "formik";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "@clerk/clerk-expo";

interface CategoryItem {
    name: string;
}

export default function AddPostScreen() {
    const [image, setImage] = useState<string | null>(null);
    const [categoryList, setCategoryList] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const db = getFirestore(app);
    const storage = getStorage();
    const { user } = useUser();

    useEffect(() => {
        getCategoryList();
    }, []);

    const getCategoryList = async () => {
        setCategoryList([]);
        const querySnapshot = await getDocs(collection(db, "Category"));
        const categories: CategoryItem[] = [];
        querySnapshot.forEach((doc) => {
            categories.push(doc.data() as CategoryItem);
        });
        setCategoryList(categories);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const onSubmitMethod = async (value: any) => {
        setLoading(true);
        try {
            if (image) {
                const resp = await fetch(image);
                const blob = await resp.blob();
                const storageRef = ref(storage, 'communityPost/' + Date.now() + ".jpg");
                await uploadBytes(storageRef, blob);
                const downloadUrl = await getDownloadURL(storageRef);
                value.image = downloadUrl;
            }

            value.userName = user.fullName;
            value.userEmail = user.primaryEmailAddress?.emailAddress;
            value.userImage = user.imageUrl;

            const docRef = await addDoc(collection(db, "plants"), value);
            if (docRef.id) {
                Alert.alert("Success!", "Post added successfully.");
            }
        } catch (error) {
            console.error("Error adding post: ", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Đăng bán cây của bạn ở đây nhé!</Text>
                <Text style={styles.subTitle}>*Liên hệ trực tiếp với chúng mình nếu bạn gặp trục trặc.</Text>
                <Formik
                    initialValues={{
                        title: '',
                        description: '',
                        category: '',
                        address: '',
                        price: '',
                        image: '',
                        userName: '',
                        userEmail: '',
                        userImage: '',
                        createdAt: Date.now(),
                    }}
                    onSubmit={value => onSubmitMethod(value)}
                    validate={(values) => {
                        const errors: any = {};
                        if (!values.title) {
                            ToastAndroid.show("Title is required", ToastAndroid.SHORT);
                            errors.title = "Title is required";
                        }
                        return errors;
                    }}
                >
                    {({ handleChange, handleSubmit, values, errors }) => (
                        <View>
                            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                                {image ? (
                                    <Image source={{ uri: image }} style={styles.image} />
                                ) : (
                                    <Image source={require('../assets/place-holder.jpg')} style={styles.image} />
                                )}
                            </TouchableOpacity>

                            <TextInput
                                style={styles.input}
                                placeholder="Tên mặt hàng"
                                value={values.title}
                                onChangeText={handleChange("title")}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Mô tả"
                                value={values.description}
                                numberOfLines={5}
                                onChangeText={handleChange("description")}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Giá"
                                value={values.price}
                                keyboardType="number-pad"
                                onChangeText={handleChange("price")}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Địa chỉ mặt hàng"
                                value={values.address}
                                onChangeText={handleChange("address")}
                            />
                            <Picker
                                selectedValue={values.category}
                                onValueChange={handleChange("category")}
                                style={styles.picker}
                            >
                                {categoryList.map((item, index) => (
                                    <Picker.Item key={index} label={item.name} value={item.name} />
                                ))}
                            </Picker>
                            <TouchableOpacity
                                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                                disabled={loading}
                                onPress={handleSubmit as any}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </Formik>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: 'white',
        padding: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subTitle: {
        color: 'red',
    },
    input: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        paddingTop: 15,
        paddingHorizontal: 17,
        fontSize: 16,
        marginTop: 10,
        textAlignVertical: 'top',
        marginBottom: 5,
    },
    imagePicker: {
        alignItems: 'center',
        marginBottom: 10,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 16,
    },
    picker: {
        borderWidth: 2,
        marginTop: 10,
        marginBottom: 5,
    },
    submitButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
