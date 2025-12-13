import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { MobileContainer } from "../../src/components/MobileContainer";
import { MobileCard } from "../../src/components/MobileCard";
import { fetchCategoryStats, fetchDailyStats, fetchMonthlyStats } from "../../src/lib/api";
import { useFocusEffect } from "expo-router";

export default function AnalysisScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
    const [chartData, setChartData] = useState<number[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [totalSpent, setTotalSpent] = useState(0);

    const loadData = useCallback(async () => {
        try {
            // Load Chart Data
            let points: number[] = [];
            const MOCK_POINTS = [40, 25, 60, 30, 80, 50, 70];

            try {
                if (viewMode === 'daily') {
                    const daily = await fetchDailyStats();
                    points = daily.points.slice(-7).map((p: any) => p.total_amount);
                } else {
                    const monthly = await fetchMonthlyStats();
                    points = monthly.points.map((p: any) => p.total_amount);
                }
            } catch (e) { console.error("Chart fetch failed", e); }

            if (points.length === 0) points = MOCK_POINTS;
            setChartData(points);

            // Load Categories
            let catsList = [];
            try {
                const cats = await fetchCategoryStats();
                catsList = cats.categories || [];
            } catch (e) { console.error("Cat fetch failed", e); }

            if (catsList.length > 0) {
                setCategoryData(catsList);
                const total = catsList.reduce((acc: number, curr: any) => acc + curr.total_amount, 0);
                setTotalSpent(total);
            } else {
                // Mock Categories
                const MOCK_CATS = [
                    { category_name: 'Food', total_amount: 1630 },
                    { category_name: 'Alcohol', total_amount: 3000 },
                    { category_name: 'Rent', total_amount: 4000 }
                ];
                setCategoryData(MOCK_CATS);
                setTotalSpent(8630);
            }

        } catch (error) {
            console.error(error);
        }
    }, [viewMode]);

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

    // Colors for categories
    const COLORS = ["#60a5fa", "#f472b6", "#a78bfa", "#34d399", "#fbbf24", "#f87171"];

    return (
        <MobileContainer>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
            >
                {/* Header */}
                <View className="px-6 py-6" style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
                    <Text className="text-white text-3xl font-bold" style={{ color: 'white', fontSize: 30, fontFamily: 'Outfit_700Bold' }}>Reports</Text>
                </View>

                {/* Main White Island */}
                <MobileCard className="mx-6 min-h-[600px]" style={{ marginHorizontal: 24, minHeight: 600 }}>

                    {/* Spending Trends Chart */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-6" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Text className="text-slate-900 font-bold text-lg" style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 18 }}>Analytics</Text>
                            <View className="flex-row bg-slate-100 rounded-lg p-1" style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 4 }}>
                                <Pressable
                                    onPress={() => setViewMode('daily')}
                                    className={`px-3 py-1 rounded-md ${viewMode === 'daily' ? 'bg-white shadow-sm' : ''}`}
                                    style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, backgroundColor: viewMode === 'daily' ? 'white' : 'transparent' }}
                                >
                                    <Text className={`text-xs font-bold ${viewMode === 'daily' ? 'text-slate-900' : 'text-slate-400'}`} style={{ fontSize: 12, fontWeight: 'bold', color: viewMode === 'daily' ? '#0f172a' : '#94a3b8' }}>Daily</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setViewMode('monthly')}
                                    className={`px-3 py-1 rounded-md ${viewMode === 'monthly' ? 'bg-white shadow-sm' : ''}`}
                                    style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, backgroundColor: viewMode === 'monthly' ? 'white' : 'transparent' }}
                                >
                                    <Text className={`text-xs font-bold ${viewMode === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`} style={{ fontSize: 12, fontWeight: 'bold', color: viewMode === 'monthly' ? '#0f172a' : '#94a3b8' }}>Monthly</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Dynamic Bar Chart */}
                        <View className="h-40 flex-row items-end justify-between px-2" style={{ height: 160, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 8 }}>
                            {(chartData.length > 0 ? chartData : [40, 25, 60, 30, 80, 50, 70]).map((h, i) => {
                                const dataToUse = chartData.length > 0 ? chartData : [40, 25, 60, 30, 80, 50, 70];
                                const max = Math.max(...dataToUse);
                                const height = max > 0 ? (h / max) * 120 : 0; // Scale to fit 120px height
                                const isMock = chartData.length === 0;

                                return (
                                    <View key={i} className="items-center gap-2" style={{ alignItems: 'center', gap: 8 }}>
                                        <View
                                            className="w-4 bg-purple-500 rounded-t-sm"
                                            style={{
                                                width: 16,
                                                height: Math.max(height, 4),
                                                backgroundColor: isMock ? '#e9d5ff' : '#a855f7', // Lighter purple for mock
                                                borderTopLeftRadius: 4,
                                                borderTopRightRadius: 4
                                            }}
                                        />
                                    </View>
                                )
                            })}
                        </View>
                        {chartData.length === 0 && (
                            <Text className="text-slate-400 text-[10px] text-center mt-2 italic" style={{ fontSize: 10, textAlign: 'center', marginTop: 8, fontStyle: 'italic', color: '#94a3b8' }}>Demo Data (Start adding expenses to see yours!)</Text>
                        )}
                    </View>

                    <View className="h-[1px] bg-slate-100 my-4" style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 }} />

                    {/* Distribution Chart */}
                    <View>
                        <Text className="text-slate-900 font-bold text-lg mb-6" style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 18, marginBottom: 24 }}>Distribution - Where it goes</Text>

                        {/* Donut Chart (Simulated) */}
                        <View className="items-center justify-center mb-8 relative" style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                            <View className="h-48 w-48 rounded-full border-[20px] border-slate-100 relative items-center justify-center" style={{ height: 192, width: 192, borderRadius: 96, borderWidth: 20, borderColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                                <Text className="text-slate-400 text-sm" style={{ color: '#94a3b8', fontSize: 14 }}>Total</Text>
                                <Text className="text-slate-900 text-2xl font-bold" style={{ color: '#0f172a', fontSize: 24, fontWeight: 'bold' }}>
                                    {totalSpent >= 1000 ? `${(totalSpent / 1000).toFixed(1)}k` : (totalSpent || "8.7k")}
                                </Text>
                            </View>
                        </View>

                        {/* Legend */}
                        <View className="gap-3" style={{ gap: 12 }}>
                            {(categoryData.length > 0 ? categoryData : [
                                { category_name: 'Food', total_amount: 1630 },
                                { category_name: 'Alcohol', total_amount: 3000 },
                                { category_name: 'Rent', total_amount: 4000 }
                            ]).map((d: any, i: number) => (
                                <View key={i} className="flex-row items-center justify-between" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View className="flex-row items-center gap-3" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <View className="h-3 w-3 rounded-full" style={{ height: 12, width: 12, borderRadius: 6, backgroundColor: COLORS[i % COLORS.length] }} />
                                        <Text className="text-slate-600 font-medium" style={{ color: '#475569', fontWeight: '500' }}>{d.category_name}</Text>
                                    </View>
                                    <Text className="text-slate-900 font-bold" style={{ color: '#0f172a', fontWeight: 'bold' }}>₹{d.total_amount.toLocaleString()}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                </MobileCard>
            </ScrollView>
        </MobileContainer>
    );
}
