import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../../components/ToastProvider';
import { mockProducts, Product, Review } from '../../../data/mockProducts';
import cartService from '../../../services/cartService';
import wishlistService from '../../../services/wishlistService';

const { width } = Dimensions.get('window');

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const product = mockProducts.find((p: Product) => p.id === id);

    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isWishlisted, setIsWishlisted] = useState(wishlistService.isInWishlist(product?.id || ''));
    const [cartCount, setCartCount] = useState(cartService.getItems().length);

    useEffect(() => {
        const unsubscribeWishlist = wishlistService.subscribe(() => {
            if (product) {
                setIsWishlisted(wishlistService.isInWishlist(product.id));
            }
        });
        const unsubscribeCart = cartService.subscribe((items) => {
            setCartCount(items.length);
        });
        return () => {
            unsubscribeWishlist();
            unsubscribeCart();
        };
    }, [product?.id]);

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#ADADAD" />
                <Text style={styles.errorText}>Product not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Back to Shop</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Men': return '#E0F2FE';
            case 'Women': return '#FDF2F8';
            case 'Kids': return '#FEF2F2';
            default: return '#F1F3F5';
        }
    };

    const bgColor = getCategoryColor(product.category);

    const handleAddToCart = () => {
        if (product.sizes && !selectedSize) {
            showToast('Please select a size first', 'error');
            return;
        }

        cartService.addToCart(product, selectedSize || undefined);
        showToast('Added to your bag!', 'success');
    };

    const handleBuyNow = () => {
        if (product.sizes && !selectedSize) {
            showToast('Please select a size first', 'error');
            return;
        }

        cartService.addToCart(product, selectedSize || undefined);
        router.push({ pathname: "/(user)/cart" });
    };

    const handleWishlistToggle = () => {
        if (product) {
            const added = wishlistService.toggleWishlist(product);
            showToast(added ? 'Added to favorites!' : 'Removed from favorites', 'info');
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
            >
                {/* Immersive Image Header */}
                <View style={[styles.imageContainer, { backgroundColor: bgColor }]}>
                    <View style={[styles.topActions, { top: insets.top + 10 }]}>
                        <TouchableOpacity
                            style={styles.headerIconButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
                        </TouchableOpacity>
                        <View style={styles.rightHeaderActions}>
                            <TouchableOpacity
                                style={styles.headerIconButton}
                                onPress={() => router.push({ pathname: "/(user)/cart" })}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="cart-outline" size={24} color="#1A1A2E" />
                                {cartCount > 0 && (
                                    <View style={styles.headerBadge}>
                                        <Text style={styles.headerBadgeText}>{cartCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.headerIconButton}
                                onPress={handleWishlistToggle}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isWishlisted ? "heart" : "heart-outline"}
                                    size={24}
                                    color={isWishlisted ? "#e94560" : "#1A1A2E"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Image
                        source={{ uri: product.image }}
                        style={styles.productImage}
                        contentFit="cover"
                        transition={500}
                        placeholder={{ blurhash: 'L6PZfS.AyE_p.AyD?jt7D%OO2ghu' }}
                    />

                    {product.badge && (
                        <View style={[styles.badge, styles[`badge${product.badge}` as keyof typeof styles] as any]}>
                            <Text style={styles.badgeText}>{product.badge.toUpperCase()}</Text>
                        </View>
                    )}

                    <LinearGradient
                        colors={['transparent', 'rgba(248, 249, 250, 0.2)', 'rgba(248, 249, 250, 0.8)', '#F8F9FA']}
                        style={styles.imageOverlay}
                    />
                </View>

                {/* Content Section */}
                <View style={styles.contentSection}>
                    <View style={styles.mainInfo}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{product.category}</Text>
                        </View>
                        <Text style={styles.productName}>{product.name}</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.currentPrice}>₹{product.price.toLocaleString()}</Text>
                            {product.originalPrice && (
                                <Text style={styles.oldPrice}>₹{product.originalPrice.toLocaleString()}</Text>
                            )}
                            {product.originalPrice && (
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>
                                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Stats Bar */}
                    <View style={styles.statsBar}>
                        <View style={styles.statItem}>
                            <Ionicons name="star" size={16} color="#feca57" />
                            <Text style={styles.statLabel}>{product.rating}</Text>
                            <Text style={styles.statSub}>Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Ionicons name="chatbubble-outline" size={16} color="#6C757D" />
                            <Text style={styles.statLabel}>{product.reviews}</Text>
                            <Text style={styles.statSub}>Reviews</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Ionicons name="shield-checkmark-outline" size={16} color="#10b981" />
                            <Text style={styles.statLabel}>Quality</Text>
                            <Text style={styles.statSub}>Assured</Text>
                        </View>
                    </View>

                    {/* Size Selector */}
                    {product.sizes && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Select Size</Text>
                                <TouchableOpacity>
                                    <Text style={styles.guideText}>Size Guide</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.sizeGrid}>
                                {product.sizes.map((size: string) => (
                                    <TouchableOpacity
                                        key={size}
                                        style={[
                                            styles.sizeBox,
                                            selectedSize === size && styles.sizeBoxActive
                                        ]}
                                        onPress={() => setSelectedSize(size)}
                                        activeOpacity={0.6}
                                    >
                                        <Text style={[
                                            styles.sizeLabel,
                                            selectedSize === size && styles.sizeLabelActive
                                        ]}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>

                    {/* Detailed Reviews */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Customer Reviews</Text>
                            <TouchableOpacity style={styles.writeReviewButton}>
                                <Text style={styles.writeReviewText}>Write a review</Text>
                            </TouchableOpacity>
                        </View>

                        {product.detailedReviews?.map((review: Review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewUserRow}>
                                    <View style={styles.avatarContainer}>
                                        <LinearGradient
                                            colors={['#E0F2FE', '#BAE6FD']}
                                            style={styles.avatarGradient}
                                        >
                                            <Text style={styles.avatarInitial}>{review.userName[0]}</Text>
                                        </LinearGradient>
                                    </View>
                                    <View style={styles.reviewUserInfo}>
                                        <Text style={styles.reviewUserName}>{review.userName}</Text>
                                        <View style={styles.reviewRatingRow}>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Ionicons
                                                    key={s}
                                                    name={s <= review.rating ? "star" : "star-outline"}
                                                    size={10}
                                                    color="#feca57"
                                                />
                                            ))}
                                            <Text style={styles.reviewDate}> • {review.date}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.reviewText}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Premium Action Tab */}
            <View style={[styles.actionTab, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
                <View style={styles.tabContent}>
                    <TouchableOpacity
                        style={styles.secondaryActionButton}
                        activeOpacity={0.8}
                        onPress={handleAddToCart}
                    >
                        <Ionicons name="bag-add-outline" size={20} color="#1A1A2E" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.mainActionButton}
                        activeOpacity={0.9}
                        onPress={handleBuyNow}
                    >
                        <LinearGradient
                            colors={['#1A1A2E', '#16213E']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.actionGradient}
                        >
                            <Text style={styles.actionBtnText}>Buy Now</Text>
                            <Ionicons name="chevron-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 18,
        color: '#1A1A2E',
        fontWeight: '700',
        marginTop: 16,
    },
    backButton: {
        marginTop: 24,
        paddingHorizontal: 30,
        paddingVertical: 12,
        backgroundColor: '#1A1A2E',
        borderRadius: 12,
    },
    backButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    imageContainer: {
        width: width,
        height: width * 1.3,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    topActions: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    rightHeaderActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#e94560',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    headerBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '900',
    },
    headerIconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    productImage: {
        width: '85%',
        height: '85%',
        resizeMode: 'contain',
    },
    badge: {
        position: 'absolute',
        bottom: 110,
        right: 24,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 3 },
        }),
    },
    badgenew: { backgroundColor: '#10b981' },
    badgesale: { backgroundColor: '#e94560' },
    badgetrending: { backgroundColor: '#f59e0b' },
    badgeText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    contentSection: {
        paddingHorizontal: 24,
        marginTop: -10,
    },
    mainInfo: {
        marginBottom: 24,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(26, 26, 46, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
        marginBottom: 10,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1A1A2E',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    productName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1A1A2E',
        lineHeight: 34,
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    currentPrice: {
        fontSize: 26,
        fontWeight: '900',
        color: '#e94560',
    },
    oldPrice: {
        fontSize: 16,
        color: '#ADADAD',
        textDecorationLine: 'line-through',
        marginTop: 4,
    },
    discountBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#10b981',
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        justifyContent: 'space-between',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 2 },
        }),
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#F1F3F5',
    },
    statLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A1A2E',
        marginTop: 2,
    },
    statSub: {
        fontSize: 11,
        color: '#6C757D',
        fontWeight: '600',
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    guideText: {
        fontSize: 13,
        color: '#e94560',
        fontWeight: '700',
    },
    sizeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sizeBox: {
        minWidth: 54,
        height: 54,
        borderRadius: 14,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
    },
    sizeBoxActive: {
        backgroundColor: '#1A1A2E',
        borderColor: '#1A1A2E',
        ...Platform.select({
            ios: { shadowColor: '#1A1A2E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
            android: { elevation: 6 },
        }),
    },
    sizeLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    sizeLabelActive: {
        color: '#FFF',
    },
    descriptionText: {
        fontSize: 15,
        color: '#6C757D',
        lineHeight: 24,
        fontWeight: '500',
    },
    writeReviewButton: {
        backgroundColor: 'rgba(233, 69, 96, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    writeReviewText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#e94560',
    },
    reviewCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F3F5',
    },
    reviewUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    avatarGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0284c7',
    },
    reviewUserInfo: {
        flex: 1,
    },
    reviewUserName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 2,
    },
    reviewRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewDate: {
        fontSize: 11,
        color: '#ADADAD',
        fontWeight: '600',
    },
    reviewText: {
        fontSize: 14,
        color: '#495057',
        lineHeight: 20,
        fontWeight: '500',
    },
    actionTab: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 15 },
            android: { elevation: 20 },
        }),
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    secondaryActionButton: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
    },
    mainActionButton: {
        flex: 1,
        height: 60,
        borderRadius: 18,
        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#1A1A2E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12 },
            android: { elevation: 8 },
        }),
    },
    actionGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    btnIcon: {
        marginTop: -2,
    },
});
