import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
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
import { mockBrands, mockCategories, Product } from '../../data/mockProducts';
import authService from '../../services/authService';
import cartService from '../../services/cartService';
import productService from '../../services/productService';
import settingsService, { AppSettings } from '../../services/settingsService';
import wishlistService from '../../services/wishlistService';

const MAX_WIDTH = 1200;
const COLUMN_GAP = 20;

export default function UserHome() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();

    // Responsive grid calculation
    const isLargeScreen = width > 768;
    const isTablet = width > 480 && width <= 768;
    const numColumns = isLargeScreen ? 4 : 2;
    const contentWidth = Math.min(width, MAX_WIDTH);
    // Minimal padding for mobile to maximize space
    const horizontalMargin = width > 480 ? 40 : 20;
    const availableWidth = contentWidth - horizontalMargin;
    const cardWidth = (availableWidth - (COLUMN_GAP * (numColumns - 1))) / numColumns;

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
            case 'Men': return '#E0F2FE';
            case 'Women': return '#FDF2F8';
            case 'Kids': return '#FEF2F2';
            default: return '#F1F3F5';
        }
    };

    const renderProductCard = ({ item, index }: { item: Product; index: number }) => {
        const bgColor = getCategoryColor(item.category);

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.productCard, { width: cardWidth }]}
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
                    {
                        paddingTop: insets.top + 16,
                        paddingBottom: insets.bottom + 80,
                        alignItems: 'center'
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.mainWrapper, { width: contentWidth, paddingHorizontal: horizontalMargin / 2 }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleContainer}>
                            <Image
                                source={appSettings.appLogo ? { uri: appSettings.appLogo } : require('../../assets/images/logo.png')}
                                style={styles.appLogo}
                                contentFit="cover"
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



                    {/* Instagram Stories Style Product Features */}
                    <View style={styles.storiesContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.storiesScrollContent}
                        >
                            {[
                                { id: 's1', name: 'New Drops', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&q=80', active: true },
                                { id: 's2', name: 'Summer', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&q=80', active: true },
                                { id: 's3', name: 'Party', image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=200&q=80', active: false },
                                { id: 's4', name: 'Casual', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&q=80', active: false },
                                { id: 's5', name: 'Luxe', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=80', active: true },
                                { id: 's6', name: 'Street', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&q=80', active: false },
                            ].map((story) => (
                                <TouchableOpacity
                                    key={story.id}
                                    style={styles.storyItem}
                                    onPress={() => showToast(`Opening ${story.name} stories...`, 'info')}
                                >
                                    <LinearGradient
                                        colors={story.active ? ['#f09433', '#e95950', '#bc1888'] : ['#E9ECEF', '#CED4DA']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.storyBorder}
                                    >
                                        <View style={styles.storyImageContainer}>
                                            <Image
                                                source={{ uri: story.image }}
                                                style={styles.storyImage}
                                                contentFit="cover"
                                            />
                                        </View>
                                    </LinearGradient>
                                    <Text style={styles.storyName} numberOfLines={1}>{story.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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

                    {/* Black Friday Banner */}
                    <TouchableOpacity style={styles.blackFridayBanner} activeOpacity={0.9}>
                        <LinearGradient
                            colors={['#000000', '#1A1A1A']}
                            style={styles.bfGradient}
                        >
                            <View style={styles.bfContent}>
                                <View style={styles.bfBadge}>
                                    <Text style={styles.bfBadgeText}>LIMITED TIME</Text>
                                </View>
                                <Text style={styles.bfTitle}>BLACK FRIDAY</Text>
                                <Text style={styles.bfSubtitle}>MEGA SALE IS LIVE</Text>
                                <View style={styles.bfTimerContainer}>
                                    <Ionicons name="time-outline" size={14} color="#e94560" />
                                    <Text style={styles.bfTimerText}>Ends in {formatTime(timeLeft)}</Text>
                                </View>
                            </View>
                            <View style={styles.bfDiscountContainer}>
                                <Text style={styles.bfDiscountVal}>80%</Text>
                                <Text style={styles.bfOff}>OFF</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* New Arrivals Section */}
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
                        style={styles.horizontalScroll}
                        contentContainerStyle={{ paddingRight: COLUMN_GAP }}
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
                                />

                                <TouchableOpacity
                                    style={styles.floatingWishlist}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        const added = wishlistService.toggleWishlist(item);
                                        showToast(added ? 'Saved to favorites' : 'Removed', 'info');
                                    }}
                                >
                                    <Ionicons
                                        name={wishlistService.isInWishlist(item.id) ? "heart" : "heart-outline"}
                                        size={20}
                                        color="#e94560"
                                    />
                                </TouchableOpacity>

                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                                    style={styles.newArrivalOverlay}
                                >
                                    <View style={styles.newArrivalMeta}>
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
                                    contentFit="cover"
                                />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Deal of the Day */}
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
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
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

                    {/* Recommended Grid */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recommended for You</Text>
                        <TouchableOpacity onPress={() => setIsFilterVisible(true)}>
                            <Text style={styles.seeAll}>Sort & Filter</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={filteredProducts}
                        renderItem={({ item, index }: { item: Product; index: number }) => renderProductCard({ item, index })}
                        keyExtractor={(item) => item.id}
                        numColumns={numColumns}
                        key={numColumns}
                        columnWrapperStyle={numColumns > 1 ? { gap: COLUMN_GAP, width: availableWidth } : undefined}
                        contentContainerStyle={styles.productsGrid}
                        scrollEnabled={false}
                    />

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
                </View>
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

            {/* AI Stylist FAB */}
            <TouchableOpacity
                style={styles.stylistFab}
                onPress={() => router.push('/(user)/stylist')}
            >
                <LinearGradient
                    colors={['#1A1A2E', '#e94560']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="sparkles" size={24} color="#fff" />
                    <Text style={styles.fabText}>Stylist</Text>
                </LinearGradient>
            </TouchableOpacity>

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
    mainWrapper: {
        width: '100%',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        height: 60,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    appLogo: {
        width: 44,
        height: 44,
        borderRadius: 12,
    },
    headerTextContainer: {
        justifyContent: 'center',
    },
    appName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1A1A2E',
    },
    userGreeting: {
        fontSize: 12,
        color: '#6C757D',
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }
        }),
    },
    logoutButton: {
        backgroundColor: '#e94560',
    },
    notificationBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        minWidth: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#e94560',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    notificationBadgeText: {
        color: '#FFF',
        fontSize: 8,
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
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 3 },
            web: { boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }
        }),
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
    sectionSubtitle: {
        fontSize: 12,
        color: '#ADADAD',
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#e94560',
    },
    horizontalScroll: {
        marginBottom: 25,
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    newArrivalCard: {
        width: 200,
        height: 280,
        borderRadius: 24,
        marginRight: 15,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 },
            android: { elevation: 5 },
            web: { boxShadow: '0 8px 12px rgba(0,0,0,0.1)' }
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
        height: '40%',
        padding: 15,
        justifyContent: 'flex-end',
    },
    newArrivalMeta: {
        gap: 4,
    },
    newArrivalName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    newArrivalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    newArrivalPrice: {
        color: '#feca57',
        fontSize: 16,
        fontWeight: '700',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingSmall: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    floatingWishlist: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
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
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
            android: { elevation: 1 },
            web: { boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }
        }),
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
        marginBottom: 25,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            web: { boxShadow: '0 4px 15px rgba(233, 69, 96, 0.2)' }
        })
    },
    bannerGradient: {
        flexDirection: 'row',
        padding: 20,
        minHeight: 130,
    },
    bannerContent: {
        flex: 1,
    },
    bannerLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    bannerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 10,
    },
    bannerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        gap: 6,
    },
    bannerButtonText: {
        fontSize: 12,
        fontWeight: '800',
    },
    bannerImageContainer: {
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerPromoImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    dealCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        ...Platform.select({
            web: { boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }
        })
    },
    dealInfo: {
        gap: 4,
    },
    dealLabel: {
        fontSize: 11,
        color: '#6C757D',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    dealTime: {
        fontSize: 20,
        fontWeight: '900',
        color: '#e94560',
    },
    dealPriceInfo: {
        alignItems: 'flex-end',
    },
    dealDiscount: {
        fontSize: 14,
        fontWeight: '800',
        color: '#10b981',
    },
    dealCondition: {
        fontSize: 10,
        color: '#ADADAD',
    },
    brandContainer: {
        alignItems: 'center',
        marginRight: 20,
    },
    brandLogo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F3F5',
        overflow: 'hidden',
    },
    brandLogoImage: {
        width: '60%',
        height: '60%',
    },
    brandName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6C757D',
        marginTop: 5,
    },
    productsGrid: {
        width: '100%',
        paddingBottom: 20,
    },
    productCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 3 },
            web: { boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }
        }),
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 0.85,
        position: 'relative',
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
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgenew: { backgroundColor: '#10b981' },
    badgesale: { backgroundColor: '#e94560' },
    badgetrending: { backgroundColor: '#f59e0b' },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
    wishlistButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        padding: 10,
    },
    productCategory: {
        fontSize: 10,
        color: '#6C757D',
        fontWeight: '600',
    },
    productName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A2E',
        marginVertical: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#feca57',
    },
    reviewText: {
        fontSize: 10,
        color: '#ADADAD',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    price: {
        fontSize: 15,
        fontWeight: '800',
        color: '#e94560',
    },
    originalPrice: {
        fontSize: 11,
        color: '#ADADAD',
        textDecorationLine: 'line-through',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        width: '100%',
    },
    emptyText: {
        fontSize: 14,
        color: '#ADADAD',
        marginTop: 10,
    },
    resetBtn: {
        marginTop: 15,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F1F3F5',
    },
    resetBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1A1A2E',
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
        paddingTop: 10,
        paddingHorizontal: 20,
        ...Platform.select({
            web: { boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }
        })
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    navText: {
        fontSize: 10,
        color: '#6C757D',
        fontWeight: '600',
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
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    filterSectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 12,
        marginTop: 8,
    },
    sortOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    sortOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    activeSortOption: {
        backgroundColor: '#1A1A2E',
        borderColor: '#1A1A2E',
    },
    sortOptionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6C757D',
    },
    activeSortOptionText: {
        color: '#FFF',
    },
    priceFilterContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 30,
    },
    priceChip: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    activePriceChip: {
        backgroundColor: '#e9456015',
        borderColor: '#e94560',
    },
    priceChipText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6C757D',
    },
    activePriceChipText: {
        color: '#e94560',
    },
    applyBtn: {
        backgroundColor: '#1A1A2E',
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    applyBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '800',
    },
    activeFiltersContainer: {
        marginBottom: 15,
    },
    activeFiltersScroll: {
        gap: 8,
    },
    appliedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        gap: 6,
    },
    appliedChipText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    appliedChipClose: {},
    clearAllBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    clearAllText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#e94560',
    },
    maintenanceOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    maintenanceTitle: { fontSize: 26, fontWeight: '900', color: '#FFF', marginTop: 30 },
    maintenanceText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 15, lineHeight: 22 },
    maintenanceBadge: { marginTop: 40, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(254, 202, 87, 0.2)', borderWidth: 1, borderColor: '#feca57' },
    maintenanceBadgeText: { color: '#feca57', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    seeAll: { fontSize: 13, color: '#e94560', fontWeight: '700' },
    stylistFab: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        zIndex: 99,
        overflow: 'hidden',
        borderRadius: 30,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
            android: { elevation: 8 },
            web: { boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)' }
        }),
    },
    fabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    fabText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
    },
    blackFridayBanner: {
        marginBottom: 25,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    bfGradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        alignItems: 'center',
    },
    bfContent: {
        gap: 4,
    },
    bfBadge: {
        backgroundColor: '#e94560',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    bfBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '900',
    },
    bfTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1,
    },
    bfSubtitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#e94560',
    },
    bfTimerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    bfTimerText: {
        color: '#ADADAD',
        fontSize: 11,
        fontWeight: '600',
    },
    bfDiscountContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        width: 70,
        height: 70,
        borderRadius: 35,
        transform: [{ rotate: '15deg' }],
    },
    bfDiscountVal: {
        fontSize: 20,
        fontWeight: '900',
        color: '#000',
    },
    bfOff: {
        fontSize: 10,
        fontWeight: '900',
        color: '#e94560',
        marginTop: -4,
    },
    storiesContainer: {
        marginBottom: 20,
        width: '100%',
    },
    storiesScrollContent: {
        paddingHorizontal: 10,
        gap: 15,
    },
    storyItem: {
        alignItems: 'center',
        width: 75,
    },
    storyBorder: {
        width: 68,
        height: 68,
        borderRadius: 34,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyImageContainer: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: '#FFF',
        padding: 2,
    },
    storyImage: {
        width: '100%',
        height: '100%',
        borderRadius: 29,
    },
    storyName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1A1A2E',
        marginTop: 6,
    },
});
