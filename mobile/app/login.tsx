import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { loginApi } from "../src/lib/api";

export default function LoginScreen() {
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
            const res = await loginApi(email, password);
            await login(res.access_token);
            router.replace("/dashboard");
        } catch (err: any) {
            console.error(err);
            Alert.alert("Login failed", "Check your credentials.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-950 px-5 justify-center" style={{ flex: 1, backgroundColor: '#020617', paddingHorizontal: 20, justifyContent: 'center' }}>
            <Text className="text-3xl font-semibold text-slate-50 mb-2" style={{ fontSize: 30, fontWeight: '600', color: '#f8fafc', marginBottom: 8 }}>
                Welcome back
            </Text>
            <Text className="text-slate-400 mb-8 text-sm" style={{ color: '#94a3b8', marginBottom: 32, fontSize: 14 }}>
                Sign in to track and control your daily spending.
            </Text>

            <Text className="text-xs text-slate-300 mb-1" style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-50 mb-4"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, color: '#f8fafc', marginBottom: 16 }}
                placeholder="you@example.com"
                placeholderTextColor="#4b5563"
            />

            <Text className="text-xs text-slate-300 mb-1" style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-50 mb-4"
                style={{ backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, color: '#f8fafc', marginBottom: 16 }}
                placeholder="********"
                placeholderTextColor="#4b5563"
            />

            <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                className="bg-emerald-500 rounded-full py-3 items-center mb-4"
                style={{ backgroundColor: '#10b981', borderRadius: 9999, paddingVertical: 12, alignItems: 'center', marginBottom: 16 }}
            >
                <Text className="text-slate-950 font-semibold text-sm" style={{ color: '#020617', fontWeight: '600', fontSize: 14 }}>
                    {submitting ? "Signing in..." : "Sign in"}
                </Text>
            </Pressable>

            <Text className="text-xs text-slate-400" style={{ fontSize: 12, color: '#94a3b8' }}>
                Don't have an account?{" "}
                <Link href="/register" className="text-emerald-400" style={{ color: '#34d399' }}>
                    Register
                </Link>
            </Text>
        </View>
    );
}
