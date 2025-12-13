import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { useFonts, Outfit_400Regular, Outfit_700Bold, Outfit_900Black } from "@expo-google-fonts/outfit";
import "../global.css";

function RootNavigator() {
    const { loading: authLoading } = useAuth();
    const [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_700Bold,
        Outfit_900Black,
    });

    if (authLoading || !fontsLoaded) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#ffffff" },
            }}
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ title: "Welcome Back" }} />
            <Stack.Screen name="register" options={{ title: "Create Account" }} />
            <Stack.Screen name="add-expense" options={{ presentation: 'modal', title: "Add Expense" }} />
        </Stack>
    );
}

export default function Layout() {
    return (
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}
