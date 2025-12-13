import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Dimensions } from "react-native";
import { useFocusEffect } from "expo-router";
import { fetchBudgets, type Budget } from "../src/lib/api";
import { PinnedCard } from "../src/components/PinnedCard";


// Simple Progress Bar Component
const ProgressBar = ({ progress, color }: { progress: number; color: string }) => (
    <View className="h-3 bg-slate-800 rounded-full overflow-hidden mt-2">
        <View
            className="h-full rounded-full"
            style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color }}
        />
    </View>
);

export default function BudgetsScreen() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const data = await fetchBudgets();
            setBudgets(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        load();
    };

    return (
        <ScrollView
            className="flex-1 bg-black px-5 pt-4"
            style={{ flex: 1, backgroundColor: '#000000', paddingHorizontal: 20, paddingTop: 16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
            <View className="mb-6" style={{ marginBottom: 24 }}>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>Monthly Targets</Text>
                <Text className="text-3xl font-bold text-white" style={{ fontFamily: 'Outfit_700Bold', fontSize: 30, color: 'white', fontWeight: 'bold' }}>Your Budgets</Text>
            </View>

            {loading ? (
                <Text className="text-slate-500 text-center mt-10" style={{ color: '#64748b', textAlign: 'center', marginTop: 40 }}>Loading budgets...</Text>
            ) : budgets.length === 0 ? (
                <View className="items-center py-10 bg-slate-900/50 rounded-3xl border border-slate-800" style={{ alignItems: 'center', paddingVertical: 40, backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 24, borderWidth: 1, borderColor: '#1e293b' }}>
                    <Text className="text-slate-400 text-center mb-2" style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 8 }}>No budgets set yet.</Text>
                    <Text className="text-slate-600 text-xs text-center px-10" style={{ color: '#475569', fontSize: 12, textAlign: 'center', paddingHorizontal: 40 }}>Head to the web app to create your first spending limit.</Text>
                </View>
            ) : (
                <View className="pb-10" style={{ paddingBottom: 40 }}>
                    {budgets.map((budget, index) => {
                        const isOver = budget.spent > budget.amount;
                        const percent = budget.percentage;
                        const theme = isOver ? "pink" : percent > 80 ? "amber" : "blue";

                        return (
                            <View key={budget.id} className="mb-4">
                                <PinnedCard theme={theme} showPin={false} className="border-2">
                                    <View className="flex-row justify-between items-center mb-4">
                                        <View className="flex-row items-center gap-3">
                                            <View className={`h-12 w-12 rounded-2xl items-center justify-center ${theme === 'pink' ? 'bg-pink-500' : theme === 'amber' ? 'bg-amber-500' : 'bg-blue-500'} shadow-lg opacity-90`}>
                                                <Text className="text-xl">{budget.category?.icon || '📦'}</Text>
                                            </View>
                                            <View>
                                                <Text className="text-slate-900 font-bold text-lg" style={{ fontFamily: 'Outfit_700Bold', color: '#0f172a' }}>{budget.category?.name || 'Overall'}</Text>
                                                <Text className="text-slate-500 text-xs font-bold uppercase" style={{ color: '#64748b' }}>{new Date(budget.month).toLocaleString('default', { month: 'long' })} Budget</Text>
                                            </View>
                                        </View>
                                        <Text className={`font-black text-lg ${isOver ? 'text-rose-600' : 'text-slate-400'}`} style={{ fontFamily: 'Outfit_700Bold' }}>
                                            {Math.round(percent)}%
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between items-baseline mb-2">
                                        <Text className={`text-3xl font-black ${isOver ? 'text-rose-600' : 'text-slate-900'}`} style={{ fontFamily: 'Outfit_900Black' }}>
                                            ₹{budget.spent.toLocaleString()}
                                        </Text>
                                        <Text className="text-slate-400 text-sm font-bold" style={{ color: '#94a3b8' }}>
                                            / ₹{budget.amount.toLocaleString()}
                                        </Text>
                                    </View>

                                    {/* Progress Bar */}
                                    <View className="h-3 bg-white rounded-full overflow-hidden shadow-sm border border-slate-100">
                                        <View
                                            className={`h-full rounded-full ${isOver ? 'bg-rose-500' : theme === 'amber' ? 'bg-amber-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                    </View>

                                    <View className="mt-2 flex-row items-center gap-1">
                                        <Text className={`text-xs font-bold ${isOver ? 'text-rose-600' : 'text-slate-500'}`}>
                                            {isOver ? `⚠️ Over by ₹${(budget.spent - budget.amount).toLocaleString()}` : `✅ ₹${(budget.amount - budget.spent).toLocaleString()} left`}
                                        </Text>
                                    </View>
                                </PinnedCard>
                            </View>
                        );
                    })}
                </View>
            )}
        </ScrollView>
    );
}
