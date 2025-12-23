import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable, Modal, TextInput, Alert } from "react-native";
import { MobileContainer } from "../../src/components/MobileContainer";
import { MobileCard } from "../../src/components/MobileCard";
import { Globe, CheckCircle, AlertCircle, Plus, Trash2 } from "lucide-react-native";
import { fetchBudgets, fetchCategories, createBudget, deleteBudget, Category } from "../../src/lib/api";
import { cache, CACHE_KEYS } from "../../src/lib/cache";
import { useFocusEffect } from "expo-router";

interface Budget {
    id: number;
    category_id: number | null;
    category?: Category | null;
    amount: number;
    month: string;
    spent: number;
}

export default function BudgetsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newBudget, setNewBudget] = useState({ amount: "", categoryId: "all" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = useCallback(async () => {
        // Load cached data first
        const cachedBudgets = await cache.load<Budget[]>(CACHE_KEYS.BUDGETS);
        if (cachedBudgets && cachedBudgets.length > 0) {
            setBudgets(cachedBudgets);
        }

        try {
            const [budgetsData, categoriesData] = await Promise.all([
                fetchBudgets(),
                fetchCategories()
            ]);

            if (Array.isArray(budgetsData)) {
                setBudgets(budgetsData);
                await cache.save(CACHE_KEYS.BUDGETS, budgetsData);
            }

            if (Array.isArray(categoriesData)) {
                setCategories(categoriesData);
            }
        } catch (error) {
            console.error(error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleCreate = async () => {
        const amt = parseFloat(newBudget.amount);
        if (isNaN(amt) || amt <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        setIsSubmitting(true);
        try {
            const today = new Date();
            const monthStr = today.toISOString().split('T')[0];

            await createBudget({
                amount: amt,
                month: monthStr,
                category_id: newBudget.categoryId === "all" ? null : parseInt(newBudget.categoryId)
            });

            setModalVisible(false);
            setNewBudget({ amount: "", categoryId: "all" });
            loadData();
        } catch (error) {
            Alert.alert("Error", "Failed to create budget");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        Alert.alert(
            "Delete Budget",
            `Remove budget for "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteBudget(id);
                            loadData();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete budget");
                        }
                    }
                }
            ]
        );
    };

    // Calculate overall stats
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const remaining = totalBudget - totalSpent;
    const isOverBudget = remaining < 0;

    return (
        <MobileContainer>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
            >
                {/* Header */}
                <View className="px-6 py-6 flex-row justify-between items-center" style={{ paddingHorizontal: 24, paddingVertical: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text className="text-white text-3xl font-bold" style={{ color: 'white', fontSize: 30, fontFamily: 'Outfit_700Bold' }}>Budgets</Text>
                        <Text className="text-slate-400 text-sm mt-1" style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Set limits to stay on track</Text>
                    </View>
                    <Pressable
                        onPress={() => setModalVisible(true)}
                        className="bg-slate-900 px-4 py-3 rounded-2xl flex-row items-center"
                        style={{ backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
                    >
                        <Plus size={18} color="white" />
                        <Text className="text-white font-bold ml-2" style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 14 }}>Create</Text>
                    </Pressable>
                </View>

                <View className="px-6" style={{ paddingHorizontal: 24 }}>
                    {/* Overall Budget Summary */}
                    <MobileCard className="mb-6 rounded-3xl" style={{ marginBottom: 24 }}>
                        <View className="flex-row items-center gap-3 mb-6" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <View className="h-10 w-10 bg-white/10 rounded-full items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <Globe size={20} color="white" />
                            </View>
                            <Text className="text-white text-lg font-bold" style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Overall Budget</Text>
                        </View>

                        {/* Amount & Status */}
                        <View className="mb-4">
                            <View className="flex-row items-baseline gap-1" style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                                <Text className="text-white text-3xl font-bold" style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>₹{totalSpent.toLocaleString()}</Text>
                                <Text className="text-slate-400 text-lg" style={{ color: '#94a3b8', fontSize: 18 }}>/ ₹{totalBudget.toLocaleString()}</Text>
                            </View>
                            <Text className="text-slate-400 text-sm mt-1" style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Total monthly spending limit</Text>
                        </View>

                        {/* Progress Bar */}
                        <View className="h-4 bg-white/10 rounded-full w-full mb-4 overflow-hidden" style={{ height: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, width: '100%', marginBottom: 16, overflow: 'hidden' }}>
                            <View
                                className={`h-full rounded-full`}
                                style={{
                                    height: '100%',
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: isOverBudget ? '#ef4444' : '#2563eb',
                                    borderRadius: 999
                                }}
                            />
                        </View>
                        <View className="flex-row items-center gap-2" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {isOverBudget ? (
                                <View className="flex-row items-center gap-2" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <AlertCircle size={16} color="#ef4444" />
                                    <Text className="text-red-400 text-sm font-bold" style={{ color: '#f87171', fontSize: 14, fontWeight: 'bold' }}>Over Budget</Text>
                                </View>
                            ) : (
                                <View className="flex-row items-center gap-2" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <CheckCircle size={16} color="#4ade80" />
                                    <Text className="text-green-400 text-sm font-bold" style={{ color: '#4ade80', fontSize: 14, fontWeight: 'bold' }}>On Track</Text>
                                </View>
                            )}
                        </View>
                    </MobileCard>

                    {/* Individual Budgets List */}
                    <Text className="text-white font-bold mb-4 text-lg" style={{ color: 'white', fontWeight: 'bold', marginBottom: 16, fontSize: 18 }}>Budget Details</Text>

                    {budgets.length === 0 ? (
                        <MobileCard className="p-8 items-center" style={{ padding: 32, alignItems: 'center' }}>
                            <Text className="text-6xl mb-4">💸</Text>
                            <Text className="text-white text-lg font-bold mb-2" style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>No Budgets Set</Text>
                            <Text className="text-slate-400 text-center text-sm" style={{ color: '#94a3b8', textAlign: 'center', fontSize: 14 }}>Create budgets to track your spending limits</Text>
                        </MobileCard>
                    ) : (
                        <View className="gap-4" style={{ gap: 16 }}>
                            {budgets.map((budget) => {
                                const budgetPercentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                                const isOver = budget.spent > budget.amount;
                                const categoryName = budget.category ? budget.category.name : "Overall";
                                const categoryIcon = budget.category ? budget.category.icon : "🌎";

                                return (
                                    <MobileCard key={budget.id} className="p-5 rounded-3xl" style={{ padding: 20, borderRadius: 24 }}>
                                        <View className="flex-row justify-between items-start mb-4" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                            <View className="flex-row items-center gap-3" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                <View className="h-12 w-12 bg-blue-500 rounded-2xl items-center justify-center" style={{ height: 48, width: 48, backgroundColor: '#3b82f6', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
                                                    <Text className="text-2xl">{categoryIcon}</Text>
                                                </View>
                                                <View>
                                                    <Text className="text-white font-bold text-base" style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{categoryName}</Text>
                                                    <Text className="text-slate-400 text-xs" style={{ color: '#94a3b8', fontSize: 12 }}>₹{budget.spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}</Text>
                                                </View>
                                            </View>
                                            <Pressable
                                                onPress={() => handleDelete(budget.id, categoryName)}
                                                className="bg-white/5 p-2 rounded-xl"
                                                style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 12 }}
                                            >
                                                <Trash2 size={18} color="#f87171" />
                                            </Pressable>
                                        </View>

                                        {/* Progress Bar */}
                                        <View className="h-3 bg-white/10 rounded-full w-full overflow-hidden" style={{ height: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, width: '100%', overflow: 'hidden' }}>
                                            <View
                                                className="h-full rounded-full"
                                                style={{
                                                    height: '100%',
                                                    width: `${Math.min(budgetPercentage, 100)}%`,
                                                    backgroundColor: isOver ? '#ef4444' : '#10b981',
                                                    borderRadius: 999
                                                }}
                                            />
                                        </View>
                                        <Text className="text-slate-400 text-xs mt-2 text-right" style={{ color: '#94a3b8', fontSize: 11, marginTop: 8, textAlign: 'right' }}>{budgetPercentage.toFixed(0)}% used</Text>
                                    </MobileCard>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Create Budget Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-start pt-12" style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 48 }}>
                    <View className="bg-zinc-900 rounded-b-[2rem] p-6" style={{ backgroundColor: '#18181b', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, padding: 24 }}>
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-6" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Text className="text-white text-2xl font-bold" style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Set Budget</Text>
                            <Pressable onPress={() => setModalVisible(false)} className="p-2" style={{ padding: 8 }}>
                                <Text className="text-slate-400 text-lg" style={{ color: '#94a3b8', fontSize: 18 }}>✕</Text>
                            </Pressable>
                        </View>

                        {/* Category Selection */}
                        <View className="mb-4" style={{ marginBottom: 16 }}>
                            <Text className="text-slate-400 text-sm font-bold mb-2 uppercase " style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2" style={{ gap: 8 }}>
                                <Pressable
                                    onPress={() => setNewBudget({ ...newBudget, categoryId: "all" })}
                                    className={`px-4 py-3 rounded-xl ${newBudget.categoryId === "all" ? "bg-blue-500" : "bg-white/10"}`}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderRadius: 12,
                                        backgroundColor: newBudget.categoryId === "all" ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                        marginRight: 8
                                    }}
                                >
                                    <Text className="text-white font-bold" style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>🌎 Overall</Text>
                                </Pressable>
                                {categories.map((cat) => (
                                    <Pressable
                                        key={cat.id}
                                        onPress={() => setNewBudget({ ...newBudget, categoryId: cat.id.toString() })}
                                        className={`px-4 py-3 rounded-xl ${newBudget.categoryId === cat.id.toString() ? "bg-blue-500" : "bg-white/10"}`}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 12,
                                            borderRadius: 12,
                                            backgroundColor: newBudget.categoryId === cat.id.toString() ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                            marginRight: 8
                                        }}
                                    >
                                        <Text className="text-white font-bold" style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{cat.icon} {cat.name}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Amount Input */}
                        <View className="mb-6" style={{ marginBottom: 24 }}>
                            <Text className="text-slate-400 text-sm font-bold mb-2 uppercase" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Limit Amount (₹)</Text>
                            <TextInput
                                value={newBudget.amount}
                                onChangeText={(text) => setNewBudget({ ...newBudget, amount: text })}
                                className="bg-white/10 text-white p-4 rounded-xl text-base"
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                                placeholder="5000"
                                placeholderTextColor="#64748b"
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Create Button */}
                        <Pressable
                            onPress={handleCreate}
                            disabled={isSubmitting}
                            className="bg-emerald-500 p-4 rounded-2xl items-center"
                            style={{
                                backgroundColor: isSubmitting ? '#6b7280' : '#10b981',
                                padding: 16,
                                borderRadius: 16,
                                alignItems: 'center',
                                shadowColor: '#10b981',
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 4 }
                            }}
                        >
                            <Text className="text-white font-bold text-base" style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                                {isSubmitting ? "Saving..." : "Save Budget"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </MobileContainer>
    );
}
