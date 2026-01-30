import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const MAX_WIDTH = 800; // Constrain welcome screen width

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver,
      }),
    ]).start();
  }, []);

  const contentWidth = Math.min(width - 40, MAX_WIDTH);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Welcome", headerShown: false }} />

      {/* Gradient Background */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460', '#533483']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Decorative circles */}
      <View style={styles.decorativeContainer}>
        <View style={[styles.circle, styles.circle1, { width: width * 0.7, height: width * 0.7, top: -width * 0.2, right: -width * 0.2 }]} />
        <View style={[styles.circle, styles.circle2, { width: width * 0.5, height: width * 0.5, bottom: height * 0.25, left: -width * 0.25 }]} />
        <View style={[styles.circle, styles.circle3, { width: width * 0.35, height: width * 0.35, bottom: -width * 0.1, right: -width * 0.1 }]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 24,
            alignItems: 'center'
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={{ width: contentWidth, flex: 1, justifyContent: 'space-between', minHeight: height - insets.top - insets.bottom - 44 }}>
          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoOuter}>
              <LinearGradient
                colors={['#e94560', '#ff6b6b', '#feca57']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <View style={styles.logoInner}>
                  <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.logoImage}
                    contentFit="contain"
                  />
                </View>
              </LinearGradient>
            </View>
          </Animated.View>


          {/* Brand Name */}
          <Animated.View
            style={[
              styles.brandSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <Text style={styles.brandName}>BuyWay</Text>
            <View style={styles.taglineContainer}>
              <View style={styles.taglineLine} />
              <Text style={styles.tagline}>FASHION & LIFESTYLE</Text>
              <View style={styles.taglineLine} />
            </View>
          </Animated.View>

          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <Text style={styles.heroTitle}>Discover Your{'\n'}Perfect Style</Text>
            <Text style={styles.heroSubtitle}>
              Explore thousands of trendy fashion items curated just for you
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View
            style={[
              styles.featuresRow,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="flash" size={18} color="#feca57" />
              </View>
              <Text style={styles.featureText}>Fast{'\n'}Delivery</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="shield-checkmark" size={18} color="#48dbfb" />
              </View>
              <Text style={styles.featureText}>Secure{'\n'}Payment</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="diamond" size={18} color="#ff6b6b" />
              </View>
              <Text style={styles.featureText}>Premium{'\n'}Quality</Text>
            </View>
          </Animated.View>

          {/* Buttons */}
          <Animated.View
            style={[
              styles.buttonSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/login")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#e94560', '#ff6b6b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/(auth)/signup")}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* API Test Button */}
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => router.push("/test-auth")}
              activeOpacity={0.8}
            >
              <Ionicons name="flask-outline" size={16} color="#feca57" />
              <Text style={styles.testButtonText}>Test API</Text>
            </TouchableOpacity>

            {/* Dashboard Preview Buttons */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Preview Dashboards:</Text>
              <View style={styles.previewButtons}>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => router.push("/(user)/home")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person" size={16} color="#48dbfb" />
                  <Text style={styles.previewButtonText}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => router.push("/(admin)/dashboard")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                  <Text style={styles.previewButtonText}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms</Text> &{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    backgroundColor: '#e94560',
  },
  circle2: {
    backgroundColor: '#48dbfb',
  },
  circle3: {
    backgroundColor: '#feca57',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  // Logo
  logoSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  logoOuter: {
    borderRadius: 28,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 12 },
      web: { boxShadow: '0 6px 12px rgba(0,0,0,0.3)' }
    }),
  },
  logoGradient: {
    borderRadius: 26,
    padding: 16,
  },
  logoInner: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 10,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  // Brand
  brandSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  taglineLine: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 10,
  },
  tagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 3,
    fontWeight: '500',
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    marginTop: 28,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  // Features
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: 24,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  featureDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  // Buttons
  buttonSection: {
    marginTop: 24,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#e94560', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 8 },
      web: { boxShadow: '0 4px 10px rgba(233, 69, 96, 0.3)' }
    }),
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginBottom: 12,
  },
  testButtonText: {
    color: '#feca57',
    fontSize: 13,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewButtonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  termsLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'underline',
  },
});
