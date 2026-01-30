import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "../components/ToastProvider";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
