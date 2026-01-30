import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../components/ToastProvider';
import authService from '../../services/authService';

const MAX_WIDTH = 1200;

export default function ProfileScreen() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);

    // Mock user state
    const [userInfo, setUserInfo] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 9876543210',
        image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80',
        address: 'Flat 101, Pearl Apartment, Sector 12, New Delhi - 110001'
    });

    const [notifications, setNotifications] = useState(true);

    const contentWidth = Math.min(width - 40, MAX_WIDTH);

    const handleLogout = async () => {
        await authService.logout();
        router.replace('/');
    };

    const handleSave = () => {
        setIsEditing(false);
        showToast('Profile updated successfully!', 'success');
    };

    const ProfileOption = ({ icon, label, value, onPress, color = '#1A1A2E' }: any) => (
        <TouchableOpacity style={styles.optionItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.optionIconContainer, { backgroundColor: color + '10' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <View style={styles.optionTextContainer}>
                <Text style={styles.optionLabel}>{label}</Text>
                {value && <Text style={styles.optionValue}>{value}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ADADAD" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100, alignItems: 'center' }}
            >
                <View style={[styles.header, { paddingTop: insets.top + 20, width: '100%', alignItems: 'center' }]}>
                    <View style={[styles.profileHeaderContent, { width: contentWidth }]}>
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: userInfo.image }}
                                style={styles.profileImage}
                                contentFit="cover"
                                transition={300}
                            />
                            <TouchableOpacity style={styles.editImageBtn}>
                                <Ionicons name="camera" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{userInfo.name}</Text>
                        <Text style={styles.userEmail}>{userInfo.email}</Text>

                        <TouchableOpacity
                            style={styles.editProfileBtn}
                            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                        >
                            <LinearGradient
                                colors={isEditing ? ['#10b981', '#059669'] : ['#1A1A2E', '#16213E']}
                                style={styles.editBtnGradient}
                            >
                                <Text style={styles.editBtnText}>{isEditing ? 'Save Profile' : 'Edit Profile'}</Text>
                                <Ionicons name={isEditing ? 'checkmark' : 'create-outline'} size={18} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.mainWrapper, { width: contentWidth }]}>
                    {/* Account Settings */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Information</Text>
                        <View style={styles.card}>
                            {isEditing ? (
                                <View style={styles.editContainer}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Full Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={userInfo.name}
                                            onChangeText={(txt) => setUserInfo(p => ({ ...p, name: txt }))}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Phone Number</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={userInfo.phone}
                                            onChangeText={(txt) => setUserInfo(p => ({ ...p, phone: txt }))}
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Delivery Address</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            value={userInfo.address}
                                            onChangeText={(txt) => setUserInfo(p => ({ ...p, address: txt }))}
                                            multiline
                                        />
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <ProfileOption icon="person-outline" label="Full Name" value={userInfo.name} />
                                    <ProfileOption icon="call-outline" label="Phone Number" value={userInfo.phone} />
                                    <ProfileOption icon="location-outline" label="Address" value={userInfo.address} />
                                </>
                            )}
                        </View>
                    </View>

                    {/* Preferences */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preferences</Text>
                        <View style={styles.card}>
                            <View style={styles.optionItem}>
                                <View style={[styles.optionIconContainer, { backgroundColor: '#3b82f610' }]}>
                                    <Ionicons name="notifications-outline" size={22} color="#3b82f6" />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionLabel}>Notifications</Text>
                                </View>
                                <Switch
                                    value={notifications}
                                    onValueChange={setNotifications}
                                    trackColor={{ false: '#E9ECEF', true: '#10b981' }}
                                />
                            </View>
                            <ProfileOption icon="earth-outline" label="Language" value="English (US)" />
                            <ProfileOption icon="card-outline" label="Payment Methods" value="Visa **** 4242" />
                        </View>
                    </View>

                    {/* Support & Legal */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <ProfileOption icon="help-circle-outline" label="Help Center" />
                            <ProfileOption icon="shield-checkmark-outline" label="Privacy Policy" />
                            <ProfileOption
                                icon="log-out-outline"
                                label="Logout"
                                onPress={handleLogout}
                                color="#ef4444"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

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
                <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(user)/orders')}>
                    <Ionicons name="bag-handle-outline" size={22} color="#6C757D" />
                    <Text style={styles.navText}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person" size={22} color="#e94560" />
                    <Text style={[styles.navText, styles.navTextActive]}>Profile</Text>
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
        paddingBottom: 30,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15 },
            android: { elevation: 5 },
            web: { boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }
        }),
    },
    profileHeaderContent: {
        alignItems: 'center',
    },
    imageWrapper: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#F8F9FA',
    },
    editImageBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#e94560',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    userEmail: {
        fontSize: 14,
        color: '#ADADAD',
        marginTop: 4,
        marginBottom: 20,
    },
    editProfileBtn: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    editBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    editBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    mainWrapper: {},
    section: {
        marginTop: 25,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A1A2E',
        marginBottom: 15,
        marginLeft: 5,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10 },
            android: { elevation: 2 },
            web: { boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }
        }),
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
    },
    optionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    optionValue: {
        fontSize: 12,
        color: '#ADADAD',
        marginTop: 2,
    },
    editContainer: {
        padding: 10,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#ADADAD',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#1A1A2E',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
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
