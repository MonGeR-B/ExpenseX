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
                setStats({ totalBudget: 50000, totalSpent: 18450, percentage: 36.9 });
            }
        } catch (error) {
            console.error(error);
            if (!cached) {
                setStats({ totalBudget: 50000, totalSpent: 18450, percentage: 36.9 });
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
                <MobileCard className="mx-6" style={{ marginHorizontal: 24 }}>
                    {/* Overall Budget Header */}
                    <View className="flex-row items-center gap-3 mb-6" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <View className="h-10 w-10 bg-blue-100 rounded-full items-center justify-center" style={{ height: 40, width: 40, backgroundColor: '#dbeafe', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={20} color="#2563eb" />
                        </View>
                        <Text className="text-slate-900 text-lg font-bold" style={{ color: '#0f172a', fontSize: 18, fontWeight: 'bold' }}>Overall Budget</Text>
                    </View>

                    {/* Amount & Status */}
                    <View className="mb-4">
                        <View className="flex-row items-baseline gap-1" style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                            <Text className="text-slate-900 text-3xl font-bold" style={{ color: '#0f172a', fontSize: 30, fontWeight: 'bold' }}>₹{stats.totalSpent.toLocaleString()}</Text>
                            <Text className="text-slate-400 text-lg" style={{ color: '#94a3b8', fontSize: 18 }}>/ ₹{stats.totalBudget.toLocaleString()}</Text>
                        </View>
                        <Text className="text-slate-400 text-sm mt-1" style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Total monthly spending limit</Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-4 bg-slate-100 rounded-full w-full mb-4 overflow-hidden" style={{ height: 16, backgroundColor: '#f1f5f9', borderRadius: 999, width: '100%', marginBottom: 16, overflow: 'hidden' }}>
                        <View
                            className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{
                                height: '100%',
                                backgroundColor: isOverBudget ? '#ef4444' : '#2563eb',
                                borderRadius: 999,
                                width: `${Math.min(stats.percentage, 100)}%`
                            }}
                        />
                    </View>

                    {/* Remaining Pill */}
                    <View className={`self-start px-3 py-1 rounded-full flex-row items-center gap-2 ${isOverBudget ? 'bg-red-100' : 'bg-green-100'}`} style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, backgroundColor: isOverBudget ? '#fee2e2' : '#dcfce7', borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {isOverBudget ? <AlertCircle size={14} color="#dc2626" /> : <CheckCircle size={14} color="#15803d" />}
                        <Text className={`${isOverBudget ? 'text-red-700' : 'text-green-700'} font-bold text-sm`} style={{ color: isOverBudget ? '#dc2626' : '#15803d', fontWeight: 'bold', fontSize: 14 }}>
                            {isOverBudget ? `Over by ₹${Math.abs(remaining).toLocaleString()}` : `₹${remaining.toLocaleString()} left`}
                        </Text>
                    </View>
                </MobileCard>
            </ScrollView>
        </MobileContainer>
    );
}
