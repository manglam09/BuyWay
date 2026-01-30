import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockBrands, mockCategories, Product } from '../../data/mockProducts';
import productService from '../../services/productService';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 2;

const CATEGORY_IMAGES: Record<string, string> = {
    'Men': 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&q=80',
    'Women': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
    'Kids': 'https://as1.ftcdn.net/v2/jpg/02/80/27/62/1000_F_280276236_Uqp6l27knJnH725yprEN91ry0V5fA2oU.jpg',
    'Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
};

const COLLECTIONS = [
    { id: 'c1', name: 'Summer Essentials', icon: 'sunny-outline', color: '#FF9500' },
    { id: 'c2', name: 'Winter Wear', icon: 'snow-outline', color: '#5AC8FA' },
    { id: 'c3', name: 'Street Style', icon: 'shirt-outline', color: '#5856D6' },
    { id: 'c4', name: 'Formal Look', icon: 'briefcase-outline', color: '#1A1A2E' },
];

export default function ExploreScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const unsubscribe = productService.subscribe((updatedProducts) => {
            setProducts(updatedProducts);
        });
        return unsubscribe;
    }, []);

    const filteredSearchResults = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header with Search */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Text style={styles.headerTitle}>Explore</Text>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#6C757D" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products, brands..."
                        placeholderTextColor="#ADADAD"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.filterBtn}>
                        <Ionicons name="options-outline" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            >
                {searchQuery.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Search Results ({filteredSearchResults.length})</Text>
                        <View style={styles.resultsGrid}>
                            {filteredSearchResults.map(product => (
                                <TouchableOpacity
                                    key={product.id}
                                    style={[styles.resultCard, { width: COLUMN_WIDTH }]}
                                    onPress={() => router.push({
                                        pathname: '/(user)/home', // Simplification: route to home which shows products
                                        params: { productId: product.id }
                                    })}
                                >
                                    <Image source={{ uri: product.image }} style={styles.resultImage} />
                                    <View style={styles.resultInfo}>
                                        <Text style={styles.resultName} numberOfLines={1}>{product.name}</Text>
                                        <Text style={styles.resultPrice}>₹{product.price.toLocaleString()}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Visual Categories Grid */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Shop by Category</Text>
                            <View style={styles.categoryGrid}>
                                {mockCategories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.categoryCard, { width: COLUMN_WIDTH }]}
                                        activeOpacity={0.9}
                                    >
                                        <Image
                                            source={{ uri: CATEGORY_IMAGES[cat.name] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80' }}
                                            style={styles.categoryImage}
                                        />
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                                            style={styles.categoryGradient}
                                        >
                                            <View>
                                                <Text style={styles.categoryName}>{cat.name}</Text>
                                                <Text style={styles.categoryCount}>{products.filter(p => p.category === cat.name).length}+ Items</Text>
                                            </View>
                                            <View style={styles.categoryArrow}>
                                                <Ionicons name="chevron-forward" size={16} color="#FFF" />
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Collections */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Curated Collections</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collectionsScroll}>
                                {COLLECTIONS.map((col) => (
                                    <TouchableOpacity key={col.id} style={styles.collectionItem} activeOpacity={0.8}>
                                        <View style={[styles.collectionIcon, { backgroundColor: col.color + '20' }]}>
                                            <Ionicons name={col.icon as any} size={24} color={col.color} />
                                        </View>
                                        <Text style={styles.collectionText}>{col.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Popular Brands Grid */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Featured Brands</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeAll}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.brandsGrid}>
                                {mockBrands.map((brand) => (
                                    <TouchableOpacity key={brand.id} style={styles.brandCard}>
                                        <View style={styles.brandLogoContainer}>
                                            <Image
                                                source={{ uri: brand.logo }}
                                                style={styles.brandLogo}
                                                contentFit="contain"
                                            />
                                        </View>
                                        <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Trending Collections */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Trending Now</Text>
                            <TouchableOpacity style={styles.trendingBanner} activeOpacity={0.9}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80' }}
                                    style={styles.trendingImage}
                                />
                                <LinearGradient
                                    colors={['rgba(26,26,46,0.2)', '#1A1A2E']}
                                    style={styles.trendingGradient}
                                >
                                    <View style={styles.trendingChip}>
                                        <Text style={styles.trendingChipText}>NEW RELEASE</Text>
                                    </View>
                                    <Text style={styles.trendingTitle}>Streetwear Essentials</Text>
                                    <Text style={styles.trendingSubtitle}>The most anticipated drop of the season is here.</Text>
                                    <View style={styles.trendingBtn}>
                                        <Text style={styles.trendingBtnText}>Explore Drop</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#1A1A2E" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(user)/home')}>
                    <Ionicons name="home-outline" size={22} color="#6C757D" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="grid" size={22} color="#e94560" />
                    <Text style={[styles.navText, styles.navTextActive]}>Explore</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFF' },
    headerTitle: { fontSize: 32, fontWeight: '800', color: '#1A1A2E', marginBottom: 20 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    searchIcon: { position: 'absolute', left: 15, zIndex: 1 },
    searchInput: { flex: 1, height: 50, backgroundColor: '#F8F9FA', borderRadius: 15, paddingLeft: 45, paddingRight: 15, fontSize: 15, color: '#1A1A2E' },
    filterBtn: { width: 50, height: 50, backgroundColor: '#1A1A2E', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    section: { marginTop: 25, paddingHorizontal: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 15 },
    seeAll: { fontSize: 14, fontWeight: '700', color: '#e94560' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
    categoryCard: { height: 200, borderRadius: 24, overflow: 'hidden', elevation: 8 },
    categoryImage: { width: '100%', height: '100%' },
    categoryGradient: { ...StyleSheet.absoluteFillObject, padding: 18, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end' },
    categoryName: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    categoryCount: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginTop: 2 },
    categoryArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },
    collectionsScroll: { marginLeft: -10 },
    collectionItem: { alignItems: 'center', marginHorizontal: 10, gap: 10 },
    collectionIcon: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
    collectionText: { fontSize: 13, fontWeight: '700', color: '#6C757D' },
    brandsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
    brandCard: { width: (width - 40 - 30) / 3, alignItems: 'center', gap: 8 },
    brandLogoContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#F8F9FA', borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: 15 },
    brandLogo: { width: '100%', height: '100%' },
    brandName: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
    trendingBanner: { width: '100%', height: 280, borderRadius: 30, overflow: 'hidden', position: 'relative' },
    trendingImage: { width: '100%', height: '100%' },
    trendingGradient: { ...StyleSheet.absoluteFillObject, padding: 24, justifyContent: 'flex-end' },
    trendingChip: { backgroundColor: '#feca57', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
    trendingChipText: { fontSize: 10, fontWeight: '900', color: '#1A1A2E' },
    trendingTitle: { fontSize: 26, fontWeight: '900', color: '#FFF', marginBottom: 8 },
    trendingSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 20, lineHeight: 20 },
    trendingBtn: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' },
    trendingBtnText: { fontSize: 14, fontWeight: '800', color: '#1A1A2E' },
    resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
    resultCard: { backgroundColor: '#F8F9FA', borderRadius: 20, overflow: 'hidden', padding: 10 },
    resultImage: { width: '100%', aspectRatio: 1, borderRadius: 15 },
    resultInfo: { marginTop: 10 },
    resultName: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
    resultPrice: { fontSize: 15, fontWeight: '800', color: '#e94560', marginTop: 4 },
    bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F1F1', paddingTop: 12, paddingHorizontal: 24, elevation: 10 },
    navItem: { flex: 1, alignItems: 'center', gap: 4 },
    navText: { fontSize: 11, color: '#6C757D', fontWeight: '500' },
    navTextActive: { color: '#e94560' },
});
