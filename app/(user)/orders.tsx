import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import orderService, { Order } from '../../services/orderService';

const MAX_WIDTH = 1200;

export default function OrdersScreen() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');

    useEffect(() => {
        const unsubscribe = orderService.subscribe((newOrders) => {
            setOrders(newOrders);
        });
        return unsubscribe;
    }, []);

    const contentWidth = Math.min(width - 40, MAX_WIDTH);

    const filteredOrders = orders.filter(order =>
        activeTab === 'Active' ? (order.status !== 'Delivered' && order.status !== 'Cancelled') : (order.status === 'Delivered' || order.status === 'Cancelled')
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Processing': return '#f59e0b';
            case 'Shipped': return '#3b82f6';
            case 'Delivered': return '#10b981';
            case 'Cancelled': return '#ef4444';
            default: return '#6C757D';
        }
    };

    const renderOrderItem = ({ item }: { item: Order }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderId}>{item.id}</Text>
                    <Text style={styles.orderDate}>{item.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.itemsPreview}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {item.items.map((product, idx) => (
                        <View key={idx} style={styles.itemThumbContainer}>
                            <Image source={{ uri: product.image }} style={styles.itemThumb} contentFit="cover" />
                            {product.quantity > 1 && (
                                <View style={styles.qtyBadge}>
                                    <Text style={styles.qtyBadgeText}>x{product.quantity}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.orderFooter}>
                <View>
                    <Text style={styles.footerLabel}>Total Amount</Text>
                    <Text style={styles.footerValue}>₹{item.totalAmount.toLocaleString()}</Text>
                </View>
                <TouchableOpacity style={styles.detailsBtn}>
                    <Text style={styles.detailsBtnText}>Track Order</Text>
                    <Ionicons name="location-outline" size={14} color="#1A1A2E" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={[styles.headerWrapper, { width: contentWidth }]}>
                    <Text style={styles.headerTitle}>My Orders</Text>

                    {/* Tabs */}
                    <View style={styles.tabBar}>
                        {['Active', 'History'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeTab === tab && styles.activeTab]}
                                onPress={() => setActiveTab(tab as any)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                                {activeTab === tab && <View style={styles.activeIndicator} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <View style={{ flex: 1, alignItems: 'center' }}>
                {filteredOrders.length === 0 ? (
                    <View style={[styles.emptyContainer, { width: contentWidth }]}>
                        <View style={styles.emptyIllustration}>
                            <LinearGradient colors={['#F8F9FA', '#E9ECEF']} style={styles.emptyCircle}>
                                <Ionicons name="receipt-outline" size={60} color="#ADADAD" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.emptyTitle}>No {activeTab} Orders</Text>
                        <Text style={styles.emptySubtitle}>
                            {activeTab === 'Active'
                                ? "You don't have any orders in progress right now."
                                : "Your order history will appear here once you complete a purchase."}
                        </Text>
                        <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace('/(user)/home')}>
                            <Text style={styles.shopBtnText}>Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filteredOrders}
                        renderItem={renderOrderItem}
                        keyExtractor={(item) => item.id}
                        style={{ width: contentWidth }}
                        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(user)/home')}>
                    <Ionicons name="home-outline" size={22} color="#6C757D" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(user)/explore')}>
                    <Ionicons name="grid-outline" size={22} color="#6C757D" />
                    <Text style={styles.navText}>Explore</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="bag-handle" size={22} color="#e94560" />
                    <Text style={[styles.navText, styles.navTextActive]}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(user)/profile')}>
                    <Ionicons name="person-outline" size={22} color="#6C757D" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15 },
            android: { elevation: 5 },
            web: { boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }
        }),
    },
    headerWrapper: { width: '100%' },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1A1A2E',
        marginBottom: 20,
    },
    tabBar: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    tab: {
        marginRight: 30,
        paddingVertical: 10,
        position: 'relative',
    },
    activeTab: {},
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ADADAD',
    },
    activeTabText: {
        color: '#1A1A2E',
        fontWeight: '800',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#e94560',
        borderRadius: 3,
    },
    listContent: {
        paddingVertical: 20,
    },
    orderCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 3 },
            web: { boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }
        }),
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    orderId: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    orderDate: {
        fontSize: 12,
        color: '#ADADAD',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    itemsPreview: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F8F9FA',
        paddingVertical: 15,
        marginBottom: 15,
    },
    itemThumbContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        marginRight: 10,
        padding: 5,
        position: 'relative',
    },
    itemThumb: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    qtyBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#1A1A2E',
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    qtyBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '800',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 12,
        color: '#6C757D',
        fontWeight: '600',
    },
    footerValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1A2E',
        marginTop: 2,
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    detailsBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIllustration: {
        marginBottom: 24,
    },
    emptyCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A2E',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    shopBtn: {
        backgroundColor: '#1A1A2E',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 15,
    },
    shopBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F1F1',
        paddingTop: 12,
        paddingHorizontal: 24,
        ...Platform.select({
            web: { boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }
        }),
        elevation: 10,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    navText: {
        fontSize: 11,
        color: '#6C757D',
        fontWeight: '500',
    },
    navTextActive: {
        color: '#e94560',
    },
});
