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
            const ts = Date.now();
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            try {
                if (viewMode === 'daily') {
                    const daily = await fetchDailyStats(year, month, ts);
                    const today = new Date().getDate();
                    const start = Math.max(0, today - 7);
                    // Ensure points exist
                    if (daily.points) {
                        points = daily.points.slice(start, today).map((p: any) => p.total_amount);
                    }
                } else {
                    const monthly = await fetchMonthlyStats(year, ts);
                    if (monthly.points) {
                        points = monthly.points.map((p: any) => p.total_amount);
                    }
                }
            } catch (e) { console.error("Chart fetch failed", e); }

            // No Mock Fallback
            setChartData(points);

            // Load Categories
            let catsList = [];
            try {
                const cats = await fetchCategoryStats(year, month, ts);
                catsList = cats.categories || [];
            } catch (e) { console.error("Cat fetch failed", e); }

            setCategoryData(catsList);
            const total = catsList.reduce((acc: number, curr: any) => acc + curr.total_amount, 0);
            setTotalSpent(total);

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
                <MobileCard className="mx-6 min-h-[600px] rounded-3xl" style={{ marginHorizontal: 24, minHeight: 600 }}>

                    {/* Spending Trends Chart */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-6" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Text className="text-white font-bold text-lg" style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Analytics</Text>
                            <View className="flex-row bg-white/10 rounded-lg p-1" style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 4 }}>
                                <Pressable
                                    onPress={() => setViewMode('daily')}
                                    className={`px-3 py-1 rounded-md ${viewMode === 'daily' ? 'bg-white shadow-sm' : ''}`}
                                    style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, backgroundColor: viewMode === 'daily' ? 'white' : 'transparent' }}
                                >
                                    <Text className={`text-xs font-bold ${viewMode === 'daily' ? 'text-black' : 'text-slate-400'}`} style={{ fontSize: 12, fontWeight: 'bold', color: viewMode === 'daily' ? 'black' : '#94a3b8' }}>Daily</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setViewMode('monthly')}
                                    className={`px-3 py-1 rounded-md ${viewMode === 'monthly' ? 'bg-white shadow-sm' : ''}`}
                                    style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, backgroundColor: viewMode === 'monthly' ? 'white' : 'transparent' }}
                                >
                                    <Text className={`text-xs font-bold ${viewMode === 'monthly' ? 'text-black' : 'text-slate-400'}`} style={{ fontSize: 12, fontWeight: 'bold', color: viewMode === 'monthly' ? 'black' : '#94a3b8' }}>Monthly</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Chart Bars */}
                        <View className="flex-row items-end justify-between h-52 mb-12 p-4" style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 208, marginBottom: 48 }}>
                            {chartData.map((val: number, i: number) => {
                                const max = Math.max(...chartData, 1);
                                const height = (val / max) * 100;
                                const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                                const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

                                // Simple logic for label - in real app, sync with data date
                                let label = "";
                                if (viewMode === 'daily') {
                                    const today = new Date().getDay(); // 0-6
                                    // If we are showing last 7 days ending today.
                                    // data[6] is today. data[0] is today-6.
                                    // so index i corresponds to (today - 6 + i).
                                    const targetDay = (today - 6 + i + 7) % 7;
                                    label = days[targetDay];
                                } else {
                                    label = months[i % 12];
                                }

                                return (
                                    <View key={i} className="items-center flex-1" style={{ alignItems: 'center', flex: 1 }}>
                                        <View className="w-4 bg-white/10 rounded-full overflow-hidden" style={{ width: 16, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, justifyContent: 'flex-end' }}>
                                            <View
                                                className="w-full bg-indigo-500 rounded-full absolute bottom-0"
                                                style={{
                                                    width: '100%',
                                                    height: `${Math.max(height * 0.85, 5)}%`,
                                                    backgroundColor: '#6366f1',
                                                    borderRadius: 999,
                                                    position: 'absolute',
                                                    bottom: 0
                                                }}
                                            />
                                        </View>
                                        <Text className="text-[10px] text-slate-400 mt-2 font-medium" style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, fontWeight: '500' }}>{label}</Text>
                                    </View>
                                )
                            })}
                        </View>

                        {/* Breakdown */}
                        <Text className="text-white font-bold mb-6 text-lg" style={{ color: 'white', fontWeight: 'bold', marginBottom: 24, fontSize: 18 }}>Category Breakdown</Text>
                        {categoryData.map((c: any, i: number) => (
                            <View key={i} className="flex-row justify-between items-center mb-4" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <View className="flex-row items-center gap-3" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View className="w-3 h-3 rounded-full" style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS[i % COLORS.length] }} />
                                    <Text className="text-slate-300 font-medium text-base" style={{ color: '#cbd5e1', fontWeight: '500', fontSize: 16 }}>{c.category_name}</Text>
                                </View>
                                <Text className="text-white font-bold text-base" style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>₹{c.total_amount}</Text>
                            </View>
                        ))}
                    </View>
                </MobileCard>
            </ScrollView>
        </MobileContainer>
    );
}
