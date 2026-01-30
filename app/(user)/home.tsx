import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../components/ToastProvider';
import { mockBrands, mockCategories, Product } from '../../data/mockProducts';
import authService from '../../services/authService';
import cartService from '../../services/cartService';
import productService from '../../services/productService';
import settingsService, { AppSettings } from '../../services/settingsService';
import wishlistService from '../../services/wishlistService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40 - 15) / 2; // (Screen - ScrollView Padding - Gap) / 2

export default function UserHome() {
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [appSettings, setAppSettings] = useState<AppSettings>(settingsService.getSettings());

    // Filter & Sort State
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [sortBy, setSortBy] = useState<'recommended' | 'priceLow' | 'priceHigh' | 'newest'>('recommended');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [products, setProducts] = useState<Product[]>([]);
    const [timeLeft, setTimeLeft] = useState(8 * 3600 + 45 * 60 + 22);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const unsubscribeWishlist = wishlistService.subscribe((items) => {
            setWishlistCount(items.length);
        });
        const unsubscribeCart = cartService.subscribe((items) => {
            setCartCount(items.length);
        });
        const unsubscribeProducts = productService.subscribe((updatedProducts) => {
            setProducts(updatedProducts);
        });
        const unsubscribeSettings = settingsService.subscribe((settings) => {
            setAppSettings(settings);
        });
        return () => {
            unsubscribeWishlist();
            unsubscribeCart();
            unsubscribeProducts();
            unsubscribeSettings();
        };
    }, []);

    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
            return matchesSearch && matchesCategory && matchesPrice;
        })
        .sort((a, b) => {
            if (sortBy === 'priceLow') return a.price - b.price;
            if (sortBy === 'priceHigh') return b.price - a.price;
            if (sortBy === 'newest') return (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0);
            return 0; // Default: Recommended (Mocked)
        });

    const handleLogout = async () => {
        await authService.logout();
        router.replace('/');
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Men': return '#E0F2FE'; // Specific pastel blue
            case 'Women': return '#FDF2F8'; // Specific pastel pink
            case 'Kids': return '#FEF2F2'; // Specific pastel red
            default: return '#F1F3F5'; // Fallback
        }
    };

    const renderProductCard = ({ item }: { item: Product; index: number }) => {
        const bgColor = getCategoryColor(item.category);

        return (
            <TouchableOpacity
                style={styles.productCard}
                activeOpacity={0.9}
                onPress={() => router.push({
                    pathname: "/(user)/product/[id]",
                    params: { id: item.id }
                })}
            >
                <View style={[styles.imageContainer, { backgroundColor: bgColor }]}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.productImage}
                        contentFit="cover"
                        transition={300}
                        placeholder={{ blurhash: 'L6PZfS.AyE_p.AyD?jt7D%OO2ghu' }}
                    />
                    {item.badge && (
                        <View style={[styles.badge, styles[`badge${item.badge}` as keyof typeof styles] as any]}>
                            <Text style={styles.badgeText}>{item.badge.toUpperCase()}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.wishlistButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            const added = wishlistService.toggleWishlist(item);
                            showToast(added ? 'Saved to favorites' : 'Removed from favorites', 'info');
                        }}
                    >
                        <Ionicons
                            name={wishlistService.isInWishlist(item.id) ? "heart" : "heart-outline"}
                            size={18}
                            color="#e94560"
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productCategory}>{item.category}</Text>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#feca57" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                        <Text style={styles.reviewText}>({item.reviews})</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
                        {item.originalPrice && (
                            <Text style={styles.originalPrice}>₹{item.originalPrice.toLocaleString()}</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitleContainer}>
                        <Image
                            source={appSettings.appLogo ? { uri: appSettings.appLogo } : require('../../assets/images/logo.png')}
                            style={styles.appLogo}
                        />
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.appName}>{appSettings.appName}</Text>
                            <Text style={styles.userGreeting}>Hello, John Doe 👋</Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push({ pathname: "/(user)/wishlist" })}
                        >
                            <Ionicons name="heart-outline" size={22} color="#1A1A2E" />
                            {wishlistCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>{wishlistCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push({ pathname: "/(user)/cart" })}
                        >
                            <Ionicons name="cart-outline" size={22} color="#1A1A2E" />
                            {cartCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>{cartCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, styles.logoutButton]} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#6C757D" />
                    <TextInput
                        style={[styles.searchInput, { outlineWidth: 0 } as any]}
                        placeholder="Search for clothes..."
                        placeholderTextColor="#ADADAD"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoComplete="off"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setIsFilterVisible(true)}
                    >
                        <Ionicons name="options-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Active Filter Chips */}
                {(selectedCategory || sortBy !== 'recommended' || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                    <View style={styles.activeFiltersContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
                            {selectedCategory && (
                                <View style={styles.appliedChip}>
                                    <Text style={styles.appliedChipText}>{selectedCategory}</Text>
                                    <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.appliedChipClose}>
                                        <Ionicons name="close-circle" size={16} color="#e94560" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {sortBy !== 'recommended' && (
                                <View style={styles.appliedChip}>
                                    <Text style={styles.appliedChipText}>
                                        {sortBy === 'priceLow' ? 'Price: Low' : sortBy === 'priceHigh' ? 'Price: High' : 'Newest'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setSortBy('recommended')} style={styles.appliedChipClose}>
                                        <Ionicons name="close-circle" size={16} color="#e94560" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {(priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                                <View style={styles.appliedChip}>
                                    <Text style={styles.appliedChipText}>
                                        {priceRange[1] <= 1000 ? 'Under ₹1k' : priceRange[0] >= 3000 ? 'Above ₹3k' : '₹1k - ₹3k'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setPriceRange([0, 10000])} style={styles.appliedChipClose}>
                                        <Ionicons name="close-circle" size={16} color="#e94560" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.clearAllBtn}
                                onPress={() => {
                                    setSelectedCategory(null);
                                    setSortBy('recommended');
                                    setPriceRange([0, 10000]);
                                }}
                            >
                                <Text style={styles.clearAllText}>Clear All</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                {/* New Arrivals Section (Premium Vertical Cards) */}
                <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                    <View>
                        <Text style={styles.sectionTitle}>New Arrivals</Text>
                        <Text style={styles.sectionSubtitle}>Fresh styles just for you</Text>
                    </View>
                    <TouchableOpacity style={styles.viewAllBtn}>
                        <Text style={styles.viewAllText}>View All</Text>
                        <Ionicons name="arrow-forward" size={14} color="#e94560" />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.newArrivalsScroll}
                    contentContainerStyle={{ paddingRight: 24 }}
                >
                    {products.filter(p => p.badge === 'new' || p.badge === 'trending').map((item) => (
                        <TouchableOpacity
                            key={`new-${item.id}`}
                            style={styles.newArrivalCard}
                            activeOpacity={0.95}
                            onPress={() => router.push({
                                pathname: "/(user)/product/[id]",
                                params: { id: item.id }
                            })}
                        >
                            <Image
                                source={{ uri: item.image }}
                                style={styles.newArrivalImage}
                                contentFit="cover"
                                transition={400}
                                placeholder={{ blurhash: 'L6PZfS.AyE_p.AyD?jt7D%OO2ghu' }}
                            />

                            {/* Floating Action Buttons */}
                            <TouchableOpacity
                                style={styles.floatingWishlist}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    const added = wishlistService.toggleWishlist(item);
                                    showToast(added ? 'Added to Wishlist' : 'Removed', 'info');
                                }}
                            >
                                <Ionicons
                                    name={wishlistService.isInWishlist(item.id) ? "heart" : "heart-outline"}
                                    size={20}
                                    color="#e94560"
                                />
                            </TouchableOpacity>

                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.02)', 'rgba(0,0,0,0.85)']}
                                style={styles.newArrivalOverlay}
                            >
                                <View style={styles.newArrivalMeta}>
                                    <View style={styles.typeBadge}>
                                        <Text style={styles.typeBadgeText}>{item.category.toUpperCase()}</Text>
                                    </View>
                                    <Text style={styles.newArrivalName} numberOfLines={1}>{item.name}</Text>
                                    <View style={styles.newArrivalFooter}>
                                        <Text style={styles.newArrivalPrice}>₹{item.price.toLocaleString()}</Text>
                                        <View style={styles.ratingBadge}>
                                            <Ionicons name="star" size={10} color="#feca57" />
                                            <Text style={styles.ratingSmall}>{item.rating}</Text>
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>

                            {item.badge && (
                                <View style={[styles.statusBadge, item.badge === 'new' ? styles.newBadge : styles.trendingBadge]}>
                                    <Text style={styles.statusBadgeText}>{item.badge.toUpperCase()}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Categories */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Shop by Category</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                    <TouchableOpacity
                        style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                        onPress={() => setSelectedCategory(null)}
                    >
                        <Ionicons name="apps" size={18} color={!selectedCategory ? '#fff' : '#1A1A2E'} />
                        <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>All</Text>
                    </TouchableOpacity>
                    {mockCategories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryChip, selectedCategory === cat.name && styles.categoryChipActive]}
                            onPress={() => setSelectedCategory(cat.name)}
                        >
                            <Ionicons
                                name={cat.icon as any}
                                size={18}
                                color={selectedCategory === cat.name ? '#fff' : '#1A1A2E'}
                            />
                            <Text style={[styles.categoryChipText, selectedCategory === cat.name && styles.categoryChipTextActive]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Featured Promo Banner */}
                <TouchableOpacity style={styles.banner} activeOpacity={0.9}>
                    <LinearGradient
                        colors={['#1A1A2E', '#16213E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bannerGradient}
                    >
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerLabel}>Exclusive Flash Sale</Text>
                            <Text style={[styles.bannerTitle, { color: '#feca57' }]}>UP TO 50%</Text>
                            <Text style={styles.bannerSubtitle}>Limited time offer on winter gear</Text>
                            <View style={[styles.bannerButton, { backgroundColor: '#feca57' }]}>
                                <Text style={[styles.bannerButtonText, { color: '#1A1A2E' }]}>Claim Offer</Text>
                                <Ionicons name="flash" size={14} color="#1A1A2E" />
                            </View>
                        </View>
                        <View style={styles.bannerImageContainer}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1556821810-dfbc8a38b14e?w=200&q=80' }}
                                style={styles.bannerPromoImage}
                            />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Deal of the Day (Countdown Mock) */}
                <View style={styles.dealCard}>
                    <View style={styles.dealInfo}>
                        <Text style={styles.dealLabel}>Deal of the day</Text>
                        <Text style={styles.dealTime}>{formatTime(timeLeft)}</Text>
                    </View>
                    <View style={styles.dealPriceInfo}>
                        <Text style={styles.dealDiscount}>Extra 20% OFF</Text>
                        <Text style={styles.dealCondition}>On orders above ₹2000</Text>
                    </View>
                </View>

                {/* Popular Brands */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Popular Brands</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandsScroll}>
                    {mockBrands.map((brand) => (
                        <View key={brand.id} style={styles.brandContainer}>
                            <View style={styles.brandLogo}>
                                <Image
                                    source={{ uri: brand.logo }}
                                    style={styles.brandLogoImage}
                                    contentFit="contain"
                                    transition={200}
                                />
                            </View>
                            <Text style={styles.brandName}>{brand.name}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Products Grid */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    <TouchableOpacity onPress={() => setIsFilterVisible(true)}>
                        <Text style={styles.seeAll}>Sort & Filter</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.productsGrid}>
                    {filteredProducts.map((product, index) => (
                        <React.Fragment key={product.id}>
                            {renderProductCard({ item: product, index })}
                        </React.Fragment>
                    ))}
                </View>

                {filteredProducts.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ADADAD" />
                        <Text style={styles.emptyText}>No items match your filters</Text>
                        <TouchableOpacity
                            style={styles.resetBtn}
                            onPress={() => {
                                setSelectedCategory(null);
                                setPriceRange([0, 10000]);
                                setSortBy('recommended');
                            }}
                        >
                            <Text style={styles.resetBtnText}>Reset All Filters</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Filter Modal */}
            <Modal
                visible={isFilterVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsFilterVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.filterModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sort & Filter</Text>
                            <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                                <Ionicons name="close" size={24} color="#1A1A2E" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Sorting Options */}
                            <Text style={styles.filterSectionTitle}>Sort By</Text>
                            <View style={styles.sortOptions}>
                                {[
                                    { label: 'Recommended', value: 'recommended' },
                                    { label: 'Price: Low to High', value: 'priceLow' },
                                    { label: 'Price: High to Low', value: 'priceHigh' },
                                    { label: 'Newest Arrivals', value: 'newest' },
                                ].map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[styles.sortOption, sortBy === option.value && styles.activeSortOption]}
                                        onPress={() => setSortBy(option.value as any)}
                                    >
                                        <Text style={[styles.sortOptionText, sortBy === option.value && styles.activeSortOptionText]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Price Range */}
                            <Text style={styles.filterSectionTitle}>Price Range</Text>
                            <View style={styles.priceFilterContainer}>
                                <TouchableOpacity
                                    style={[styles.priceChip, priceRange[1] <= 1000 && styles.activePriceChip]}
                                    onPress={() => setPriceRange([0, 1000])}
                                >
                                    <Text style={[styles.priceChipText, priceRange[1] <= 1000 && styles.activePriceChipText]}>Under ₹1,000</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.priceChip, priceRange[0] >= 1000 && priceRange[1] <= 3000 && styles.activePriceChip]}
                                    onPress={() => setPriceRange([1000, 3000])}
                                >
                                    <Text style={[styles.priceChipText, priceRange[0] >= 1000 && priceRange[1] <= 3000 && styles.activePriceChipText]}>₹1k - ₹3k</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.priceChip, priceRange[0] >= 3000 && styles.activePriceChip]}
                                    onPress={() => setPriceRange([3000, 10000])}
                                >
                                    <Text style={[styles.priceChipText, priceRange[0] >= 3000 && styles.activePriceChipText]}>Above ₹3,000</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={() => setIsFilterVisible(false)}
                            >
                                <Text style={styles.applyBtnText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={22} color="#e94560" />
                    <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(user)/explore')}>
                    <Ionicons name="grid-outline" size={22} color="#6C757D" />
                    <Text style={styles.navText}>Explore</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(user)/orders')}>
                    <Ionicons name="bag-handle-outline" size={22} color="#6C757D" />
                    <Text style={styles.navText}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(user)/profile')}>
                    <Ionicons name="person-outline" size={22} color="#6C757D" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
            {/* Maintenance Lock Overlay */}
            <Modal visible={appSettings.maintenanceMode} animationType="fade" transparent={false}>
                <View style={styles.maintenanceOverlay}>
                    <LinearGradient colors={['#1A1A2E', '#16213E']} style={StyleSheet.absoluteFill} />
                    <Ionicons name="construct" size={80} color="#feca57" />
                    <Text style={styles.maintenanceTitle}>System Update</Text>
                    <Text style={styles.maintenanceText}>
                        {appSettings.appName} is currently undergoing scheduled maintenance to improve your experience. We'll be back shortly!
                    </Text>
                    <View style={styles.maintenanceBadge}>
                        <Text style={styles.maintenanceBadgeText}>EST. DOWNTIME: 20 MINS</Text>
                    </View>
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
    maintenanceOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    maintenanceTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', marginTop: 30 },
    maintenanceText: { fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 15, lineHeight: 24 },
    maintenanceBadge: { marginTop: 40, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(254, 202, 87, 0.2)', borderWidth: 1, borderColor: '#feca57' },
    maintenanceBadgeText: { color: '#feca57', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    appLogo: {
        width: 48,
        height: 48,
        borderRadius: 14,
    },
    headerTextContainer: {
        justifyContent: 'center',
    },
    appName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1A1A2E',
        letterSpacing: -0.5,
    },
    userGreeting: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '600',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    logoutButton: {
        backgroundColor: '#e94560',
    },
    notificationBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#e94560',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    notificationBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '800',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A2E',
        marginLeft: 10,
    },
    filterButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#1A1A2E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    seeAll: {
        fontSize: 13,
        color: '#e94560',
        fontWeight: '600',
    },
    categoriesScroll: {
        marginBottom: 20,
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    categoryChipActive: {
        backgroundColor: '#e94560',
    },
    categoryChipText: {
        fontSize: 13,
        color: '#1A1A2E',
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    banner: {
        marginBottom: 24,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#e94560',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    bannerGradient: {
        flexDirection: 'row',
        padding: 20,
        minHeight: 140,
    },
    bannerContent: {
        flex: 1,
    },
    bannerLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        marginBottom: 4,
    },
    bannerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
    },
    bannerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 12,
    },
    bannerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        gap: 6,
    },
    bannerButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#e94560',
    },
    bannerImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
    },
    newArrivalsScroll: {
        paddingLeft: 24,
        marginBottom: 35,
    },
    newArrivalCard: {
        width: 210,
        height: 310,
        borderRadius: 28,
        marginRight: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#FFF',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 16 },
            android: { elevation: 10 },
        }),
    },
    newArrivalImage: {
        width: '100%',
        height: '100%',
    },
    newArrivalOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        padding: 24,
        justifyContent: 'flex-end',
    },
    newArrivalMeta: {
        gap: 6,
    },
    typeBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    typeBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    newArrivalName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    newArrivalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    newArrivalPrice: {
        color: '#feca57',
        fontSize: 18,
        fontWeight: '800',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingSmall: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    floatingWishlist: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 5 },
        }),
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        zIndex: 10,
    },
    newBadge: {
        backgroundColor: '#10b981',
    },
    trendingBadge: {
        backgroundColor: '#f59e0b',
    },
    statusBadgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#ADADAD',
        fontWeight: '500',
        marginTop: 2,
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#e94560',
    },
    carouselScroll: {
        paddingLeft: 24,
        marginBottom: 30,
    },
    carouselCard: {
        width: 280,
        height: 180,
        borderRadius: 24,
        marginRight: 16,
        overflow: 'hidden',
        position: 'relative',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 },
            android: { elevation: 6 },
        }),
    },
    carouselImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    carouselOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        padding: 20,
        justifyContent: 'flex-end',
    },
    carouselName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    carouselPrice: {
        color: '#feca57',
        fontSize: 16,
        fontWeight: '700',
    },
    carouselBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    bannerPromoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.8,
    },
    dealCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginHorizontal: 24,
        borderWidth: 1,
        borderColor: '#F1F3F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    dealInfo: {
        gap: 4,
    },
    dealLabel: {
        fontSize: 12,
        color: '#6C757D',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    dealTime: {
        fontSize: 22,
        fontWeight: '900',
        color: '#e94560',
    },
    dealPriceInfo: {
        alignItems: 'flex-end',
        gap: 2,
    },
    dealDiscount: {
        fontSize: 14,
        fontWeight: '800',
        color: '#10b981',
    },
    dealCondition: {
        fontSize: 10,
        color: '#ADADAD',
        fontWeight: '600',
    },
    brandsScroll: {
        paddingLeft: 24,
        marginBottom: 35,
    },
    brandContainer: {
        alignItems: 'center',
        marginRight: 24,
    },
    brandLogo: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 3 },
        }),
        borderWidth: 1,
        borderColor: '#F1F3F5',
        overflow: 'hidden',
        padding: 12,
    },
    brandLogoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    brandInitial: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1A1A2E',
    },
    brandName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6C757D',
    },
    productCard: {
        width: CARD_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15 },
            android: { elevation: 4 },
        }),
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 0.8,
        overflow: 'hidden',
        backgroundColor: '#F1F3F5',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgenew: {
        backgroundColor: '#10b981',
    },
    badgesale: {
        backgroundColor: '#e94560',
    },
    badgetrending: {
        backgroundColor: '#f59e0b',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    wishlistButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productInfo: {
        padding: 12,
    },
    productCategory: {
        fontSize: 11,
        color: '#6C757D',
        fontWeight: '500',
        marginBottom: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 4,
        lineHeight: 18,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#feca57',
    },
    reviewText: {
        fontSize: 11,
        color: '#ADADAD',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#e94560',
    },
    originalPrice: {
        fontSize: 13,
        color: '#ADADAD',
        textDecorationLine: 'line-through',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#ADADAD',
        marginTop: 12,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F1F1',
        paddingTop: 12,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    filterModal: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 16,
        marginTop: 8,
    },
    sortOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    sortOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    activeSortOption: {
        backgroundColor: '#1A1A2E',
        borderColor: '#1A1A2E',
    },
    sortOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6C757D',
    },
    activeSortOptionText: {
        color: '#FFF',
    },
    priceFilterContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 30,
    },
    priceChip: {
        flex: 1,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    activePriceChip: {
        backgroundColor: '#e9456015',
        borderColor: '#e94560',
    },
    priceChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6C757D',
    },
    activePriceChipText: {
        color: '#e94560',
    },
    applyBtn: {
        backgroundColor: '#1A1A2E',
        height: 55,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    applyBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    resetBtn: {
        marginTop: 15,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F1F3F5',
    },
    resetBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    activeFiltersContainer: {
        marginTop: 15,
        marginBottom: 5,
    },
    activeFiltersScroll: {
        paddingRight: 20,
        gap: 8,
        alignItems: 'center',
    },
    appliedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        gap: 6,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
            android: { elevation: 2 },
        }),
    },
    appliedChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    appliedChipClose: {
        marginLeft: 2,
    },
    clearAllBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    clearAllText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#e94560',
    },
});
