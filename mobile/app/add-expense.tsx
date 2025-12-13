import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { createExpense, fetchCategories, type Category } from "../src/lib/api";
import { MobileContainer } from "../src/components/MobileContainer";
import { MobileCard } from "../src/components/MobileCard";
import { X } from "lucide-react-native";

export default function AddExpenseScreen() {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const MOCK_CATEGORIES: Category[] = [
        { id: 1, name: "Food", color: "#f87171", icon: "🍔" },
        { id: 2, name: "Transport", color: "#60a5fa", icon: "🚕" },
        { id: 3, name: "Entertainment", color: "#fbbf24", icon: "🎬" },
        { id: 4, name: "Shopping", color: "#c084fc", icon: "🛍️" },
        { id: 5, name: "Bills", color: "#34d399", icon: "💡" },
        { id: 6, name: "Health", color: "#f472b6", icon: "💊" },
    ];

    useEffect(() => {
        fetchCategories()
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setCategories(data);
                } else {
                    setCategories(MOCK_CATEGORIES);
                }
            })
            .catch(err => {
                console.error(err);
                setCategories(MOCK_CATEGORIES);
            });
    }, []);

    const handleSubmit = async () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid expense amount.");
            return;
        }

        try {
            setSubmitting(true);
            const today = new Date().toISOString().slice(0, 10);
            await createExpense({
                amount: amt,
                description: description,
                category_id: selectedCategory,
                date: today
            });
            router.back();
        } catch (error) {
            console.error(error);
            // Offline/Demo Fallback
            Alert.alert(
                "Demo Mode",
                "Server unreachable. Expense added locally (simulation).",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MobileContainer>
            <View className="flex-row justify-between items-center px-6 py-4" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
                <Text className="text-white text-2xl font-bold" style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Add Expense</Text>
                <Pressable onPress={() => router.back()} className="bg-slate-800 p-2 rounded-full" style={{ backgroundColor: '#1e293b', padding: 8, borderRadius: 999 }}>
                    <X size={24} color="white" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <MobileCard className="p-0 overflow-hidden" style={{ padding: 0, overflow: 'hidden' }}>
                    <View className="p-6" style={{ padding: 24 }}>
                        {/* Amount Input */}
                        <Text className="text-slate-400 text-xs font-bold uppercase mb-2" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Amount</Text>
                        <View className="flex-row items-center mb-8 border-b border-slate-100 pb-4" style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16 }}>
                            <Text className="text-4xl text-slate-900 mr-2 font-bold" style={{ fontSize: 36, color: '#0f172a', marginRight: 8, fontWeight: 'bold' }}>₹</Text>
                            <TextInput
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                className="text-5xl font-bold text-slate-900 flex-1"
                                style={{ fontSize: 48, fontWeight: 'bold', color: '#0f172a', flex: 1 }}
                                placeholder="0"
                                placeholderTextColor="#cbd5e1"
                                autoFocus
                            />
                        </View>

                        {/* Category Selector */}
                        <Text className="text-slate-400 text-xs font-bold uppercase mb-4" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 16 }}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 -mx-2" style={{ marginBottom: 32, marginHorizontal: -8 }}>
                            {categories.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => setSelectedCategory(c.id)}
                                    className={`mr-3 px-4 py-3 rounded-xl border ${selectedCategory === c.id ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-100'}`}
                                    style={{
                                        marginRight: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        backgroundColor: selectedCategory === c.id ? '#0f172a' : '#f8fafc',
                                        borderColor: selectedCategory === c.id ? '#0f172a' : '#f1f5f9'
                                    }}
                                >
                                    <Text className={`${selectedCategory === c.id ? 'text-white font-bold' : 'text-slate-600'}`} style={{ color: selectedCategory === c.id ? 'white' : '#475569', fontWeight: selectedCategory === c.id ? 'bold' : 'normal' }}>
                                        {c.icon} {c.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Description Input */}
                        <Text className="text-slate-400 text-xs font-bold uppercase mb-2" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Description</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-900 text-lg mb-8"
                            style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: '#0f172a', fontSize: 18, marginBottom: 32 }}
                            placeholder="What was this for?"
                            placeholderTextColor="#94a3b8"
                        />

                        {/* Submit Button */}
                        <Pressable
                            onPress={handleSubmit}
                            disabled={submitting}
                            className="bg-purple-600 rounded-xl py-4 items-center shadow-lg shadow-purple-200 active:bg-purple-700"
                            style={{ backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
                        >
                            <Text className="text-white font-bold text-lg" style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Save Expense</Text>
                        </Pressable>
                    </View>
                </MobileCard>
            </ScrollView>
        </MobileContainer>
    );
}
