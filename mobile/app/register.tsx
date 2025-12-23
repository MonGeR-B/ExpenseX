import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { registerApi, loginApi } from "../src/lib/api";
import { useAuth } from "../src/context/AuthContext";
import { PinnedCard } from "../src/components/PinnedCard";

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
            router.replace("/(tabs)/overview");
        } catch (err: any) {
            console.error(err);
            Alert.alert("Registration failed", "Email might already be in use.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black" style={{ backgroundColor: 'black' }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
                <View className="items-center mb-8">
                    <View className="h-16 w-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg" style={{ backgroundColor: '#10b981', width: 64, height: 64, borderRadius: 16 }} />
                    <Text className="text-4xl font-extrabold text-white text-center" style={{ fontFamily: 'Outfit_900Black', fontSize: 36, color: 'white' }}>Join ExpenseX</Text>
                    <Text className="text-slate-400 font-medium tracking-wide" style={{ color: '#94a3b8' }}>Start your journey</Text>
                </View>

                <PinnedCard theme="indigo" showPin={false} className="bg-black border-zinc-900" style={{ backgroundColor: '#000000', borderColor: '#27272a' }}>
                    <View style={{ backgroundColor: '#000000', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#27272a' }}>
                        <Text className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit_700Bold', fontSize: 24, color: 'white' }}>Create Account</Text>
                        <Text className="text-slate-400 mb-6 text-sm" style={{ color: '#94a3b8', marginBottom: 24 }}>Enter your details below</Text>

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
                                className="bg-emerald-500 rounded-xl py-4 items-center"
                                style={{ backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
                            >
                                <Text className="text-white font-bold text-base" style={{ fontFamily: 'Outfit_700Bold', color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                                    {submitting ? "Creating Account..." : "Sign Up →"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </PinnedCard>

                <View className="mt-8 flex-row justify-center">
                    <Text className="text-slate-500 font-medium" style={{ color: '#64748b' }}>Already have an account? </Text>
                    <Link href="/login" asChild>
                        <Pressable>
                            <Text className="text-emerald-400 font-bold" style={{ color: '#34d399', fontWeight: 'bold' }}>Sign In</Text>
                        </Pressable>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
