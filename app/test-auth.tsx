import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../services/api";

const { width } = Dimensions.get("window");

export default function TestAuth() {
    const insets = useSafeAreaInsets();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

    const testLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter both username and password");
            return;
        }

        setIsLoading(true);
        setResponse(null);
        setIsSuccess(null);

        try {
            console.log("🔄 Testing API call to: /auth/login");
            console.log("📦 Payload:", { email: username.trim(), password: password });

            const res = await api.post("/auth/login", {
                email: username.trim(),
                password: password,
            });

            console.log("✅ Response:", res.data);
            setResponse(JSON.stringify(res.data, null, 2));
            setIsSuccess(true);

            Alert.alert(
                "✅ Login Successful!",
                `Welcome ${res.data.user?.name || res.data.user?.email || username}!\n\nRole: ${res.data.user?.role || "N/A"}`,
                [{ text: "OK" }]
            );
        } catch (error: any) {
            console.error("❌ Error:", error);

            let errorMessage = "Unknown error";
            let errorDetails = "";

            if (error.response) {
                // Server responded with error
                errorMessage = error.response.data?.message || error.response.statusText;
                errorDetails = `Status: ${error.response.status}\n${JSON.stringify(error.response.data, null, 2)}`;
            } else if (error.request) {
                // No response from server
                errorMessage = "No response from server";
                errorDetails = "The server might be offline or unreachable.\nCheck if backend is running on: http://192.168.0.181:8080";
            } else {
                errorMessage = error.message;
            }

            setResponse(`Error: ${errorMessage}\n\n${errorDetails}`);
            setIsSuccess(false);

            Alert.alert("❌ Login Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={["#1a1a2e", "#16213e", "#0f3460", "#533483"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            />

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="flask" size={40} color="#feca57" />
                    </View>
                    <Text style={styles.title}>API Test Page</Text>
                    <Text style={styles.subtitle}>
                        Test authentication API calls to verify backend connection
                    </Text>
                </View>

                {/* API Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>🔗 Backend URL</Text>
                    <Text style={styles.infoText}>http://192.168.0.181:8080/api</Text>
                    <Text style={styles.infoTitle}>📍 Endpoint</Text>
                    <Text style={styles.infoText}>/auth/login</Text>
                    <View style={styles.noteBox}>
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text style={styles.noteText}>
                            All credentials are validated by your backend server
                        </Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Username / Email</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons
                                name="person-outline"
                                size={20}
                                color="rgba(255,255,255,0.5)"
                            />
                            <TextInput
                                style={[styles.input, { outlineWidth: 0 } as any]}
                                placeholder="Enter username or email"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoComplete="off"
                                autoCorrect={false}
                                spellCheck={false}
                                textContentType="none"
                                importantForAutofill="no"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color="rgba(255,255,255,0.5)"
                            />
                            <TextInput
                                style={[styles.input, { outlineWidth: 0 } as any]}
                                placeholder="Enter password"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="off"
                                autoCorrect={false}
                                textContentType="none"
                                importantForAutofill="no"
                            />
                        </View>
                    </View>

                    {/* Test Button */}
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={testLogin}
                        disabled={isLoading}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={["#e94560", "#ff6b6b"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={20} color="#fff" />
                                    <Text style={styles.testButtonText}>Test Login API</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Response Card */}
                {response && (
                    <View
                        style={[
                            styles.responseCard,
                            isSuccess ? styles.responseSuccess : styles.responseError,
                        ]}
                    >
                        <View style={styles.responseHeader}>
                            <Ionicons
                                name={isSuccess ? "checkmark-circle" : "close-circle"}
                                size={24}
                                color={isSuccess ? "#10b981" : "#ef4444"}
                            />
                            <Text
                                style={[
                                    styles.responseTitle,
                                    { color: isSuccess ? "#10b981" : "#ef4444" },
                                ]}
                            >
                                {isSuccess ? "Success Response" : "Error Response"}
                            </Text>
                        </View>
                        <ScrollView style={styles.responseScroll} nestedScrollEnabled>
                            <Text style={styles.responseText}>{response}</Text>
                        </ScrollView>
                    </View>
                )}

                {/* Console Hint */}
                <View style={styles.hintCard}>
                    <Ionicons name="information-circle" size={20} color="#feca57" />
                    <Text style={styles.hintText}>
                        Check browser console (F12) for detailed API logs
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e",
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: "rgba(254, 202, 87, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.6)",
        textAlign: "center",
        lineHeight: 22,
    },
    infoCard: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    infoTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: "rgba(255,255,255,0.5)",
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: "#feca57",
        fontFamily: "monospace",
        marginBottom: 12,
    },
    noteBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        padding: 10,
        borderRadius: 10,
        marginTop: 4,
    },
    noteText: {
        color: "#10b981",
        fontSize: 12,
        fontWeight: "500",
        flex: 1,
    },
    formCard: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "rgba(255,255,255,0.9)",
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 52,
        gap: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#fff",
    },
    testButton: {
        borderRadius: 14,
        overflow: "hidden",
        marginTop: 8,
    },
    buttonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 10,
    },
    testButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    responseCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        maxHeight: 200,
    },
    responseSuccess: {
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.3)",
    },
    responseError: {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.3)",
    },
    responseHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    responseTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
    responseScroll: {
        maxHeight: 120,
    },
    responseText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.8)",
        fontFamily: "monospace",
    },
    hintCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(254, 202, 87, 0.1)",
        padding: 12,
        borderRadius: 12,
    },
    hintText: {
        fontSize: 13,
        color: "rgba(255,255,255,0.7)",
        flex: 1,
    },
});
