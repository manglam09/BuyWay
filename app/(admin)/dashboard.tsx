import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
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
import { Product } from '../../data/mockProducts';
import authService from '../../services/authService';
import orderService, { Order } from '../../services/orderService';
import productService from '../../services/productService';
import settingsService, { AppSettings } from '../../services/settingsService';

const MAX_WIDTH = 1200;

const CATEGORY_IMAGES: Record<string, string> = {
    'Men': 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&q=80',
    'Women': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
    'Kids': 'https://as1.ftcdn.net/v2/jpg/02/80/27/62/1000_F_280276236_Uqp6l27knJnH725yprEN91ry0V5fA2oU.jpg',
    'Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
};

const AI_INSIGHTS = [
    { id: 1, title: 'Inventory Alert', msg: 'Linen Shirts stock low. Predicted sell-out in 48h.', color: '#f43f5e', icon: 'flash' },
    { id: 2, title: 'Revenue Forecast', msg: 'Weekend sales projected to hit ₹45k (+15%).', color: '#10b981', icon: 'trending-up' },
    { id: 3, title: 'Ad Spend Opt', msg: 'ROAS is 4.2x. Scale "Men Outwear" campaign.', color: '#6366f1', icon: 'rocket' },
];

export default function AdminDashboard() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [liveUsers, setLiveUsers] = useState(128);
    const [appSettings, setAppSettings] = useState<AppSettings>(settingsService.getSettings());

    // Modal State
    const [isProductModalVisible, setIsProductModalVisible] = useState(false);
    const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Product Form State
    const [formName, setFormName] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [formInStock, setFormInStock] = useState(true);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    // Config Form State
    const [configAppName, setConfigAppName] = useState(appSettings.appName);
    const [configLogo, setConfigLogo] = useState(appSettings.appLogo || '');
    const [configMaintenance, setConfigMaintenance] = useState(appSettings.maintenanceMode);
    const [configThreshold, setConfigThreshold] = useState(appSettings.freeShippingThreshold.toString());

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }).start();

        const unsubscribeOrders = orderService.subscribe((updatedOrders) => {
            setOrders(updatedOrders);
        });
        const unsubscribeProducts = productService.subscribe((updatedProducts) => {
            setProducts(updatedProducts);
            setCategories(productService.getCategories());
        });
        const unsubscribeSettings = settingsService.subscribe((settings) => {
            setAppSettings(settings);
            setConfigAppName(settings.appName);
            setConfigLogo(settings.appLogo || '');
            setConfigMaintenance(settings.maintenanceMode);
            setConfigThreshold(settings.freeShippingThreshold.toString());
        });

        const trafficInterval = setInterval(() => {
            setLiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
        }, 5000);

        return () => {
            unsubscribeOrders();
            unsubscribeProducts();
            unsubscribeSettings();
            clearInterval(trafficInterval);
        };
    }, []);

    const contentWidth = Math.min(width - 40, MAX_WIDTH);
    const COLUMN_WIDTH = (contentWidth - 25) / 2;

    const handleLogout = async () => {
        await authService.logout();
        router.replace('/');
    };

    const openProductModal = (product?: Product) => {
        if (product) {
            setModalMode('edit');
            setEditingProduct(product);
            setFormName(product.name);
            setFormPrice(product.price.toString());
            setFormCategory(product.category);
            setFormInStock(product.inStock);
            setShowNewCategoryInput(false);
        } else {
            setModalMode('add');
            setEditingProduct(null);
            setFormName('');
            setFormPrice('');
            setFormCategory(selectedCategory || '');
            setFormInStock(true);
            setShowNewCategoryInput(false);
            setNewCategoryName('');
        }
        setIsProductModalVisible(true);
    };

    const handleSaveProduct = () => {
        const finalCategory = showNewCategoryInput ? newCategoryName : formCategory;
        if (!formName || !formPrice || !finalCategory) {
            showToast('Please fill all required fields');
            return;
        }

        const productData = {
            name: formName,
            price: parseFloat(formPrice) || 0,
            category: finalCategory,
            inStock: formInStock,
            image: editingProduct?.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
        };

        if (modalMode === 'edit' && editingProduct) {
            productService.updateProduct(editingProduct.id, productData);
            showToast('Product updated successfully');
        } else {
            const newProduct: Product = {
                id: 'PROD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                ...productData,
                image: 'https://images.unsplash.com/photo-1521572267360-ee0c290915e8?w=400',
                badge: 'new',
                description: 'New catalog entry.',
                rating: 0,
                reviews: 0
            };
            productService.addProduct(newProduct);
            showToast('New product added successfully');
        }
        setIsProductModalVisible(false);
    };

    const handleSaveConfig = () => {
        settingsService.updateSettings({
            appName: configAppName,
            appLogo: configLogo || null,
            maintenanceMode: configMaintenance,
            freeShippingThreshold: parseFloat(configThreshold) || 0,
        });
        showToast('System configuration updated!');
        setIsConfigModalVisible(false);
    };

    const stats = [
        { label: 'Revenue', value: `₹${(orders.reduce((acc, o) => acc + o.totalAmount, 0) / 1000).toFixed(1)}k`, icon: 'analytics', colors: ['#6366f1', '#8b5cf6'] as const, trend: 'up' },
        { label: 'Active Users', value: liveUsers, icon: 'pulse', colors: ['#10b981', '#34d399'] as const, trend: 'up' },
        { label: 'Conversion', value: '4.8%', icon: 'pie-chart', colors: ['#f59e0b', '#fbbf24'] as const, trend: 'down' },
        { label: 'Products', value: products.length, icon: 'cube', colors: ['#ec4899', '#f43f5e'] as const, trend: 'up' },
    ];

    const renderStatCard = (stat: typeof stats[0], index: number) => (
        <TouchableOpacity key={index} style={[styles.statCard, { width: (contentWidth - 15) / 2 }]} activeOpacity={0.9}>
            <LinearGradient colors={stat.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statGradient}>
                <View style={styles.statHeader}>
                    <View style={styles.statIconBadge}><Ionicons name={stat.icon as any} size={20} color="#FFF" /></View>
                    <Ionicons name={stat.trend === 'up' ? 'arrow-up-circle' : 'arrow-down-circle'} size={18} color="rgba(255,255,255,0.6)" />
                </View>
                <Text style={styles.statPrice}>{stat.value}</Text>
                <Text style={styles.statName}>{stat.label}</Text>
                <View style={[styles.statCircle, { bottom: -20, right: -20, width: 80, height: 80 }]} />
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderCategoryCard = (cat: string) => {
        const catCount = products.filter(p => p.category === cat).length;
        const isActive = selectedCategory === cat;
        return (
            <TouchableOpacity key={cat} style={[styles.categoryAdminCard, { width: COLUMN_WIDTH }]} activeOpacity={0.9} onPress={() => setSelectedCategory(isActive ? null : cat)}>
                <Image source={{ uri: CATEGORY_IMAGES[cat] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80' }} style={styles.categoryAdminImage} contentFit="cover" />
                <LinearGradient colors={['transparent', isActive ? 'rgba(99, 102, 241, 0.9)' : 'rgba(0,0,0,0.8)']} style={styles.categoryAdminGradient}>
                    <View style={styles.categoryInfoText}>
                        <Text style={styles.categoryAdminName}>{cat}</Text>
                        <Text style={styles.categoryAdminCount}>{catCount}+ Items</Text>
                    </View>
                    <View style={[styles.categoryAdminArrow, isActive && styles.categoryAdminArrowActive]}><Ionicons name={isActive ? "chevron-down" : "chevron-forward"} size={16} color="#FFF" /></View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    const renderProductItem = (product: Product) => (
        <TouchableOpacity key={product.id} style={styles.productCard} activeOpacity={0.9} onPress={() => openProductModal(product)}>
            <View style={styles.productMain}>
                <Image source={{ uri: product.image }} style={styles.productImg} contentFit="cover" />
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <View style={styles.categoryRow}>
                        <Text style={styles.productCat}>{product.category}</Text>
                        <View style={styles.dot} />
                        <Text style={[styles.stockStatus, !product.inStock && styles.stockOut]}>{product.inStock ? 'In Stock' : 'Out of Stock'}</Text>
                    </View>
                </View>
                <View style={styles.productPricing}>
                    <Text style={styles.productPrice}>₹{product.price.toLocaleString()}</Text>
                    <View style={styles.editBtn}><Ionicons name="pencil" size={14} color="#6C757D" /></View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderOrderItem = (order: Order) => (
        <TouchableOpacity key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.orderBasicInfo}><Text style={styles.orderId}>{order.id}</Text><Text style={styles.orderDate}>{order.date}</Text></View>
                <View style={[styles.statusBadge, styles.statusProcessing]}><Text style={styles.statusText}>{order.status}</Text></View>
            </View>
            <View style={styles.orderItemsPreview}><Text style={styles.orderItemsText}>{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</Text></View>
            <View style={styles.orderFooter}>
                <View style={styles.orderAddress}><Ionicons name="location-outline" size={14} color="#94a3b8" /><Text style={styles.addressText} numberOfLines={1}>{order.address}</Text></View>
                <Text style={styles.orderTotal}>₹{order.totalAmount.toLocaleString()}</Text>
            </View>
        </TouchableOpacity>
    );

    const processedProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.pageGradient} />

            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + 40, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
                <View style={[styles.hero, { paddingTop: insets.top + 20, width: contentWidth }]}>
                    <View style={styles.topRow}>
                        <TouchableOpacity style={styles.backFab} onPress={() => router.push('/')}><Ionicons name="chevron-back" size={24} color="#1e293b" /></TouchableOpacity>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.headerIcon}><Ionicons name="notifications-outline" size={24} color="#1e293b" /><View style={styles.dotBadge} /></TouchableOpacity>
                            <TouchableOpacity onPress={handleLogout}><Image source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200' }} style={styles.adminAvatar} contentFit="cover" /></TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.welcomeSection}>
                        <View style={styles.brandTitleRow}>
                            <Image
                                source={appSettings.appLogo ? { uri: appSettings.appLogo } : require('../../assets/images/logo.png')}
                                style={styles.brandMiniLogo}
                                contentFit="contain"
                            />
                            <Text style={styles.welcomeSmall}>{appSettings.appName.toUpperCase()} CORE</Text>
                        </View>
                        <Text style={styles.welcomeBig}>Commander Admin</Text>
                    </View>
                </View>

                <View style={[styles.tabBar, { width: contentWidth }]}>
                    {(['overview', 'products', 'orders', 'analytics'] as const).map(tab => (
                        <TouchableOpacity key={tab} style={[styles.tabItem, activeTab === tab && styles.tabItemActive]} onPress={() => setActiveTab(tab)}>
                            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 'overview' && (
                    <Animated.View style={[styles.contentBody, { opacity: fadeAnim, width: contentWidth }]}>
                        <View style={styles.statsGrid}>{stats.map(renderStatCard)}</View>

                        <Text style={styles.sectionHeader}>AI Intel & Insights</Text>
                        <View style={styles.aiInsightsContainer}>
                            {AI_INSIGHTS.map(insight => (
                                <View key={insight.id} style={styles.insightCard}>
                                    <View style={[styles.insightIconWrap, { backgroundColor: insight.color + '20' }]}>
                                        <Ionicons name={insight.icon as any} size={20} color={insight.color} />
                                    </View>
                                    <View style={styles.insightContent}>
                                        <Text style={styles.insightTitle}>{insight.title}</Text>
                                        <Text style={styles.insightMsg}>{insight.msg}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.sectionHeader}>Executive Toolkit</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll} contentContainerStyle={{ paddingRight: 25 }}>
                            <TouchableOpacity style={styles.actionCard} onPress={() => openProductModal()}><LinearGradient colors={['#6366f1', '#4338ca']} style={styles.actionGradient}><Ionicons name="add-circle" size={24} color="#FFF" /><Text style={styles.actionText}>New Item</Text></LinearGradient></TouchableOpacity>
                            <TouchableOpacity style={styles.actionCard}><LinearGradient colors={['#f43f5e', '#be123c']} style={styles.actionGradient}><Ionicons name="megaphone" size={24} color="#FFF" /><Text style={styles.actionText}>Flash Sale</Text></LinearGradient></TouchableOpacity>
                            <TouchableOpacity style={styles.actionCard}><LinearGradient colors={['#10b981', '#059669']} style={styles.actionGradient}><Ionicons name="mail" size={24} color="#FFF" /><Text style={styles.actionText}>Marketing</Text></LinearGradient></TouchableOpacity>
                            <TouchableOpacity style={styles.actionCard} onPress={() => setIsConfigModalVisible(true)}><LinearGradient colors={['#fbbf24', '#d97706']} style={styles.actionGradient}><Ionicons name="settings" size={24} color="#FFF" /><Text style={styles.actionText}>Sys Config</Text></LinearGradient></TouchableOpacity>
                        </ScrollView>

                        <View style={styles.performanceRow}>
                            <View style={[styles.feedCard, { flex: 1, marginRight: 15 }]}>
                                <Text style={styles.feedTitle}>Sales Velocity</Text>
                                <View style={styles.chartContainer}>
                                    <LinearGradient colors={['#6366f120', 'transparent']} style={styles.chartMock}>{[40, 70, 45, 90, 65, 80, 50].map((h, i) => (<View key={i} style={[styles.chartBar, { height: h }]} />))}</LinearGradient>
                                </View>
                            </View>
                            <View style={styles.trafficModule}>
                                <Ionicons name="earth" size={40} color="#6366f1" opacity={0.3} />
                                <Text style={styles.trafficNum}>{liveUsers}</Text>
                                <Text style={styles.trafficLabel}>Live Visitors</Text>
                                <View style={styles.pulseDot} />
                            </View>
                        </View>

                        <Text style={styles.sectionHeader}>Warehouse Pulse</Text>
                        <View style={styles.stockHealthGrid}>
                            <View style={styles.healthCard}>
                                <View style={styles.healthHeader}><Text style={styles.healthName}>Men Cotton</Text><Text style={styles.healthVal}>82%</Text></View>
                                <View style={styles.progressBg}><View style={[styles.progressFill, { width: '82%', backgroundColor: '#10b981' }]} /></View>
                            </View>
                            <View style={styles.healthCard}>
                                <View style={styles.healthHeader}><Text style={styles.healthName}>Accessories</Text><Text style={styles.healthVal}>15%</Text></View>
                                <View style={styles.progressBg}><View style={[styles.progressFill, { width: '15%', backgroundColor: '#f43f5e' }]} /></View>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {activeTab === 'products' && (
                    <View style={[styles.contentBody, { width: contentWidth }]}>
                        <View style={styles.productControls}>
                            <View style={styles.searchBox}><Ionicons name="search" size={20} color="#94a3b8" /><TextInput style={styles.searchInput} placeholder="Search catalog..." value={searchQuery} onChangeText={setSearchQuery} /></View>
                            <TouchableOpacity style={styles.fabAdd} onPress={() => openProductModal()}><LinearGradient colors={['#1e293b', '#334155']} style={styles.fabGradient}><Ionicons name="add" size={28} color="#FFF" /></LinearGradient></TouchableOpacity>
                        </View>
                        <Text style={styles.listTitle}>Category Explorer</Text>
                        <View style={styles.categoryAdminGrid}>{categories.map(renderCategoryCard)}</View>
                        <View style={styles.listHeaderRow}>
                            <Text style={styles.listTitle}>{selectedCategory ? `${selectedCategory} Stock` : 'Inventory Central'} ({processedProducts.length})</Text>
                            {selectedCategory && <TouchableOpacity onPress={() => setSelectedCategory(null)}><Text style={styles.clearFilter}>Reset</Text></TouchableOpacity>}
                        </View>
                        <View style={styles.productGrid}>{processedProducts.map(renderProductItem)}</View>
                    </View>
                )}

                {activeTab === 'orders' && (
                    <View style={[styles.contentBody, { width: contentWidth }]}>
                        <View style={styles.orderListHeader}><Text style={styles.listTitle}>Global Order Feed ({orders.length})</Text></View>
                        {orders.length === 0 ? (<View style={styles.emptyWrap}><Image source={{ uri: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=400' }} style={styles.emptyImg} contentFit="cover" /><Text style={styles.emptyBig}>Clear Skies</Text><Text style={styles.emptySmall}>No pending actions in the pipeline.</Text></View>) : (<View style={styles.orderGrid}>{orders.map(renderOrderItem)}</View>)}
                    </View>
                )}

                {activeTab === 'analytics' && (
                    <View style={[styles.contentBody, { width: contentWidth }]}>
                        <View style={styles.aiInsightsContainer}>
                            <View style={[styles.insightCard, { height: 200, justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="bar-chart" size={48} color="#6366f1" />
                                <Text style={[styles.insightTitle, { marginTop: 15 }]}>Advanced Analytics</Text>
                                <Text style={styles.insightMsg}>Deep dive reports generating...</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Product Modal */}
            <Modal visible={isProductModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsProductModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}><Text style={styles.modalTitle}>{modalMode === 'add' ? 'Catalog Onboarding' : 'Edit Manifest'}</Text><TouchableOpacity onPress={() => setIsProductModalVisible(false)}><Ionicons name="close" size={24} color="#1e293b" /></TouchableOpacity></View>
                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}><Text style={styles.inputLabel}>IDENTIFIER NAME</Text><TextInput style={styles.modalInput} value={formName} onChangeText={setFormName} placeholder="Manifest name" /></View>
                            <View style={styles.inputGroup}><Text style={styles.inputLabel}>MARKET VALUATION (₹)</Text><TextInput style={styles.modalInput} value={formPrice} onChangeText={setFormPrice} keyboardType="numeric" placeholder="0.00" /></View>
                            <View style={styles.inputGroup}><Text style={styles.inputLabel}>SECTOR CLASSIFICATION</Text>{!showNewCategoryInput ? (<View style={styles.categoriesGrid}>{categories.map((cat) => (<TouchableOpacity key={cat} style={[styles.categoryChoice, formCategory === cat && styles.categoryChoiceActive]} onPress={() => setFormCategory(cat)}><Text style={[styles.categoryChoiceText, formCategory === cat && styles.categoryChoiceTextActive]}>{cat}</Text></TouchableOpacity>))}<TouchableOpacity style={styles.addCategoryBtn} onPress={() => setShowNewCategoryInput(true)}><Ionicons name="add" size={18} color="#6366f1" /><Text style={styles.addCategoryText}>New Sector</Text></TouchableOpacity></View>) : (<View style={styles.newCatRow}><TextInput style={[styles.modalInput, { flex: 1, marginBottom: 0 }]} value={newCategoryName} onChangeText={setNewCategoryName} placeholder="New sector" autoFocus /><TouchableOpacity style={styles.cancelNewCat} onPress={() => setShowNewCategoryInput(false)}><Ionicons name="close-circle" size={24} color="#f43f5e" /></TouchableOpacity></View>)}</View>
                        </ScrollView>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProduct}><LinearGradient colors={['#1e293b', '#334155']} style={styles.saveGradient}><Text style={styles.saveText}>{modalMode === 'add' ? 'Commit Entry' : 'Push Updates'}</Text></LinearGradient></TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* System Config Modal */}
            <Modal visible={isConfigModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsConfigModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}><Text style={styles.modalTitle}>System Configuration</Text><TouchableOpacity onPress={() => setIsConfigModalVisible(false)}><Ionicons name="close" size={24} color="#1e293b" /></TouchableOpacity></View>
                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}><Text style={styles.inputLabel}>APP NAME</Text><TextInput style={styles.modalInput} value={configAppName} onChangeText={setConfigAppName} placeholder="BuyWay" /></View>
                            <View style={styles.inputGroup}><Text style={styles.inputLabel}>APP LOGO URL</Text><TextInput style={styles.modalInput} value={configLogo} onChangeText={setConfigLogo} placeholder="https://..." /></View>
                            <View style={styles.inputGroup}><Text style={styles.inputLabel}>FREE SHIPPING THRESHOLD (₹)</Text><TextInput style={styles.modalInput} value={configThreshold} onChangeText={setConfigThreshold} keyboardType="numeric" placeholder="999" /></View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>MAINTENANCE CORE</Text>
                                <View style={styles.toggleRow}>
                                    <TouchableOpacity style={[styles.toggleBtn, !configMaintenance && styles.toggleBtnActive]} onPress={() => setConfigMaintenance(false)}><Text style={[styles.toggleText, !configMaintenance && styles.toggleTextActive]}>ONLINE</Text></TouchableOpacity>
                                    <TouchableOpacity style={[styles.toggleBtn, configMaintenance && styles.toggleBtnActiveOut]} onPress={() => setConfigMaintenance(true)}><Text style={[styles.toggleText, configMaintenance && styles.toggleTextActiveOut]}>MAINTENANCE</Text></TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveConfig}><LinearGradient colors={['#fbbf24', '#d97706']} style={styles.saveGradient}><Text style={styles.saveText}>Update System Core</Text></LinearGradient></TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    pageGradient: { ...StyleSheet.absoluteFillObject },
    scrollView: { flex: 1 },
    hero: { paddingBottom: 20 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backFab: {
        width: 45, height: 45, borderRadius: 15, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 5 },
            web: { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
        })
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    headerIcon: { position: 'relative' },
    dotBadge: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#f43f5e', borderWidth: 1.5, borderColor: '#f1f5f9' },
    adminAvatar: { width: 45, height: 45, borderRadius: 15, borderWidth: 2, borderColor: '#FFF' },
    welcomeSection: { marginTop: 30 },
    brandTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
    brandMiniLogo: { width: 28, height: 28, borderRadius: 8 },
    welcomeSmall: { fontSize: 13, fontWeight: '800', color: '#6366f1', letterSpacing: 3 },
    welcomeBig: { fontSize: 32, fontWeight: '900', color: '#1e293b', marginTop: 5 },
    tabBar: { flexDirection: 'row', backgroundColor: 'rgba(148, 163, 184, 0.1)', borderRadius: 20, padding: 6, marginTop: 20 },
    tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
    tabItemActive: {
        backgroundColor: '#FFF',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
        })
    },
    tabLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
    tabLabelActive: { color: '#1e293b' },
    contentBody: { marginTop: 25 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
    statCard: {
        height: 160, borderRadius: 30, overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 8 },
            web: { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
        })
    },
    statGradient: { flex: 1, padding: 20, position: 'relative' },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statIconBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
    statPrice: { fontSize: 28, fontWeight: '900', color: '#FFF', marginTop: 20 },
    statName: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    statCircle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)' },
    sectionHeader: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginTop: 35, marginBottom: 20, letterSpacing: 0.5 },
    aiInsightsContainer: { gap: 12 },
    insightCard: {
        backgroundColor: '#FFF', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center',
        ...Platform.select({
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
        })
    },
    insightIconWrap: { width: 45, height: 45, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    insightContent: { marginLeft: 15, flex: 1 },
    insightTitle: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
    insightMsg: { fontSize: 12, color: '#94a3b8', marginTop: 2, lineHeight: 18 },
    actionsScroll: { marginHorizontal: -20, paddingHorizontal: 0, marginBottom: 10 },
    actionCard: {
        width: 140, height: 110, borderRadius: 28, overflow: 'hidden', marginRight: 15,
        ...Platform.select({
            android: { elevation: 5 },
            web: { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
        })
    },
    actionGradient: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', gap: 10 },
    actionText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
    performanceRow: { flexDirection: 'row', marginTop: 20 },
    feedCard: {
        backgroundColor: '#FFF', borderRadius: 30, padding: 20,
        ...Platform.select({
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
        })
    },
    feedTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 15 },
    chartContainer: { height: 100 },
    chartMock: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10, borderRadius: 20 },
    chartBar: { width: 6, backgroundColor: '#6366f1', borderRadius: 3, opacity: 0.8 },
    trafficModule: {
        width: 120, backgroundColor: '#FFF', borderRadius: 30, padding: 20, alignItems: 'center', justifyContent: 'center', position: 'relative',
        ...Platform.select({
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
        })
    },
    trafficNum: { fontSize: 24, fontWeight: '900', color: '#1e293b', marginTop: 10 },
    trafficLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
    pulseDot: { position: 'absolute', top: 15, right: 15, width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
    stockHealthGrid: { gap: 12 },
    healthCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 18,
        ...Platform.select({
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
        })
    },
    healthHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    healthName: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
    healthVal: { fontSize: 12, fontWeight: '900', color: '#64748b' },
    progressBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    categoryAdminGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 30 },
    categoryAdminCard: {
        height: 180, borderRadius: 30, overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 8 },
            web: { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
        })
    },
    categoryAdminImage: { width: '100%', height: '100%' },
    categoryAdminGradient: { ...StyleSheet.absoluteFillObject, padding: 15, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end' },
    categoryInfoText: { flex: 1 },
    categoryAdminName: { color: '#FFF', fontSize: 20, fontWeight: '900' },
    categoryAdminCount: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', marginTop: 2 },
    categoryAdminArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    categoryAdminArrowActive: { backgroundColor: '#FFF' },
    listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    listTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    clearFilter: { fontSize: 14, fontWeight: '700', color: '#6366f1' },
    productControls: { flexDirection: 'row', gap: 15, marginBottom: 25 },
    searchBox: {
        flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 15, height: 55,
        ...Platform.select({
            android: { elevation: 3 },
            web: { boxShadow: '0 3px 6px rgba(0,0,0,0.05)' }
        })
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b', fontWeight: '600' },
    fabAdd: {
        width: 55, height: 55, borderRadius: 20, overflow: 'hidden',
        ...Platform.select({
            android: { elevation: 5 },
            web: { boxShadow: '0 5px 10px rgba(0,0,0,0.1)' }
        })
    },
    fabGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    productGrid: { gap: 15 },
    productCard: {
        backgroundColor: '#FFF', borderRadius: 24, padding: 12,
        ...Platform.select({
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
        })
    },
    productMain: { flexDirection: 'row', alignItems: 'center' },
    productImg: { width: 70, height: 70, borderRadius: 18, backgroundColor: '#f1f5f9' },
    productInfo: { flex: 1, marginLeft: 15 },
    productName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    categoryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    productCat: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1', marginHorizontal: 8 },
    stockStatus: { fontSize: 11, fontWeight: '700', color: '#10b981' },
    stockOut: { color: '#f43f5e' },
    productPricing: { alignItems: 'flex-end', gap: 8 },
    productPrice: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    editBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    orderListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    orderGrid: { gap: 15 },
    orderCard: {
        backgroundColor: '#FFF', borderRadius: 24, padding: 16,
        ...Platform.select({
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
        })
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F8F9FA', marginBottom: 12 },
    orderBasicInfo: { gap: 2 },
    orderId: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
    orderDate: { fontSize: 12, color: '#94a3b8' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    statusProcessing: { backgroundColor: '#ebf5ff' },
    statusText: { fontSize: 11, fontWeight: '700', color: '#3b82f6' },
    orderItemsPreview: { marginBottom: 12 },
    orderItemsText: { fontSize: 13, color: '#475569', lineHeight: 18 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderAddress: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, marginRight: 10 },
    addressText: { fontSize: 12, color: '#94a3b8' },
    orderTotal: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
    emptyWrap: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20 },
    emptyImg: { width: 200, height: 200, borderRadius: 100, marginBottom: 30 },
    emptyBig: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    emptySmall: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 10, lineHeight: 22 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, maxHeight: '85%', alignSelf: 'center' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
    modalBody: { marginBottom: 20 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 11, fontWeight: '900', color: '#94a3b8', marginBottom: 8, letterSpacing: 1 },
    modalInput: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, color: '#1e293b', fontWeight: '600', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 10 },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryChoice: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: 'transparent' },
    categoryChoiceActive: { backgroundColor: '#e0e7ff', borderColor: '#6366f1' },
    categoryChoiceText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    categoryChoiceTextActive: { color: '#6366f1' },
    addCategoryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#6366f1', gap: 4 },
    addCategoryText: { fontSize: 13, fontWeight: '700', color: '#6366f1' },
    newCatRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cancelNewCat: { padding: 5 },
    toggleRow: { flexDirection: 'row', gap: 12 },
    toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
    toggleBtnActive: { backgroundColor: '#dcfce7', borderColor: '#10b981' },
    toggleBtnActiveOut: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
    toggleText: { fontSize: 14, fontWeight: '700', color: '#94a3b8' },
    toggleTextActive: { color: '#10b981' },
    toggleTextActiveOut: { color: '#ef4444' },
    saveBtn: { borderRadius: 20, overflow: 'hidden', marginBottom: Platform.OS === 'ios' ? 20 : 0, marginTop: 10 },
    saveGradient: { paddingVertical: 18, alignItems: 'center' },
    saveText: { color: '#FFF', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
});
