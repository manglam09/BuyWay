import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface Props {
    isVisible: boolean;
    imageUri: string;
    onClose: () => void;
}

export const ImageZoomModal: React.FC<Props> = ({ isVisible, imageUri, onClose }) => {
    const { width, height } = useWindowDimensions();
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            opacity.value = 0;
            scale.value = 1;
            translateX.value = 0;
            translateY.value = 0;
        }
    }, [isVisible]);

    const resetZoom = useCallback(() => {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    }, []);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            if (scale.value < 1) {
                resetZoom();
            } else {
                savedScale.value = scale.value;
            }
        });

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + e.translationX;
                translateY.value = savedTranslateY.value + e.translationY;
            }
        })
        .onEnd(() => {
            if (scale.value > 1) {
                savedTranslateX.value = translateX.value;
                savedTranslateY.value = translateY.value;
            }
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            if (scale.value !== 1) {
                resetZoom();
            } else {
                scale.value = withSpring(2.5);
                savedScale.value = 2.5;
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={styles.container}>
                <Animated.View style={[styles.overlay, overlayStyle]}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={32} color="#FFF" />
                    </TouchableOpacity>

                    <GestureDetector gesture={composedGesture}>
                        <Animated.View style={[styles.imageWrapper, { width, height: height * 0.7 }, animatedStyle]}>
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.image}
                                contentFit="contain"
                            />
                        </Animated.View>
                    </GestureDetector>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Pinch to zoom • Double tap to expand</Text>
                    </View>
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 25,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        // width and height set dynamically
    },
    image: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
