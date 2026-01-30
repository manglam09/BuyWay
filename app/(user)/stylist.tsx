import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Bubble, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { Colors } from '../../constants/theme';

// Initialize Gemini
const genAI = new GoogleGenerativeAI("AIzaSyDHg0Ju7ZJmUX-oPArAc7zzUINGwUKXRuo");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are 'BuyWay AI Stylist', a premium personal fashion consultant for the BuyWay e-commerce app. Your goal is to help users find their perfect style and suggest clothing. Rules: 1. ONLY talk about clothing, fashion, style tips, and outfit pairings. 2. If a user asks about anything else (politics, cooking, general knowledge), politely redirect them to fashion. 3. Use a helpful, trendy, and enthusiastic tone. 4. Mention that BuyWay has a great collection of 'Men', 'Women', and 'Kids' wear. 5. Do not perform general web searches or answer non-fashion questions. 6. If asked about prices, say they vary by brand and to check the individual product pages.",
});

export default function StylistChat() {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        setMessages([
            {
                _id: 1,
                text: "Hi there! I'm your BuyWay Personal Stylist. 👗\n\nNot sure what to wear for that party? Or need a seasonal wardrobe refresh? Ask me anything about fashion!",
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'BuyWay Stylist',
                    avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
                },
            },
        ]);
    }, []);

    const onSend = useCallback(async (newMessages: IMessage[] = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));

        const userMessage = newMessages[0].text;
        setIsTyping(true);

        try {
            // Gemini history MUST start with a 'user' message.
            // We filter out the initial bot greeting and ensure correct order.
            const history = messages
                .filter(m => m._id !== 1) // Remove initial bot greeting if it has ID 1
                .map(m => ({
                    role: m.user._id === 1 ? "user" : "model", // 1 is user, 2 is bot
                    parts: [{ text: m.text }],
                }))
                .reverse(); // GiftedChat is reverse chronological, Gemini needs chronological

            const chat = model.startChat({ history });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();

            const botMessage: IMessage = {
                _id: Math.random().toString(),
                text: text,
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'BuyWay Stylist',
                    avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
                },
            };

            setMessages(previousMessages => GiftedChat.append(previousMessages, [botMessage]));
        } catch (error) {
            console.error("Gemini Error:", error);
            const errorMessage: IMessage = {
                _id: Math.random().toString(),
                text: "Sorry, I'm having a little fashion emergency (technical glitch). Could you try asking that again?",
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'BuyWay Stylist',
                },
            };
            setMessages(previousMessages => GiftedChat.append(previousMessages, [errorMessage]));
        } finally {
            setIsTyping(false);
        }
    }, [messages]);

    const renderBubble = (props: any) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: Colors.primary,
                        borderRadius: 15,
                        padding: 5,
                    },
                    left: {
                        backgroundColor: Colors.white,
                        borderRadius: 15,
                        padding: 5,
                        borderWidth: 1,
                        borderColor: Colors.background,
                    },
                }}
                textStyle={{
                    right: {
                        color: Colors.white,
                        fontSize: 14,
                    },
                    left: {
                        color: Colors.primary,
                        fontSize: 14,
                    },
                }}
            />
        );
    };

    const renderSend = (props: any) => {
        return (
            <Send {...props}>
                <View style={styles.sendButton}>
                    <Ionicons name="send" size={20} color={Colors.primary} />
                </View>
            </Send>
        );
    };

    const renderInputToolbar = (props: any) => {
        return (
            <InputToolbar
                {...props}
                containerStyle={styles.inputToolbar}
                primaryStyle={{ alignItems: 'center' }}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>AI Personal Stylist</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, backgroundColor: Colors.lavender }}>
                <GiftedChat
                    messages={messages}
                    onSend={messages => onSend(messages)}
                    user={{ _id: 1 }}
                    renderBubble={renderBubble}
                    renderSend={renderSend}
                    renderInputToolbar={renderInputToolbar}
                    textInputProps={{
                        placeholder: "Ask about style tips..."
                    }}
                    isTyping={isTyping}
                    renderLoading={() => <ActivityIndicator size="large" color={Colors.primary} />}
                />
            </View>

            {Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background,
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    backButton: {
        padding: 5,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.success,
        marginRight: 5,
    },
    statusText: {
        fontSize: 12,
        color: Colors.secondary,
    },
    moreButton: {
        padding: 5,
    },
    inputToolbar: {
        marginHorizontal: 15,
        marginBottom: 10,
        borderRadius: 25,
        borderTopWidth: 0,
        backgroundColor: Colors.white,
        paddingHorizontal: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sendButton: {
        marginRight: 5,
        marginBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: 35,
        height: 35,
    },
});
