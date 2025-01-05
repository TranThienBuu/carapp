import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, Modal, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, getDoc, collection, updateDoc, addDoc } from 'firebase/firestore';
import { app } from '../../firebase.config';
import { ListItem, Icon } from 'react-native-elements';

const CartScreen = ({ navigation }) => {
    const db = getFirestore(app);
    const [cartItems, setCartItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [userName, setUserName] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash'); // Default payment method is Cash
    const [editingItem, setEditingItem] = useState(null); // To store the item being edited

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const cartDocRef = doc(db, 'carts', 'userCart');
                const cartDocSnapshot = await getDoc(cartDocRef);

                if (cartDocSnapshot.exists()) {
                    const cartData = cartDocSnapshot.data();
                    const { products, quantities } = cartData;

                    const items = await Promise.all(products.map(async (product, index) => {
                        const plantDocRef = doc(db, 'plants', product);
                        const plantDocSnapshot = await getDoc(plantDocRef);

                        if (plantDocSnapshot.exists()) {
                            const plantData = plantDocSnapshot.data();
                            return {
                                name: product,
                                quantity: quantities[index],
                                price: plantData.price,
                                description: plantData.description,
                                image: plantData.image,
                            };
                        } else {
                            return {
                                name: product,
                                quantity: quantities[index],
                                price: 0,
                                description: 'No description available',
                                image: '',
                            };
                        }
                    }));

                    setCartItems(items);
                } else {
                    console.log('Document does not exist!');
                }
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        };

        fetchCartItems();
    }, []);

    const renderItem = ({ item, index }) => (
        <ListItem bottomDivider>
            <ListItem.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                    <ListItem.Title>{item.name}</ListItem.Title>
                    <ListItem.Subtitle>Quantity: {item.quantity}</ListItem.Subtitle>
                    <ListItem.Subtitle>Price: ${item.price}</ListItem.Subtitle>
                    {/* Display other product details */}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => handleEditQuantity(item)}>
                        <Icon name="edit" type="material" size={24} color="blue" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteItem(item)}>
                        <Icon name="delete" type="material" size={24} color="red" />
                    </TouchableOpacity>
                </View>
            </ListItem.Content>
        </ListItem>
    );

    const handleEditQuantity = (item) => {
        setEditingItem(item); // Store the item being edited
        setModalVisible(true); // Show the edit quantity modal
    };

    const handleDeleteItem = async (item) => {
        try {
            const updatedProducts = cartItems.filter(i => i.name !== item.name).map(i => i.name);
            const updatedQuantities = cartItems.filter(i => i.name !== item.name).map(i => i.quantity);

            const cartRef = doc(db, 'carts', 'userCart');
            await updateDoc(cartRef, { products: updatedProducts, quantities: updatedQuantities });

            setCartItems(cartItems.filter(i => i.name !== item.name));
            Alert.alert('Success', 'Item deleted successfully!');
        } catch (error) {
            console.error('Error deleting item:', error);
            Alert.alert('Error', 'Failed to delete item. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setEditingItem(null); // Reset the editing item
        setModalVisible(false);
    };

    const handleSaveEdit = async () => {
        try {
            const { name, quantity } = editingItem;
            const updatedQuantities = cartItems.map(item => item.name === name ? { ...item, quantity } : item).map(i => i.quantity);

            const cartRef = doc(db, 'carts', 'userCart');
            await updateDoc(cartRef, { quantities: updatedQuantities });

            setCartItems(cartItems.map(item => item.name === name ? { ...item, quantity } : item));
            handleCloseModal();
            Alert.alert('Success', 'Quantity updated successfully!');
        } catch (error) {
            console.error('Error updating quantity:', error);
            Alert.alert('Error', 'Failed to update quantity. Please try again.');
        }
    };

    const handleProceedToCheckout = () => {
        setModalVisible(true);
    };

    const handleCheckout = async () => {
        try {
            if (!userName || !address || !paymentMethod) {
                Alert.alert('Error', 'Please fill in all fields.');
                return;
            }

            // Save the order to Firestore
            const ordersRef = collection(db, 'orders');
            await addDoc(ordersRef, {
                userName,
                address,
                paymentMethod,
                items: cartItems.map(item => ({
                    plantId: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    description: item.description,
                    image: item.image,
                })),
                total: calculateTotal(),
                timestamp: new Date(),
            });

            // Update the cart in Firestore
            const cartRef = doc(db, 'carts', 'userCart');
            await updateDoc(cartRef, { products: [], quantities: [] });

            // Close the modal and show success message
            handleCloseModal();
            setCartItems([]); // Clear the cart items after placing the order
            Alert.alert('Success', 'Order placed successfully!');
        } catch (error) {
            console.error('Error during checkout:', error);
            Alert.alert('Error', 'There was an error during checkout. Please try again.');
        }
    };

    const calculateTotal = () => {
        return cartItems
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toFixed(2);
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Cart Items:</Text>
            <FlatList
                data={cartItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                style={{ width: '100%' }}
            />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>Total: ${calculateTotal()}</Text>
            <Button
                title="Proceed to Checkout"
                containerStyle={{ width: '100%', marginTop: 20 }}
                onPress={handleProceedToCheckout}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        {editingItem ? (
                            <>
                                <Text style={styles.modalTitle}>Edit Quantity</Text>
                                <Text style={styles.modalText}>{editingItem.name}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Quantity"
                                    value={editingItem.quantity.toString()}
                                    onChangeText={(text) => setEditingItem({ ...editingItem, quantity: parseInt(text, 10) })}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity style={styles.button} onPress={handleSaveEdit}>
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCloseModal}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>Checkout</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Recipient Name"
                                    value={userName}
                                    onChangeText={setUserName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Address"
                                    value={address}
                                    onChangeText={setAddress}
                                />
                                <Text>Payment method: {paymentMethod}</Text>
                                <TouchableOpacity style={styles.button} onPress={handleCheckout}>
                                    <Text style={styles.buttonText}>Place Order</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCloseModal}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        width: '100%',
    },
    button: {
        backgroundColor: '#008000',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 20,
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#FF0000',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default CartScreen;
