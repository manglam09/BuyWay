import { ImageZoomModal } from '@/components/ImageZoomModal';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../../components/ToastProvider';
import { mockProducts, Product, Review } from '../../../data/mockProducts';
import cartService from '../../../services/cartService';
import wishlistService from '../../../services/wishlistService';

const MAX_WIDTH = 1200;

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const product = mockProducts.find((p: Product) => p.id === id);

    const recommendedProducts = mockProducts
        .filter(p => p.category === product?.category && p.id !== product?.id)
        .slice(0, 4);

    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isWishlisted, setIsWishlisted] = useState(wishlistService.isInWishlist(product?.id || ''));
    const [cartCount, setCartCount] = useState(cartService.getItems().length);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [isSizeGuideVisible, setIsSizeGuideVisible] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || { name: 'Default', image: product?.image });

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

    const contentWidth = Math.min(width - 40, MAX_WIDTH);
    const isLargeScreen = width > 1000;

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
                contentContainerStyle={{ paddingBottom: insets.bottom + 110, alignItems: 'center' }}
            >
                {/* Header Actions - Fixed for both mobile & desktop */}
                <View style={[styles.topActions, { top: insets.top + 10, width: contentWidth }]}>
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

                {/* Main Product Layout */}
                <View style={[styles.mainLayout, { width: contentWidth, flexDirection: isLargeScreen ? 'row' : 'column', gap: 40 }]}>

                    {/* Image Section */}
                    <View style={[styles.imageWrapper, { width: isLargeScreen ? '50%' : '100%' }]}>
                        <View style={[styles.imageContainer, { backgroundColor: bgColor, borderRadius: 30, overflow: 'hidden' }]}>
                            <TouchableOpacity
                                style={styles.imageTapArea}
                                activeOpacity={0.9}
                                onPress={() => setIsImageViewerVisible(true)}
                            >
                                <Image
                                    source={{ uri: selectedColor.image }}
                                    style={styles.productImage}
                                    contentFit="contain"
                                    transition={500}
                                />
                                <View style={styles.zoomHint}>
                                    <Ionicons name="expand-outline" size={14} color="rgba(26,26,46,0.4)" />
                                    <Text style={styles.zoomHintText}>Tap to zoom</Text>
                                </View>
                            </TouchableOpacity>

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
                    </View>

                    {/* Info Section */}
                    <View style={[styles.infoWrapper, { width: isLargeScreen ? '50%' : '100%', paddingTop: isLargeScreen ? 60 : 0 }]}>
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
                                        <TouchableOpacity onPress={() => setIsSizeGuideVisible(true)}>
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

                            {/* Colors Selector */}
                            {product.colors && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>COLORS</Text>
                                    <View style={styles.colorVariantsGrid}>
                                        {product.colors.map((color, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.colorThumbnail,
                                                    selectedColor.name === color.name && styles.colorThumbnailActive
                                                ]}
                                                onPress={() => setSelectedColor(color)}
                                                activeOpacity={0.8}
                                            >
                                                <Image
                                                    source={{ uri: color.image }}
                                                    style={styles.colorThumbnailImage}
                                                    contentFit="cover"
                                                />
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

                            {/* Collapsible Info Sections */}
                            <View style={styles.accordionContainer}>
                                {[
                                    {
                                        id: 'details',
                                        title: 'DETAILS',
                                        content: '• 100% Premium Material\n• Breathable fabric\n• Reinforced stitching for durability\n• Modern fit design'
                                    },
                                    {
                                        id: 'delivery',
                                        title: 'DELIVERY',
                                        content: '• Free standard delivery on orders above ₹999\n• Estimated delivery: 3-5 business days\n• Express delivery available at checkout'
                                    },
                                    {
                                        id: 'returns',
                                        title: 'RETURNS',
                                        content: '• Easy 30-day return policy\n• Free returns for members\n• Items must be in original condition with tags'
                                    },
                                ].map((item) => (
                                    <View key={item.id} style={styles.accordionItem}>
                                        <TouchableOpacity
                                            style={styles.accordionHeader}
                                            onPress={() => setExpandedSection(expandedSection === item.id ? null : item.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.accordionTitle}>{item.title}</Text>
                                            <Ionicons
                                                name={expandedSection === item.id ? "remove" : "add"}
                                                size={20}
                                                color="#1A1A2E"
                                            />
                                        </TouchableOpacity>
                                        {expandedSection === item.id && (
                                            <View style={styles.accordionContent}>
                                                <Text style={styles.accordionText}>{item.content}</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
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

                            {/* Recommendations Section */}
                            {recommendedProducts.length > 0 && (
                                <View style={styles.recommendationsSection}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>You May Also Like</Text>
                                    </View>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.recommendationsScroll}
                                        contentContainerStyle={styles.recommendationsContent}
                                    >
                                        {recommendedProducts.map((item) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.recommendationCard}
                                                onPress={() => router.push({
                                                    pathname: "/(user)/product/[id]",
                                                    params: { id: item.id }
                                                })}
                                            >
                                                <View style={styles.recommendationImageContainer}>
                                                    <Image
                                                        source={{ uri: item.image }}
                                                        style={styles.recommendationImage}
                                                        contentFit="cover"
                                                    />
                                                    {item.badge && (
                                                        <View style={[styles.miniBadge, styles[`badge${item.badge}` as keyof typeof styles] as any]}>
                                                            <Text style={styles.miniBadgeText}>{item.badge.toUpperCase()}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.recommendationInfo}>
                                                    <Text style={styles.recommendationName} numberOfLines={1}>{item.name}</Text>
                                                    <Text style={styles.recommendationPrice}>₹{item.price.toLocaleString()}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <ImageZoomModal
                imageUri={product.image}
                isVisible={isImageViewerVisible}
                onClose={() => setIsImageViewerVisible(false)}
            />

            {/* Size Guide Modal */}
            <Modal
                visible={isSizeGuideVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsSizeGuideVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.guideModal}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Size Guide</Text>
                                <Text style={styles.modalSubtitle}>All measurements are in inches</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.closeModalBtn}
                                onPress={() => setIsSizeGuideVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#1A1A2E" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.tableContainer}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Size</Text>
                                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Chest</Text>
                                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Waist</Text>
                                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Length</Text>
                                </View>
                                {[
                                    { s: 'S', c: '36-38', w: '30-32', l: '27' },
                                    { s: 'M', c: '38-40', w: '32-34', l: '28' },
                                    { s: 'L', c: '41-43', w: '35-37', l: '29' },
                                    { s: 'XL', c: '44-46', w: '38-40', l: '30' },
                                    { s: 'XXL', c: '47-49', w: '41-43', l: '31' },
                                ].map((row, idx) => (
                                    <View
                                        key={row.s}
                                        style={[
                                            styles.tableRow,
                                            idx % 2 === 0 && { backgroundColor: '#F8F9FA' }
                                        ]}
                                    >
                                        <Text style={[styles.tableCell, { flex: 1, fontWeight: '700' }]}>{row.s}</Text>
                                        <Text style={[styles.tableCell, { flex: 1 }]}>{row.c}</Text>
                                        <Text style={[styles.tableCell, { flex: 1 }]}>{row.w}</Text>
                                        <Text style={[styles.tableCell, { flex: 1 }]}>{row.l}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.howToMeasure}>
                                <Text style={styles.measureTitle}>How to measure?</Text>
                                <View style={styles.measureItem}>
                                    <View style={styles.measureBullet} />
                                    <Text style={styles.measureText}>
                                        <Text style={{ fontWeight: '700' }}>Chest: </Text>
                                        Measure around the fullest part of your chest, keeping the tape horizontal.
                                    </Text>
                                </View>
                                <View style={styles.measureItem}>
                                    <View style={styles.measureBullet} />
                                    <Text style={styles.measureText}>
                                        <Text style={{ fontWeight: '700' }}>Waist: </Text>
                                        Measure around the narrowest part of your waistline.
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.gotItBtn}
                                onPress={() => setIsSizeGuideVisible(false)}
                            >
                                <Text style={styles.gotItText}>Got it</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Premium Action Tab */}
            <View style={[styles.actionTab, { paddingBottom: Math.max(insets.bottom, 20) + 12, alignItems: 'center' }]}>
                <View style={[styles.tabContent, { width: contentWidth }]}>
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
        </View >
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
    mainLayout: {
        marginTop: 60,
    },
    imageWrapper: {
        zIndex: 5,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    topActions: {
        position: 'absolute',
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 4 },
            web: { boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' }
        }),
    },
    imageTapArea: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomHint: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    zoomHintText: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(26,26,46,0.5)',
        textTransform: 'uppercase',
        letterSpacing: 1,
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
    },
    badge: {
        position: 'absolute',
        top: 24,
        right: 24,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 3 },
            web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
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
    infoWrapper: {},
    contentSection: {
        paddingHorizontal: 0,
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
            web: { boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }
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
            web: { boxShadow: '0 4px 8px rgba(26, 26, 46, 0.3)' }
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
            web: { boxShadow: '0 -10px 15px rgba(0,0,0,0.05)' }
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
            web: { boxShadow: '0 8px 12px rgba(26, 26, 46, 0.2)' }
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    guideModal: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    modalSubtitle: {
        fontSize: 13,
        color: '#6C757D',
        marginTop: 4,
        fontWeight: '500',
    },
    closeModalBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableContainer: {
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#F1F3F5',
        borderRadius: 16,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1A1A2E',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    tableHeaderText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    tableCell: {
        fontSize: 13,
        color: '#495057',
        textAlign: 'center',
    },
    howToMeasure: {
        marginTop: 30,
        backgroundColor: '#F8F9FA',
        padding: 20,
        borderRadius: 20,
    },
    measureTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A1A2E',
        marginBottom: 16,
    },
    measureItem: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 12,
    },
    measureBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#e94560',
        marginTop: 7,
    },
    measureText: {
        flex: 1,
        fontSize: 14,
        color: '#6C757D',
        lineHeight: 20,
    },
    gotItBtn: {
        backgroundColor: '#1A1A2E',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
    },
    gotItText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    accordionContainer: {
        marginTop: 10,
        marginBottom: 30,
        borderTopWidth: 1,
        borderColor: '#F1F3F5',
    },
    accordionItem: {
        borderBottomWidth: 1,
        borderColor: '#F1F3F5',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    accordionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A2E',
        letterSpacing: 0.5,
    },
    accordionContent: {
        paddingBottom: 20,
    },
    accordionText: {
        fontSize: 14,
        color: '#6C757D',
        lineHeight: 22,
    },
    colorVariantsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 15,
    },
    colorThumbnail: {
        width: 80,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: '#FFF',
    },
    colorThumbnailActive: {
        borderColor: '#e94560',
    },
    colorThumbnailImage: {
        width: '100%',
        height: '100%',
    },
    recommendationsSection: {
        marginTop: 20,
        marginBottom: 10,
    },
    recommendationsScroll: {
        marginLeft: -4, // Counteract card margin for alignment
    },
    recommendationsContent: {
        paddingRight: 20,
        gap: 15,
        paddingVertical: 10,
    },
    recommendationCard: {
        width: 160,
        backgroundColor: '#FFF',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F3F5',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
        }),
    },
    recommendationImageContainer: {
        width: '100%',
        height: 140,
        backgroundColor: '#F8F9FA',
        position: 'relative',
    },
    recommendationImage: {
        width: '100%',
        height: '100%',
    },
    recommendationInfo: {
        padding: 10,
        gap: 4,
    },
    recommendationName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    recommendationPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: '#e94560',
    },
    miniBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    miniBadgeText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '900',
    },
});
