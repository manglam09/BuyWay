import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('success');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [translateY] = useState(new Animated.Value(-100));

    const showToast = useCallback((msg: string, toastType: ToastType = 'success') => {
        setMessage(msg);
        setType(toastType);
        setVisible(true);

        // Animate In
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 20,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();

        // Auto Hide after 3 seconds
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => setVisible(false));
        }, 3000);
    }, [fadeAnim, translateY]);

    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            default: return 'information-circle';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success': return ['#10b981', 'rgba(16, 185, 129, 0.1)'];
            case 'error': return ['#e94560', 'rgba(233, 69, 96, 0.1)'];
            default: return ['#1A1A2E', 'rgba(26, 26, 46, 0.1)'];
        }
    };

    const [mainColor, bgColor] = getColors();

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {visible && (
                <View style={styles.overlay} pointerEvents="none">
                    <Animated.View
                        style={[
                            styles.toastContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY }],
                                backgroundColor: '#FFF',
                                borderColor: mainColor,
                            }
                        ]}
                    >
                        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                            <Ionicons name={getIcon() as any} size={20} color={mainColor} />
                        </View>
                        <Text style={styles.messageText}>{message}</Text>
                    </Animated.View>
                </View>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
    },
    toastContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingRight: 20,
        borderRadius: 16,
        borderWidth: 1,
        width: width * 0.9,
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    messageText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A2E',
        flex: 1,
    },
});
