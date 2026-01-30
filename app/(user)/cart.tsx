import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../components/ToastProvider';
import cartService, { CartItem } from '../../services/cartService';
import orderService from '../../services/orderService';

const MAX_WIDTH = 1200;

export default function CartScreen() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);

    // Detailed Address State
    const [addressForm, setAddressForm] = useState({
        houseNo: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('UPI');

    useEffect(() => {
        const unsubscribe = cartService.subscribe((items) => {
            setCartItems(items);
        });
        return unsubscribe;
    }, []);

    const contentWidth = Math.min(width - 40, MAX_WIDTH);

    const handlePlaceOrder = () => {
        const { houseNo, area, city, state, pincode } = addressForm;
        if (!houseNo || !area || !city || !state || !pincode) {
            showToast('Please fill all required address fields', 'info');
            return;
        }

        if (pincode.length !== 6) {
            showToast('Please enter a valid 6-digit Pincode', 'info');
            return;
        }

        const fullAddress = `${houseNo}, ${area}, ${addressForm.landmark ? addressForm.landmark + ', ' : ''}${city}, ${state} - ${pincode}`;
        const total = cartService.getTotalPrice();
        orderService.placeOrder(cartItems, total, fullAddress, paymentMethod);

        cartService.clearCart();
        setIsCheckoutVisible(false);
        showToast('Order placed successfully!', 'success');

        setTimeout(() => {
            router.push('/(user)/orders');
        }, 1500);
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} contentFit="contain" />
            </View>
            <View style={styles.details}>
                <View style={styles.headerRow}>
                    <View style={styles.infoCol}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.variant}>
                            Size: <Text style={styles.variantValue}>{item.selectedSize || 'Standard'}</Text>
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => cartService.removeFromCart(item.id, item.selectedSize)}
                        style={styles.removeBtn}
                    >
                        <Ionicons name="trash-outline" size={20} color="#e94560" />
                    </TouchableOpacity>
                </View>

                <View style={styles.footerRow}>
                    <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => cartService.updateQuantity(item.id, item.selectedSize, -1)}
                        >
                            <Ionicons name="remove" size={16} color="#1A1A2E" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => cartService.updateQuantity(item.id, item.selectedSize, 1)}
                        >
                            <Ionicons name="add" size={16} color="#1A1A2E" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Your Cart',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#F8F9FA' },
                    headerTitleStyle: { fontWeight: '800', color: '#1A1A2E' },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={{ flex: 1, alignItems: 'center' }}>
                {cartItems.length === 0 ? (
                    <View style={[styles.emptyContainer, { width: contentWidth }]}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="bag-outline" size={70} color="#ADADAD" />
                        </View>
                        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
                        <Text style={styles.emptySubtitle}>Looks like you haven't added anything to your cart yet.</Text>
                        <TouchableOpacity
                            style={styles.shopBtn}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.shopBtnText}>Shop Now</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={cartItems}
                            renderItem={renderCartItem}
                            keyExtractor={(item, index) => `${item.id}-${item.selectedSize}-${index}`}
                            style={{ width: contentWidth }}
                            contentContainerStyle={[
                                styles.listContent,
                                { paddingBottom: insets.bottom + 180 }
                            ]}
                            showsVerticalScrollIndicator={false}
                        />

                        <View style={[styles.summaryCard, { width: width, paddingBottom: Math.max(insets.bottom, 20) + 10, alignItems: 'center' }]}>
                            <View style={{ width: contentWidth }}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Subtotal</Text>
                                    <Text style={styles.summaryValue}>₹{cartService.getTotalPrice().toLocaleString()}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                                    <Text style={[styles.summaryValue, { color: '#10b981' }]}>FREE</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.summaryRow}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>₹{cartService.getTotalPrice().toLocaleString()}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.placeOrderBtn}
                                    onPress={() => setIsCheckoutVisible(true)}
                                    activeOpacity={0.9}
                                >
                                    <LinearGradient
                                        colors={['#e94560', '#ff6b6b']}
                                        style={styles.placeOrderGradient}
                                    >
                                        <Text style={styles.placeOrderText}>Confirm Order</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </View>

            {/* Checkout Modal */}
            <Modal
                visible={isCheckoutVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsCheckoutVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Checkout</Text>
                            <TouchableOpacity onPress={() => setIsCheckoutVisible(false)}>
                                <Ionicons name="close" size={24} color="#1A1A2E" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>Delivery Address</Text>

                            <View style={styles.addressForm}>
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.fieldLabel}>Flat / House No.</Text>
                                        <TextInput
                                            style={styles.fieldInput}
                                            placeholder="Flat 101, Pearl"
                                            placeholderTextColor="#ADADAD"
                                            value={addressForm.houseNo}
                                            onChangeText={(txt) => setAddressForm(prev => ({ ...prev, houseNo: txt }))}
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.fieldLabel}>Area / Street</Text>
                                        <TextInput
                                            style={styles.fieldInput}
                                            placeholder="Sector 12"
                                            placeholderTextColor="#ADADAD"
                                            value={addressForm.area}
                                            onChangeText={(txt) => setAddressForm(prev => ({ ...prev, area: txt }))}
                                        />
                                    </View>
                                </View>

                                <Text style={styles.fieldLabel}>Landmark (Optional)</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder="Near Apollo Hospital"
                                    placeholderTextColor="#ADADAD"
                                    value={addressForm.landmark}
                                    onChangeText={(txt) => setAddressForm(prev => ({ ...prev, landmark: txt }))}
                                />

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.fieldLabel}>City</Text>
                                        <TextInput
                                            style={styles.fieldInput}
                                            placeholder="New Delhi"
                                            placeholderTextColor="#ADADAD"
                                            value={addressForm.city}
                                            onChangeText={(txt) => setAddressForm(prev => ({ ...prev, city: txt }))}
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.fieldLabel}>State</Text>
                                        <TextInput
                                            style={styles.fieldInput}
                                            placeholder="Delhi"
                                            placeholderTextColor="#ADADAD"
                                            value={addressForm.state}
                                            onChangeText={(txt) => setAddressForm(prev => ({ ...prev, state: txt }))}
                                        />
                                    </View>
                                </View>

                                <Text style={styles.fieldLabel}>Pincode</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder="110001"
                                    placeholderTextColor="#ADADAD"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={addressForm.pincode}
                                    onChangeText={(txt) => setAddressForm(prev => ({ ...prev, pincode: txt }))}
                                />
                            </View>

                            <Text style={styles.inputLabel}>Payment Method</Text>
                            <View style={styles.paymentContainer}>
                                {['UPI', 'Card', 'COD'].map((method) => (
                                    <TouchableOpacity
                                        key={method}
                                        style={[styles.paymentMethod, paymentMethod === method && styles.activePayment]}
                                        onPress={() => setPaymentMethod(method)}
                                    >
                                        <Ionicons
                                            name={method === 'UPI' ? 'phone-portrait-outline' : method === 'Card' ? 'card-outline' : 'cash-outline'}
                                            size={22}
                                            color={paymentMethod === method ? '#FFF' : '#1A1A2E'}
                                        />
                                        <Text style={[styles.paymentText, paymentMethod === method && styles.activePaymentText]}>{method}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.priceBreakdown}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Total Payable</Text>
                                    <Text style={styles.totalValue}>₹{cartService.getTotalPrice().toLocaleString()}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.finalOrderBtn}
                                onPress={handlePlaceOrder}
                            >
                                <LinearGradient
                                    colors={['#1A1A2E', '#16213E']}
                                    style={styles.placeOrderGradient}
                                >
                                    <Text style={styles.placeOrderText}>Place Order Now</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    backBtn: {
        marginLeft: -10,
        padding: 10,
    },
    listContent: {
        paddingVertical: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 3 },
            web: { boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }
        }),
    },
    imageContainer: {
        width: 90,
        height: 90,
        borderRadius: 16,
        backgroundColor: '#F1F3F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '80%',
        height: '80%',
    },
    details: {
        flex: 1,
        marginLeft: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    infoCol: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    variant: {
        fontSize: 13,
        color: '#6C757D',
        marginTop: 2,
    },
    variantValue: {
        fontWeight: '700',
        color: '#1A1A2E',
    },
    removeBtn: {
        padding: 4,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        padding: 4,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 8,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
        }),
    },
    qtyText: {
        paddingHorizontal: 12,
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    summaryCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 24,
        paddingTop: 24,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 15 },
            android: { elevation: 20 },
            web: { boxShadow: '0 -10px 15px rgba(0,0,0,0.05)' }
        }),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F3F5',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#e94560',
    },
    placeOrderBtn: {
        marginTop: 20,
        borderRadius: 18,
        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#e94560', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12 },
            android: { elevation: 8 },
            web: { boxShadow: '0 8px 12px rgba(233, 69, 96, 0.2)' }
        }),
    },
    placeOrderGradient: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    placeOrderText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
            android: { elevation: 5 },
            web: { boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }
        }),
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A2E',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    shopBtn: {
        backgroundColor: '#1A1A2E',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 15,
    },
    shopBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1A2E',
        marginBottom: 15,
        marginTop: 10,
    },
    addressForm: {
        gap: 15,
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6C757D',
        marginBottom: 6,
    },
    fieldInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#1A1A2E',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    paymentContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    paymentMethod: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    activePayment: {
        backgroundColor: '#1A1A2E',
        borderColor: '#1A1A2E',
    },
    paymentText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    activePaymentText: {
        color: '#FFF',
    },
    priceBreakdown: {
        marginTop: 10,
        marginBottom: 20,
    },
    finalOrderBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 10,
    },
});
