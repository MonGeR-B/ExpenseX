import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { fetchSummaryStats, fetchExpenses, fetchCategoryStats, fetchDailyStats } from "../../src/lib/api";
import { useFocusEffect } from "expo-router";
import { MobileContainer } from "../../src/components/MobileContainer";
import { MobileCard } from "../../src/components/MobileCard";
import { Bell, TrendingUp, DollarSign, List, ArrowUpRight, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function OverviewScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState<any>({});
    const [recentTxns, setRecentTxns] = useState<any[]>([]);
    const [catStats, setCatStats] = useState<any[]>([]);

    const [dailyStats, setDailyStats] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        try {
            // Parallel Fetching for <250ms load time
            const [sumData, expenses, cats, daily] = await Promise.all([
                fetchSummaryStats(),
                fetchExpenses(),
                fetchCategoryStats(),
                fetchDailyStats()
            ]);

            setSummary(sumData || {});

            // Process Recent Transactions (Sort Date Desc)
            if (Array.isArray(expenses)) {
                const sorted = expenses.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setRecentTxns(sorted.slice(0, 10));
            } else {
                setRecentTxns([]);
            }

            // Process Category Stats (Pie Proxy)
            // Fix: API returns { categories: [...] }
            const catsArray = (cats as any)?.categories || [];

            if (Array.isArray(catsArray)) {
                const sortedCats = catsArray.sort((a: any, b: any) => (b.total_amount || 0) - (a.total_amount || 0)).slice(0, 4);
                setCatStats(sortedCats);
            } else {
                setCatStats([]);
            }

            // Process Daily Stats for Chart
            // Expecting daily.points = [{ date: '...', total_amount: 100 }, ...]
            if (daily && Array.isArray(daily.points)) {
                // Take last 7 days
                const last7 = daily.points.slice(-7);
                setDailyStats(last7);
            }

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
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

    const getIcon = (catName?: string) => {
        if (!catName) return "💸";
        const name = catName.toLowerCase();
        if (name.includes("food") || name.includes("burger")) return "🍔";
        if (name.includes("drink") || name.includes("alcohol")) return "🍺";
        if (name.includes("transport") || name.includes("fuel")) return "⛽";
        if (name.includes("shop") || name.includes("grocery")) return "🛒";
        return "💸";
    };

    // Mock Data Fallbacks if API returns empty
    const MOCK_DAILY = [
        { date: '2023-01-01', total_amount: 45 },
        { date: '2023-01-02', total_amount: 80 },
        { date: '2023-01-03', total_amount: 30 },
        { date: '2023-01-04', total_amount: 60 },
        { date: '2023-01-05', total_amount: 90 },
        { date: '2023-01-06', total_amount: 55 },
        { date: '2023-01-07', total_amount: 75 },
    ];

    const MOCK_CATS = [
        { name: 'Food', total_amount: 1500, color: '#f87171' },
        { name: 'Transport', total_amount: 800, color: '#60a5fa' },
        { name: 'Shopping', total_amount: 1200, color: '#c084fc' },
        { name: 'Ent.', total_amount: 500, color: '#fbbf24' },
    ];

    const MOCK_TXNS = [
        { id: 'm1', title: 'Grocery Run', amount: 450, date: new Date().toISOString(), category_name: 'Shopping' },
        { id: 'm2', title: 'Uber Ride', amount: 220, date: new Date(Date.now() - 86400000).toISOString(), category_name: 'Transport' },
        { id: 'm3', title: 'Netflix Sub', amount: 199, date: new Date(Date.now() - 172800000).toISOString(), category_name: 'Entertainment' },
    ];

    // Use stats or fallback to mocks for visual demonstration
    const displayDaily = dailyStats.length > 0 ? dailyStats : MOCK_DAILY;
    const displayCats = catStats.length > 0 ? catStats : MOCK_CATS;
    const displayTxns = recentTxns.length > 0 ? recentTxns : MOCK_TXNS;
    const displayTotal = summary.total_spent || (displayCats === MOCK_CATS ? 4000 : 0);


    // Calculate max value for chart scaling
    const maxChartValue = displayDaily.length > 0 ? Math.max(...displayDaily.map((d: any) => d.total_amount)) : 100;


    return (
        <MobileContainer>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
            >
                {/* Header */}
                <View className="px-6 py-4 flex-row justify-between items-center" style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text className="text-slate-400 text-sm font-medium" style={{ color: '#94a3b8', fontSize: 14 }}>Good Morning,</Text>
                        <Text className="text-white text-2xl font-bold" style={{ color: 'white', fontSize: 24, fontFamily: 'Outfit_700Bold' }}>Hello, Baibhab 👋</Text>
                    </View>
                    <View className="flex-row gap-4 items-center" style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                        <Pressable className="bg-slate-900 p-2 rounded-full border border-slate-800" style={{ backgroundColor: '#0f172a', padding: 8, borderRadius: 999, borderWidth: 1, borderColor: '#1e293b' }}>
                            <Bell size={20} color="white" />
                        </Pressable>
                        <Pressable
                            onPress={() => router.push("/profile")}
                            className="h-10 w-10 bg-slate-800 rounded-full border-2 border-slate-700 items-center justify-center"
                            style={{ height: 40, width: 40, backgroundColor: '#1e293b', borderRadius: 20, borderWidth: 2, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <User size={20} color="white" />
                        </Pressable>
                    </View>
                </View>

                {/* Main White Island - Increased roundedness */}
                <MobileCard className="mx-6 min-h-[500px]" style={{ marginHorizontal: 24, minHeight: 500 }}>

                    {/* Dashboard Header & Add Button */}
                    <View className="flex-row justify-between items-center mb-6" style={{ marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text className="text-slate-900 font-bold text-lg" style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 18 }}>Dashboard</Text>
                        <Pressable
                            onPress={() => router.push("/add-expense")}
                            className="bg-slate-900 px-4 py-2 rounded-full shadow-md shadow-slate-900/20"
                            style={{ backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}
                        >
                            <Text className="text-white font-bold text-xs" style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>+ Add Expense</Text>
                        </Pressable>
                    </View>

                    {/* 1. Summary Cards - Even more rounded (3xl) */}
                    <View className="flex-row gap-3 mb-6" style={{ gap: 12, marginBottom: 24 }}>
                        {/* Total Spent */}
                        <View className="flex-1 bg-blue-50 p-4 rounded-3xl border border-blue-100" style={{ flex: 1, backgroundColor: '#eff6ff', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#dbeafe' }}>
                            <View className="h-10 w-10 bg-blue-500 rounded-full items-center justify-center mb-3" style={{ height: 40, width: 40, backgroundColor: '#3b82f6', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <DollarSign size={20} color="white" />
                            </View>
                            <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Spent</Text>
                            <Text className="text-slate-900 text-2xl font-bold" style={{ color: '#0f172a', fontSize: 24, fontWeight: 'bold' }}>₹{displayTotal.toLocaleString()}</Text>
                        </View>
                        {/* Transactions */}
                        <View className="flex-1 bg-pink-50 p-4 rounded-3xl border border-pink-100" style={{ flex: 1, backgroundColor: '#fdf2f8', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#fce7f3' }}>
                            <View className="h-10 w-10 bg-pink-500 rounded-full items-center justify-center mb-3" style={{ height: 40, width: 40, backgroundColor: '#ec4899', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <List size={20} color="white" />
                            </View>
                            <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Transactions</Text>
                            <Text className="text-slate-900 text-2xl font-bold" style={{ color: '#0f172a', fontSize: 24, fontWeight: 'bold' }}>{summary.transactions_count || (displayDaily === MOCK_DAILY ? 15 : 0)}</Text>
                        </View>
                    </View>

                    {/* 2. Expanded Analytics Chart */}
                    <Text className="text-slate-900 font-bold mb-4 text-base" style={{ color: '#0f172a', fontWeight: 'bold', marginBottom: 16, fontSize: 16 }}>Spending Trends</Text>
                    <View className="bg-purple-50 rounded-3xl p-5 border border-purple-100 mb-8" style={{ backgroundColor: '#faf5ff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f3e8ff', marginBottom: 32 }}>
                        <Text className="text-purple-400 font-medium mb-6 text-xs uppercase" style={{ color: '#a855f7', fontSize: 12, textTransform: 'uppercase', marginBottom: 24 }}>Last 7 Days {displayDaily === MOCK_DAILY && "(Demo)"}</Text>
                        <View className="flex-row items-end justify-between h-32" style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 128 }}>
                            {displayDaily.map((d: any, i: number) => {
                                const height = maxChartValue > 0 ? (d.total_amount / maxChartValue) * 100 : 0;
                                const dateObj = new Date(d.date);
                                // Fallback key if date invalid
                                const dayLabel = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-US', { weekday: 'narrow' }) : ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i % 7];
                                return (
                                    <View key={i} className="items-center" style={{ alignItems: 'center' }}>
                                        <View
                                            className="w-8 bg-purple-400 rounded-full"
                                            style={{
                                                width: 32,
                                                height: `${Math.max(height, 5)}%`,
                                                backgroundColor: '#c084fc',
                                                borderRadius: 20
                                            }}
                                        />
                                        <Text className="text-xs text-slate-400 mt-2 font-medium" style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, fontWeight: '500' }}>{dayLabel}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* 3. Distribution (Pie Proxy) */}
                    <Text className="text-slate-900 font-bold mb-4 text-base" style={{ color: '#0f172a', fontWeight: 'bold', marginBottom: 16, fontSize: 16 }}>Top Categories</Text>
                    <View className="mb-8" style={{ marginBottom: 32 }}>
                        {displayCats.map((c: any, i: number) => {
                            // Handle difference between mock (total_amount) and real (total) if any, or normalize
                            const amount = c.total_amount || c.total || 0;
                            const total = displayTotal > 0 ? displayTotal : 1;
                            return (
                                <View key={i} className="mb-5" style={{ marginBottom: 20 }}>
                                    <View className="flex-row justify-between mb-2" style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <View className="flex-row items-center gap-3" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <View className="w-8 h-8 rounded-full items-center justify-center bg-slate-100" style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9' }}>
                                                <Text>{getIcon(c.name)}</Text>
                                            </View>
                                            <Text className="text-slate-700 font-bold" style={{ color: '#334155', fontWeight: 'bold' }}>{c.name}</Text>
                                        </View>
                                        <Text className="text-slate-900 font-bold" style={{ color: '#0f172a', fontWeight: 'bold' }}>{((amount / total) * 100).toFixed(0)}%</Text>
                                    </View>
                                    <View className="h-3 bg-slate-100 rounded-full w-full overflow-hidden" style={{ height: 12, backgroundColor: '#f1f5f9', borderRadius: 999, width: '100%', overflow: 'hidden' }}>
                                        <View className="h-full rounded-full" style={{ height: '100%', width: `${(amount / total) * 100}%`, backgroundColor: c.color || '#3b82f6', borderRadius: 999 }} />
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* 4. Recent Activity List */}
                    <Text className="text-slate-900 font-bold mb-4 text-base" style={{ color: '#0f172a', fontWeight: 'bold', marginBottom: 16, fontSize: 16 }}>Recent Activity</Text>
                    <View className="bg-white rounded-3xl p-2" style={{ backgroundColor: 'white', borderRadius: 24, padding: 8 }}>
                        {displayTxns.length > 0 ? displayTxns.map((tx: any, i: number) => (
                            <View key={i} className="flex-row items-center justify-between p-4 mb-2 bg-slate-50 rounded-2xl border border-slate-100" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 8, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                                <View className="flex-row items-center gap-4" style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    <View className="h-12 w-12 rounded-full items-center justify-center bg-white border border-slate-100 shadow-sm" style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text className="text-xl">{getIcon(tx.category_name)}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-slate-900 font-bold text-base" style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 16 }}>{tx.title || "Expense"}</Text>
                                        <Text className="text-slate-500 text-xs mt-1" style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{new Date(tx.date).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                                <Text className="text-slate-900 font-bold text-lg" style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 18 }}>-₹{tx.amount}</Text>
                            </View>
                        )) : (
                            <Text className="text-slate-400 text-center py-4">No recent transactions.</Text>
                        )}
                        {recentTxns.length === 0 && (
                            <Text className="text-slate-400 text-[10px] text-center mt-2 italic" style={{ fontSize: 10, textAlign: 'center', marginTop: 8, fontStyle: 'italic', color: '#94a3b8' }}>Demo Transactions</Text>
                        )}
                    </View>

                </MobileCard>
            </ScrollView>
        </MobileContainer>
    );
}
