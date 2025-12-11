import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { registerApi, loginApi } from "../src/lib/api";
import { useAuth } from "../src/context/AuthContext";

export default function RegisterScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Email and password are required.");
            return;
        }
        try {
            setSubmitting(true);
            await registerApi(email, password);
            // auto-login after register
            const res = await loginApi(email, password);
            await login(res.access_token);
            router.replace("/dashboard");
        } catch (err: any) {
            console.error(err);
            Alert.alert("Registration failed", "Email might already be in use.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-950 px-5 justify-center">
            <Text className="text-3xl font-semibold text-slate-50 mb-2">
                Create account
            </Text>
            <Text className="text-slate-400 mb-8 text-sm">
                Start tracking how your money actually disappears.
            </Text>

            <Text className="text-xs text-slate-300 mb-1">Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-50 mb-4"
                placeholder="you@example.com"
                placeholderTextColor="#4b5563"
            />

            <Text className="text-xs text-slate-300 mb-1">Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-50 mb-4"
                placeholder="********"
                placeholderTextColor="#4b5563"
            />

            <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                className="bg-emerald-500 rounded-full py-3 items-center mb-4"
            >
                <Text className="text-slate-950 font-semibold text-sm">
                    {submitting ? "Creating..." : "Create account"}
                </Text>
            </Pressable>

            <Text className="text-xs text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-400">
                    Login
                </Link>
            </Text>
        </View>
    );
}
