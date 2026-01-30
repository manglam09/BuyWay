import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
    const { signup, isLoading } = useAuth();
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        try {
            await signup({
                name: name.trim(),
                email: email.trim(),
                password,
                phone: phone.trim() || undefined,
            });
            router.replace('/');
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message || 'Unable to create account. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Gradient Background */}
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460', '#533483']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            />

            {/* Decorative circles */}
            <View style={styles.decorativeContainer}>
                <View style={[styles.circle, styles.circle1]} />
                <View style={[styles.circle, styles.circle2]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Join BuyWay and discover amazing fashion deals!
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                                <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { outlineWidth: 0 } as any]}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (errors.name) setErrors({ ...errors, name: undefined });
                                    }}
                                    autoCapitalize="words"
                                    autoComplete="off"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType="none"
                                />
                            </View>
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                                <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { outlineWidth: 0 } as any]}
                                    placeholder="Enter your email"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="off"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    textContentType="none"
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        {/* Phone Input (Optional) */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Phone Number <Text style={styles.optionalText}>(Optional)</Text></Text>
                            <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                                <Ionicons name="call-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { outlineWidth: 0 } as any]}
                                    placeholder="Enter your phone number"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    autoComplete="off"
                                    textContentType="none"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                                <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { outlineWidth: 0 } as any]}
                                    placeholder="Create a password"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errors.password) setErrors({ ...errors, password: undefined });
                                    }}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoComplete="off"
                                    autoCorrect={false}
                                    textContentType="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="rgba(255,255,255,0.5)"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Confirm Password</Text>
                            <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                                <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { outlineWidth: 0 } as any]}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                                    }}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoComplete="off"
                                    autoCorrect={false}
                                    textContentType="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="rgba(255,255,255,0.5)"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                        </View>

                        {/* Terms */}
                        <Text style={styles.termsText}>
                            By creating an account, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>

                        {/* Signup Button */}
                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#e94560', '#ff6b6b']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.signupButtonText}>Create Account</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        width: width * 0.7,
        height: width * 0.7,
        backgroundColor: '#e94560',
        top: -width * 0.3,
        right: -width * 0.2,
    },
    circle2: {
        width: width * 0.5,
        height: width * 0.5,
        backgroundColor: '#48dbfb',
        bottom: height * 0.1,
        left: -width * 0.25,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 22,
    },
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputContainer: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 10,
    },
    optionalText: {
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '400',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        height: 56,
    },
    inputError: {
        borderColor: '#e94560',
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    eyeButton: {
        padding: 4,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 12,
        marginTop: 8,
        marginLeft: 4,
    },
    termsText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    termsLink: {
        color: '#feca57',
        textDecorationLine: 'underline',
    },
    signupButton: {
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 8,
    },
    signupButtonDisabled: {
        opacity: 0.7,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 28,
        marginBottom: 16,
    },
    loginText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
    },
    loginLink: {
        fontSize: 14,
        color: '#feca57',
        fontWeight: '700',
    },
});
