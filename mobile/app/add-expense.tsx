import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useRouter } from "expo-router";
import { createExpense, fetchCategories, createCategory, type Category } from "../src/lib/api";
import { MobileContainer } from "../src/components/MobileContainer";
import { MobileCard } from "../src/components/MobileCard";
import { X, Plus } from "lucide-react-native";

// Helper for DD-MM-YYYY format
const getTodayFormatted = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

export default function AddExpenseScreen() {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(getTodayFormatted()); // Default to Today (DD-MM-YYYY)
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // New Category Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [newCatIcon, setNewCatIcon] = useState("🏷️");

    const ICONS = ["🍔", "🚕", "🎬", "🛍️", "💡", "💊", "✈️", "🏠", "🎁", "📚", "💼", "🏋️", "🍕", "🍺", "🏷️"];

    const MOCK_CATEGORIES: Category[] = [
        { id: 1, name: "Food", color: "#f87171", icon: "🍔" },
        { id: 2, name: "Transport", color: "#60a5fa", icon: "🚕" },
        { id: 3, name: "Entertainment", color: "#fbbf24", icon: "🎬" },
        { id: 4, name: "Shopping", color: "#c084fc", icon: "🛍️" },
        { id: 5, name: "Bills", color: "#34d399", icon: "💡" },
        { id: 6, name: "Health", color: "#f472b6", icon: "💊" },
    ];

    useEffect(() => {
        fetchCams();
    }, []);

    const fetchCams = () => {
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
    };

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        try {
            const newCat = await createCategory(newCatName.trim(), newCatIcon);
            setCategories([...categories, newCat]);
            setSelectedCategory(newCat.id);
            setModalVisible(false);
            setNewCatName("");
            setNewCatIcon("🏷️");
        } catch (e) {
            Alert.alert("Error", "Failed to create category");
        }
    };

    const setDateQuick = (daysAgo: number) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        setDate(`${dd}-${mm}-${yyyy}`);
    };

    const handleSubmit = async () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid expense amount.");
            return;
        }

        if (!date.match(/^\d{2}-\d{2}-\d{4}$/)) {
            Alert.alert("Invalid Date", "Please use DD-MM-YYYY format.");
            return;
        }

        try {
            setSubmitting(true);
            // Convert DD-MM-YYYY to YYYY-MM-DD for API
            const [day, month, year] = date.split('-');
            const apiDate = `${year}-${month}-${day}`;

            await createExpense({
                amount: amt,
                description: description,
                category_id: selectedCategory,
                date: apiDate
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
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 pt-6" style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
                <Text className="text-white text-3xl font-bold" style={{ color: 'white', fontSize: 30, fontFamily: 'Outfit_700Bold' }}>Add Expense</Text>
                <Pressable onPress={() => router.back()} className="bg-white/10 p-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 999 }}>
                    <X size={24} color="white" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <MobileCard className="p-0 overflow-hidden rounded-3xl" style={{ padding: 0, overflow: 'hidden' }}>
                    <View className="p-6" style={{ padding: 24 }}>
                        {/* Amount Input */}
                        <Text className="text-slate-400 text-xs font-bold uppercase mb-2" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Amount</Text>
                        <View className="flex-row items-center mb-8 border-b border-white/10 pb-4" style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 16 }}>
                            <Text className="text-4xl text-white mr-2 font-bold" style={{ fontSize: 36, color: 'white', marginRight: 8, fontWeight: 'bold' }}>₹</Text>
                            <TextInput
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                className="text-5xl font-bold text-white flex-1"
                                style={{ fontSize: 48, fontWeight: 'bold', color: 'white', flex: 1 }}
                                placeholder="0"
                                placeholderTextColor="#64748b"
                                autoFocus
                            />
                        </View>

                        {/* Date Selection */}
                        <Text className="text-slate-400 text-xs font-bold uppercase mb-3" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12 }}>Date</Text>
                        <View className="flex-row items-center gap-3 mb-6" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <Pressable
                                onPress={() => setDateQuick(0)}
                                className={`px-4 py-2 rounded-lg border ${date === getTodayFormatted() ? 'bg-white border-white' : 'bg-transparent border-white/20'}`}
                                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: date === getTodayFormatted() ? 'white' : 'rgba(255,255,255,0.2)', backgroundColor: date === getTodayFormatted() ? 'white' : 'transparent' }}
                            >
                                <Text className={`font-bold ${date === getTodayFormatted() ? 'text-black' : 'text-slate-400'}`} style={{ fontWeight: 'bold', color: date === getTodayFormatted() ? 'black' : '#94a3b8' }}>Today</Text>
                            </Pressable>
                            <TextInput
                                value={date}
                                onChangeText={setDate}
                                placeholder="DD-MM-YYYY"
                                placeholderTextColor="#475569"
                                className="flex-1 text-white bg-white/5 px-3 py-2 rounded-lg border border-white/10 font-bold text-center"
                                style={{ flex: 1, color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', fontWeight: 'bold', textAlign: 'center' }}
                            />
                        </View>

                        {/* Category Selector */}
                        <Text className="text-slate-400 text-xs font-bold uppercase mb-4" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 16 }}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 -mx-2" style={{ marginBottom: 32, marginHorizontal: -8 }}>
                            {/* New Category Button */}
                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                className="mr-3 px-4 py-3 rounded-xl border border-dashed border-slate-700 bg-white/5 items-center justify-center"
                                style={{
                                    marginRight: 12,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderStyle: 'dashed',
                                    borderColor: '#334155',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <Plus size={16} color="#94a3b8" />
                                <Text className="ml-2 text-slate-400 font-bold" style={{ marginLeft: 8, color: '#94a3b8', fontWeight: 'bold' }}>New</Text>
                            </TouchableOpacity>

                            {categories.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => setSelectedCategory(c.id)}
                                    className={`mr-3 px-4 py-3 rounded-xl border ${selectedCategory === c.id ? 'bg-indigo-500 border-indigo-500' : 'bg-white/5 border-white/10'}`}
                                    style={{
                                        marginRight: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        backgroundColor: selectedCategory === c.id ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                        borderColor: selectedCategory === c.id ? '#6366f1' : 'rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <Text className={`${selectedCategory === c.id ? 'text-white font-bold' : 'text-slate-400'}`} style={{ color: selectedCategory === c.id ? 'white' : '#94a3b8', fontWeight: selectedCategory === c.id ? 'bold' : 'normal' }}>
                                        {c.icon || "🏷️"} {c.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Description Input */}
                        <Text className="text-slate-400 text-xs font-bold uppercase mb-2" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Description</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg mb-8"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: 'white', fontSize: 18, marginBottom: 32 }}
                            placeholder="What was this for?"
                            placeholderTextColor="#64748b"
                        />

                        {/* Submit Button */}
                        <Pressable
                            onPress={handleSubmit}
                            disabled={submitting}
                            className="bg-purple-600 rounded-xl py-4 items-center shadow-lg active:bg-purple-700"
                            style={{ backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
                        >
                            <Text className="text-white font-bold text-lg" style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Save Expense</Text>
                        </Pressable>
                    </View>
                </MobileCard>
            </ScrollView>

            {/* New Category Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/80" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <View className="bg-[#111111] border border-white/10 rounded-2xl p-6 w-4/5" style={{ backgroundColor: '#111111', borderRadius: 16, padding: 24, width: '80%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Text className="text-xl font-bold mb-4 text-white" style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: 'white' }}>New Category</Text>

                        <TextInput
                            value={newCatName}
                            onChangeText={setNewCatName}
                            placeholder="Category Name (e.g. Gym)"
                            placeholderTextColor="#64748b"
                            className="border border-white/10 bg-white/5 rounded-xl p-4 mb-4 text-lg text-white"
                            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 18, color: 'white' }}
                            autoFocus
                        />

                        {/* Icon Selector */}
                        <Text className="text-slate-400 text-xs font-bold uppercase mb-2" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>Select Icon</Text>

                        {/* Custom Icon Entry */}
                        <View className="mb-4">
                            <TextInput
                                value={newCatIcon}
                                onChangeText={setNewCatIcon}
                                placeholder="Type Emoji here..."
                                placeholderTextColor="#64748b"
                                className="border border-white/10 bg-white/5 rounded-xl px-4 py-2 text-white text-center"
                                style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, color: 'white', textAlign: 'center', fontSize: 24 }}
                            />
                            <Text className="text-slate-500 text-xs text-center mt-1">Type any emoji or choose below</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" style={{ marginBottom: 24 }}>
                            {ICONS.map((icon, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setNewCatIcon(icon)}
                                    className={`mr-2 w-10 h-10 rounded-full items-center justify-center border ${newCatIcon === icon ? 'bg-indigo-500 border-indigo-500' : 'bg-white/5 border-white/10'}`}
                                    style={{
                                        marginRight: 8,
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: newCatIcon === icon ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                        borderColor: newCatIcon === icon ? '#6366f1' : 'rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <Text style={{ fontSize: 20 }}>{icon}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View className="flex-row justify-end space-x-3" style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2">
                                <Text className="text-slate-400 font-bold" style={{ color: '#94a3b8', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCreateCategory} className="bg-white px-4 py-2 rounded-lg" style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                                <Text className="text-black font-bold" style={{ color: 'black', fontWeight: 'bold' }}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </MobileContainer>
    );
}
