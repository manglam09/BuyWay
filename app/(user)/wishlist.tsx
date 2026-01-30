import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../components/ToastProvider';
import { Product } from '../../data/mockProducts';
import cartService from '../../services/cartService';
import wishlistService from '../../services/wishlistService';

const MAX_WIDTH = 1200;
const COLUMN_GAP = 20;

export default function WishlistScreen() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

    useEffect(() => {
        const unsubscribe = wishlistService.subscribe((items) => {
            setWishlistItems(items);
        });
        return unsubscribe;
    }, []);

    // Responsive grid calculation
    const isLargeScreen = width > 768;
    const isTablet = width > 480 && width <= 768;
    const numColumns = isLargeScreen ? 4 : 2;
    const contentWidth = Math.min(width, MAX_WIDTH);
    const horizontalMargin = width > 480 ? 40 : 20;
    const availableWidth = contentWidth - horizontalMargin;
    const cardWidth = (availableWidth - (COLUMN_GAP * (numColumns - 1))) / numColumns;

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Men': return '#E0F2FE';
            case 'Women': return '#FDF2F8';
            case 'Kids': return '#FEF2F2';
            default: return '#F1F3F5';
        }
    };

    const renderWishlistItem = ({ item }: { item: Product }) => {
        const bgColor = getCategoryColor(item.category);

        return (
            <TouchableOpacity
                style={[styles.card, { width: cardWidth }]}
                activeOpacity={0.9}
                onPress={() => router.push({
                    pathname: "/(user)/product/[id]",
                    params: { id: item.id }
                })}
            >
                <View style={[styles.imageContainer, { backgroundColor: bgColor }]}>
                    <Image source={{ uri: item.image }} style={styles.image} contentFit="contain" />
                    <TouchableOpacity
                        style={styles.removeIconBtn}
                        onPress={(e) => {
                            e.stopPropagation();
                            wishlistService.toggleWishlist(item);
                            showToast('Removed from favorites', 'info');
                        }}
                    >
                        <Ionicons name="close" size={18} color="#1A1A2E" />
                    </TouchableOpacity>
                    {item.badge && (
                        <View style={[styles.badge, styles[`badge${item.badge}` as keyof typeof styles] as any]}>
                            <Text style={styles.badgeText}>{item.badge.toUpperCase()}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.info}>
                    <Text style={styles.category}>{item.category}</Text>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
                        <TouchableOpacity
                            style={styles.addSmallBtn}
                            onPress={(e) => {
                                e.stopPropagation();
                                cartService.addToCart(item);
                                showToast('Added to your bag!', 'success');
                            }}
                        >
                            <Ionicons name="cart-outline" size={18} color="#1A1A2E" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Your Favorites',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#F8F9FA' },
                    headerTitleStyle: { fontWeight: '800', color: '#1A1A2E', fontSize: 20 },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRightContainer}>
                            <Text style={styles.totalItemsText}>Total Items: {wishlistItems.length}</Text>
                        </View>
                    )
                }}
            />

            <View style={{ flex: 1, alignItems: 'center' }}>
                {wishlistItems.length === 0 ? (
                    <View style={[styles.emptyContainer, { width: contentWidth }]}>
                        <View style={styles.emptyIllustration}>
                            <LinearGradient
                                colors={['#FFF', '#F1F3F5']}
                                style={styles.emptyCircle}
                            >
                                <Ionicons name="heart-outline" size={60} color="#e94560" />
                            </LinearGradient>
                            <View style={styles.emptyDash1} />
                            <View style={styles.emptyDash2} />
                        </View>
                        <Text style={styles.emptyTitle}>Nothing here yet</Text>
                        <Text style={styles.emptySubtitle}>Start hearting your favorites to see them here!</Text>
                        <TouchableOpacity
                            style={styles.exploreBtn}
                            onPress={() => router.replace('/(user)/home')}
                        >
                            <Text style={styles.exploreBtnText}>Go Shopping</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={wishlistItems}
                            renderItem={renderWishlistItem}
                            keyExtractor={(item) => item.id}
                            numColumns={numColumns}
                            key={`numColumns-${numColumns}`}
                            columnWrapperStyle={numColumns > 1 ? { gap: COLUMN_GAP } : undefined}
                            style={{ width: contentWidth, alignSelf: 'center' }}
                            contentContainerStyle={[
                                styles.listContent,
                                { paddingBottom: insets.bottom + 120, paddingHorizontal: horizontalMargin / 2 }
                            ]}
                            showsVerticalScrollIndicator={false}
                        />

                        {/* Bottom Checkout Bar */}
                        <View style={[styles.bottomBar, { width: width, paddingBottom: Math.max(insets.bottom, 20) + 10, alignItems: 'center' }]}>
                            <LinearGradient
                                colors={['#1A1A2E', '#16213E']}
                                style={[styles.checkoutBarGradient, { width: contentWidth - horizontalMargin }]}
                            >
                                <View style={styles.totalInfo}>
                                    <Text style={styles.totalLabel}>Subtotal</Text>
                                    <Text style={styles.totalPrice}>
                                        ₹{wishlistItems.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.mainCheckoutBtn} activeOpacity={0.8}>
                                    <Text style={styles.mainCheckoutBtnText}>Checkout All</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#1A1A2E" />
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </>
                )}
            </View>
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
    headerRightContainer: {
        marginRight: 15,
    },
    totalItemsText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6C757D',
    },
    listContent: {
        paddingVertical: 24,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
            android: { elevation: 3 },
            web: { boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }
        }),
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 0.85,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    image: {
        width: '80%',
        height: '80%',
    },
    removeIconBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    badge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgenew: { backgroundColor: '#10b981' },
    badgesale: { backgroundColor: '#e94560' },
    badgetrending: { backgroundColor: '#f59e0b' },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#FFF',
    },
    info: {
        padding: 14,
    },
    category: {
        fontSize: 10,
        fontWeight: '700',
        color: '#ADADAD',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    addSmallBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
    },
    checkoutBarGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 24,
        ...Platform.select({
            ios: { shadowColor: '#1A1A2E', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
            android: { elevation: 10 },
            web: { boxShadow: '0 10px 20px rgba(26, 26, 46, 0.2)' }
        }),
    },
    totalInfo: {
        flex: 1,
    },
    totalLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '600',
    },
    totalPrice: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        marginTop: 2,
    },
    mainCheckoutBtn: {
        backgroundColor: '#FFF',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mainCheckoutBtnText: {
        color: '#1A1A2E',
        fontSize: 14,
        fontWeight: '800',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 50,
    },
    emptyIllustration: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative',
    },
    emptyCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
            android: { elevation: 5 },
            web: { boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }
        }),
    },
    emptyDash1: {
        position: 'absolute',
        top: 20,
        right: 10,
        width: 12,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#e94560',
        opacity: 0.3,
        transform: [{ rotate: '45deg' }],
    },
    emptyDash2: {
        position: 'absolute',
        bottom: 25,
        left: 5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#feca57',
        opacity: 0.3,
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
        marginBottom: 32,
    },
    exploreBtn: {
        backgroundColor: '#1A1A2E',
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        ...Platform.select({
            ios: { shadowColor: '#1A1A2E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12 },
            android: { elevation: 6 },
            web: { boxShadow: '0 8px 12px rgba(26, 26, 46, 0.2)' }
        }),
    },
    exploreBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
