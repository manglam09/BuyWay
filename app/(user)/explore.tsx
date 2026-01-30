import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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
import { mockBrands, mockCategories, Product } from '../../data/mockProducts';
import productService from '../../services/productService';

const MAX_WIDTH = 1200;
const COLUMN_GAP = 16;

const CATEGORY_IMAGES: Record<string, string> = {
    'Men': 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&q=80',
    'Women': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
    'Kids': 'https://as1.ftcdn.net/v2/jpg/02/80/27/62/1000_F_280276236_Uqp6l27knJnH725yprEN91ry0V5fA2oU.jpg',
    'Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
};

const COLLECTIONS = [
    { id: 'c1', name: 'Summer', icon: 'sunny', color: '#FF9F43' },
    { id: 'c2', name: 'Winter', icon: 'snow', color: '#48DBFB' },
    { id: 'c3', name: 'Street', icon: 'shirt', color: '#5F27CD' },
    { id: 'c4', name: 'Formal', icon: 'briefcase', color: '#222F3E' },
];

export default function ExploreScreen() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const unsubscribe = productService.subscribe((updatedProducts) => {
            setProducts(updatedProducts);
        });
        return unsubscribe;
    }, []);

    // Responsive grid calculation
    const isLargeScreen = width > 768;
    const isTablet = width > 480 && width <= 768;
    const numColumns = isLargeScreen ? 3 : 2;
    const categoryColumns = isLargeScreen ? 4 : 2;
    const brandColumns = isLargeScreen ? 6 : (isTablet ? 4 : 3);

    const contentWidth = Math.min(width, MAX_WIDTH);
    const horizontalMargin = width > 480 ? 40 : 20;
    const availableWidth = contentWidth - horizontalMargin;

    const colWidth = (availableWidth - (COLUMN_GAP * (categoryColumns - 1))) / categoryColumns;

    const filteredSearchResults = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header Area */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <View style={[styles.headerContent, { width: contentWidth, paddingHorizontal: horizontalMargin / 2, alignSelf: 'center' }]}>
                    <View style={styles.titleRow}>
                        <Text style={styles.headerTitle}>Explore</Text>
                        <TouchableOpacity style={styles.headerIconButton}>
                            <Ionicons name="notifications-outline" size={24} color="#1A1A2E" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#6C757D" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find your style..."
                            placeholderTextColor="#ADADAD"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity style={styles.filterBtn}>
                            <Ionicons name="options-outline" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100, alignItems: 'center' }}
            >
                <View style={[styles.mainWrapper, { width: contentWidth, paddingHorizontal: horizontalMargin / 2 }]}>
                    {searchQuery.length > 0 ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Found {filteredSearchResults.length} items</Text>
                            <View style={styles.resultsGrid}>
                                {filteredSearchResults.map(product => {
                                    const resultCardWidth = (availableWidth - (COLUMN_GAP * (numColumns - 1))) / numColumns;
                                    return (
                                        <TouchableOpacity
                                            key={product.id}
                                            style={[styles.resultCard, { width: resultCardWidth }]}
                                            onPress={() => router.push({
                                                pathname: "/(user)/product/[id]",
                                                params: { id: product.id }
                                            })}
                                        >
                                            <Image source={{ uri: product.image }} style={styles.resultImage} contentFit="cover" />
                                            <View style={styles.resultInfo}>
                                                <Text style={styles.resultName} numberOfLines={1}>{product.name}</Text>
                                                <Text style={styles.resultPrice}>₹{product.price.toLocaleString()}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ) : (
                        <>
                            {/* Visual Categories Grid */}
                            <Text style={styles.sectionTitle}>Browse Categories</Text>
                            <View style={styles.categoryGrid}>
                                {mockCategories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.categoryCard, { width: colWidth }]}
                                        activeOpacity={0.9}
                                    >
                                        <Image
                                            source={{ uri: CATEGORY_IMAGES[cat.name] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80' }}
                                            style={styles.categoryImage}
                                            contentFit="cover"
                                        />
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                                            style={styles.categoryGradient}
                                        >
                                            <View style={styles.categoryInfo}>
                                                <Text style={styles.categoryName}>{cat.name}</Text>
                                                <Text style={styles.categoryCount}>{products.filter(p => p.category === cat.name).length}+ Designs</Text>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Collections Chips */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Curated Collections</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionsScroll}>
                                    {COLLECTIONS.map((col) => (
                                        <TouchableOpacity key={col.id} style={styles.collectionChip} activeOpacity={0.7}>
                                            <View style={[styles.collectionIcon, { backgroundColor: col.color }]}>
                                                <Ionicons name={col.icon as any} size={20} color="#FFF" />
                                            </View>
                                            <Text style={styles.collectionText}>{col.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Trending Card */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Trending Now</Text>
                                <TouchableOpacity style={styles.trendingCard} activeOpacity={0.9}>
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80' }}
                                        style={styles.trendingImage}
                                        contentFit="cover"
                                    />
                                    <LinearGradient
                                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
                                        style={styles.trendingGradient}
                                    >
                                        <View style={styles.trendingBadge}>
                                            <Text style={styles.trendingBadgeText}>FRESH DROP</Text>
                                        </View>
                                        <Text style={styles.trendingTitle}>Streetwear Essentials</Text>
                                        <Text style={styles.trendingSubtitle}>Premium essentials for your daily rotation.</Text>
                                        <TouchableOpacity style={styles.trendingBtn}>
                                            <Text style={styles.trendingBtnText}>Explore Now</Text>
                                            <Ionicons name="arrow-forward" size={16} color="#1A1A2E" />
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {/* Featured Brands */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Popular Brands</Text>
                                    <TouchableOpacity>
                                        <Text style={styles.viewAllText}>See All</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.brandsGrid}>
                                    {mockBrands.map((brand) => {
                                        const brandCardWidth = (availableWidth - (COLUMN_GAP * (brandColumns - 1))) / brandColumns;
                                        return (
                                            <TouchableOpacity key={brand.id} style={[styles.brandCard, { width: brandCardWidth }]} activeOpacity={0.8}>
                                                <View style={styles.brandLogoBox}>
                                                    <Image
                                                        source={{ uri: brand.logo }}
                                                        style={styles.brandLogo}
                                                        contentFit="contain"
                                                    />
                                                </View>
                                                <Text style={styles.brandNameText} numberOfLines={1}>{brand.name}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Navigation Bar */}
            <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(user)/home')}>
                    <Ionicons name="home-outline" size={24} color="#C4C4C4" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="search" size={24} color="#e94560" />
                    <Text style={[styles.navText, styles.navActiveText]}>Explore</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(user)/orders')}>
                    <Ionicons name="bag-handle-outline" size={24} color="#C4C4C4" />
                    <Text style={styles.navText}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(user)/profile')}>
                    <Ionicons name="person-outline" size={24} color="#C4C4C4" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFB' },
    mainWrapper: { marginTop: 10 },
    header: { paddingHorizontal: 0, paddingBottom: 16, backgroundColor: '#FFF' },
    headerContent: { width: '100%' },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 34, fontWeight: '900', color: '#1A1A2E', letterSpacing: -0.5 },
    headerIconButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
    searchInput: { flex: 1, height: 54, backgroundColor: '#F8F9FA', borderRadius: 16, paddingLeft: 48, paddingRight: 16, fontSize: 16, color: '#1A1A2E', fontWeight: '500' },
    filterBtn: { width: 54, height: 54, backgroundColor: '#1A1A2E', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    section: { marginTop: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginBottom: 16 },
    viewAllText: { fontSize: 14, fontWeight: '700', color: '#e94560' },

    // Categories
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: COLUMN_GAP },
    categoryCard: { height: 220, borderRadius: 28, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15 }, android: { elevation: 8 }, web: { boxShadow: '0 10px 20px rgba(0,0,0,0.08)' } }) },
    categoryImage: { width: '100%', height: '100%' },
    categoryGradient: { ...StyleSheet.absoluteFillObject, padding: 20, justifyContent: 'flex-end' },
    categoryInfo: { gap: 2 },
    categoryName: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 0.2 },
    categoryCount: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700' },

    // Collections
    collectionsScroll: { gap: 12 },
    collectionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, gap: 10, ...Platform.select({ web: { boxShadow: '0 4px 10px rgba(0,0,0,0.04)' } }), elevation: 2 },
    collectionIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    collectionText: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },

    // Trending
    trendingCard: { width: '100%', height: 300, borderRadius: 32, overflow: 'hidden', position: 'relative' },
    trendingImage: { width: '100%', height: '100%' },
    trendingGradient: { ...StyleSheet.absoluteFillObject, padding: 28, justifyContent: 'flex-end' },
    trendingBadge: { backgroundColor: '#e94560', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 16 },
    trendingBadgeText: { fontSize: 10, fontWeight: '900', color: '#FFF' },
    trendingTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 8, letterSpacing: -0.5 },
    trendingSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 24, lineHeight: 22 },
    trendingBtn: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' },
    trendingBtnText: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },

    // Brands
    brandsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: COLUMN_GAP },
    brandCard: { alignItems: 'center', gap: 10 },
    brandLogoBox: { width: '100%', aspectRatio: 1, backgroundColor: '#FFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', padding: 14, ...Platform.select({ web: { boxShadow: '0 10px 20px rgba(0,0,0,0.03)' } }), elevation: 1 },
    brandLogo: { width: '100%', height: '100%' },
    brandNameText: { fontSize: 12, fontWeight: '700', color: '#6C757D' },

    // Results
    resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: COLUMN_GAP },
    resultCard: { backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', padding: 8, ...Platform.select({ web: { boxShadow: '0 8px 16px rgba(0,0,0,0.04)' } }), elevation: 2 },
    resultImage: { width: '100%', aspectRatio: 1, borderRadius: 20 },
    resultInfo: { padding: 10, gap: 4 },
    resultName: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
    resultPrice: { fontSize: 16, fontWeight: '900', color: '#e94560' },

    // Bottom Nav
    bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 14, paddingHorizontal: 24, ...Platform.select({ web: { boxShadow: '0 -4px 14px rgba(0,0,0,0.03)' } }), elevation: 10 },
    navItem: { flex: 1, alignItems: 'center', gap: 4 },
    navText: { fontSize: 10, color: '#C4C4C4', fontWeight: '700' },
    navActiveText: { color: '#e94560' },
});

