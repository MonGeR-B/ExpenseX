import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { MobileContainer } from "../../src/components/MobileContainer";
import { MobileCard } from "../../src/components/MobileCard";
import { Globe, CheckCircle, AlertCircle } from "lucide-react-native";
import { fetchBudgets, Budget } from "../../src/lib/api";
import { cache, CACHE_KEYS } from "../../src/lib/cache";
import { useFocusEffect } from "expo-router";

export default function BudgetsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ totalBudget: 0, totalSpent: 0, percentage: 0 });

    const loadData = useCallback(async () => {
        // 1. Load Cache
        const cached = await cache.load<Budget[]>(CACHE_KEYS.BUDGETS);
        if (cached && cached.length > 0) {
            calculateAndSetStats(cached);
        }

        try {
            const data = await fetchBudgets();
            if (Array.isArray(data) && data.length > 0) {
                calculateAndSetStats(data);
                await cache.save(CACHE_KEYS.BUDGETS, data);
            } else if (!cached) {
                setStats({ totalBudget: 0, totalSpent: 0, percentage: 0 });
            }
        } catch (error) {
            console.error(error);
            if (!cached) {
                setStats({ totalBudget: 0, totalSpent: 0, percentage: 0 });
            }
        }
    }, []);

    const calculateAndSetStats = (data: Budget[]) => {
        let totalBudget = 0;
        let totalSpent = 0;

        data.forEach(b => {
            totalBudget += b.amount;
            totalSpent += b.spent;
        });

        const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        setStats({ totalBudget, totalSpent, percentage });
    };

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

    const remaining = stats.totalBudget - stats.totalSpent;
    const isOverBudget = remaining < 0;

    return (
        <MobileContainer>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
            >
                {/* Header */}
                <View className="px-6 py-6" style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
                    <Text className="text-white text-3xl font-bold" style={{ color: 'white', fontSize: 30, fontFamily: 'Outfit_700Bold' }}>Budgets</Text>
                </View>

                {/* Main White Island */}
                <MobileCard className="mx-6 rounded-3xl" style={{ marginHorizontal: 24 }}>
                    {/* Overall Budget Header */}
                    <View className="flex-row items-center gap-3 mb-6" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <View className="h-10 w-10 bg-white/10 rounded-full items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={20} color="white" />
                        </View>
                        <Text className="text-white text-lg font-bold" style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Overall Budget</Text>
                    </View>

                    {/* Amount & Status */}
                    <View className="mb-4">
                        <View className="flex-row items-baseline gap-1" style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                            <Text className="text-white text-3xl font-bold" style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>₹{stats.totalSpent.toLocaleString()}</Text>
                            <Text className="text-slate-400 text-lg" style={{ color: '#94a3b8', fontSize: 18 }}>/ ₹{stats.totalBudget.toLocaleString()}</Text>
                        </View>
                        <Text className="text-slate-400 text-sm mt-1" style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Total monthly spending limit</Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-4 bg-white/10 rounded-full w-full mb-4 overflow-hidden" style={{ height: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, width: '100%', marginBottom: 16, overflow: 'hidden' }}>
                        <View
                            className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{
                                height: '100%',
                                width: `${Math.min(stats.percentage, 100)}%`,
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
            </ScrollView>
        </MobileContainer>
    );
}
