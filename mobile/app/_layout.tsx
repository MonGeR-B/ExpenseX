import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { ActivityIndicator, View } from "react-native";

function RootNavigator() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-950">
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: "#020617" },
                headerTintColor: "#e5e7eb",
                contentStyle: { backgroundColor: "#020617" },
            }}
        >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ title: "Login" }} />
            <Stack.Screen name="register" options={{ title: "Register" }} />
            <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
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
