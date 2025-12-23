import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, Image as RNImage } from "react-native";
import * as ReactNative from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { loginApi } from "../src/lib/api";
import { PinnedCard } from "../src/components/PinnedCard";

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async () => {
        setErrorMsg("");
        if (!email || !password) {
            setErrorMsg("Email and password are required.");
            return;
        }
        try {
            setSubmitting(true);

            // Create a timeout promise (Extended to 15s for slow networks)
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Request timed out (15s). Check IP/Firewall.")), 15000);
            });

            // Race the login against the timeout
            const res: any = await Promise.race([
                loginApi(email, password),
                timeout
            ]);

            await login(res.access_token);
            router.replace("/(tabs)/overview");
        } catch (err: any) {
            console.error("Login Error:", err);
            setErrorMsg(err.message || "Login Failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black" style={{ backgroundColor: 'black' }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
                <View className="items-center mb-8">
                    <ReactNative.Image
                        source={require('../assets/brand/ExpenseX_logo.png')}
                        style={{ width: 80, height: 80, marginBottom: 16, resizeMode: 'contain' }}
                    />
                    <Text className="text-4xl font-extrabold text-white text-center" style={{ fontFamily: 'Outfit_900Black', fontSize: 36, color: 'white' }}>ExpenseX</Text>
                    <Text className="text-slate-400 font-medium tracking-wide" style={{ color: '#94a3b8' }}>Financial Freedom OS</Text>
                </View>

                {/* Added inline style fallbacks for visibility */}
                <PinnedCard theme="indigo" showPin={false} className="bg-black border-zinc-900" style={{ backgroundColor: '#000000', borderColor: '#27272a' }}>
                    <View style={{ backgroundColor: '#000000', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#27272a' }}>
                        <Text className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit_700Bold', fontSize: 24, color: 'white' }}>Welcome Back</Text>
                        <Text className="text-slate-400 mb-6 text-sm" style={{ color: '#94a3b8', marginBottom: 24 }}>Sign in to your account</Text>

                        {errorMsg ? (
                            <Text className="text-red-500 font-bold mb-4" style={{ color: '#ef4444', marginBottom: 16 }}>
                                Error: {errorMsg}
                            </Text>
                        ) : null}

                        <View className="space-y-4">
                            <View style={{ marginBottom: 16 }}>
                                <Text className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider" style={{ color: '#cbd5e1', marginBottom: 8, fontSize: 12, textTransform: 'uppercase' }}>Email Address</Text>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white"
                                    style={{ backgroundColor: '#020617', borderColor: '#1e293b', borderWidth: 1, borderRadius: 12, padding: 12, color: 'white', fontSize: 16 }}
                                    placeholder="you@expensex.com"
                                    placeholderTextColor="#64748b"
                                />
                            </View>

                            <View style={{ marginBottom: 24 }}>
                                <Text className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider" style={{ color: '#cbd5e1', marginBottom: 8, fontSize: 12, textTransform: 'uppercase' }}>Password</Text>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white"
                                    style={{ backgroundColor: '#020617', borderColor: '#1e293b', borderWidth: 1, borderRadius: 12, padding: 12, color: 'white', fontSize: 16 }}
                                    placeholder="••••••••"
                                    placeholderTextColor="#64748b"
                                />
                            </View>

                            <Pressable
                                onPress={handleSubmit}
                                disabled={submitting}
                                className="bg-indigo-500 rounded-xl py-4 items-center"
                                style={{ backgroundColor: '#6366f1', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
                            >
                                <Text className="text-white font-bold text-base" style={{ fontFamily: 'Outfit_700Bold', color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                                    {submitting ? "Authenticating..." : "Sign In →"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </PinnedCard>

                <View className="mt-8 flex-row justify-center">
                    <Text className="text-slate-500 font-medium" style={{ color: '#64748b' }}>New to ExpenseX? </Text>
                    <Link href="/register" asChild>
                        <Pressable>
                            <Text className="text-indigo-400 font-bold" style={{ color: '#818cf8', fontWeight: 'bold' }}>Create Account</Text>
                        </Pressable>
                    </Link>
                </View>


                {/* DEBUG SECTION - REMOVE IN PRODUCTION */}
                <View className="mt-8 p-4 bg-slate-900 rounded-xl border border-dashed border-slate-700">
                    <Text className="text-slate-500 text-xs font-bold mb-2">🔧 DIAGNOSTICS</Text>
                    <Text className="text-slate-400 text-xs">API URL:</Text>
                    <Text className="text-emerald-400 text-xs font-mono mb-2">{process.env.EXPO_PUBLIC_API_URL || 'Using Fallback'}</Text>

                    <Text className="text-slate-400 text-xs">Fallback (in code):</Text>
                    <Text className="text-indigo-400 text-xs font-mono">http://192.168.1.4:8000/api</Text>

                    <Text className="text-slate-600 text-[10px] mt-2 italic">
                        If looking at "Using Fallback", ensure .env is created and server restarted with -c
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView >
    );
}
