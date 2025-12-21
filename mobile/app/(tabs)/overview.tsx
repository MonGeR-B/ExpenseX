import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { fetchSummaryStats, fetchExpenses, fetchCategoryStats, fetchDailyStats, fetchCategories, Category } from "../../src/lib/api";
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
    const [categories, setCategories] = useState<Category[]>([]);

    const loadData = useCallback(async () => {
        try {
            // Parallel Fetching with Resilience (Promise.allSettled)
            const ts = Date.now();
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            const results = await Promise.allSettled([
                fetchSummaryStats(year, month, ts),
                fetchExpenses(),
                fetchCategories(),
                fetchDailyStats(year, month, ts)
            ]);

            const sumData = results[0].status === 'fulfilled' ? results[0].value : {};
            const expenses = results[1].status === 'fulfilled' ? results[1].value : [];
            const cats = results[2].status === 'fulfilled' ? results[2].value : [];
            const daily = results[3].status === 'fulfilled' ? results[3].value : {};

            // ... (Logging remains)

            setSummary(sumData || {});

            // Process Recent Transactions (Sort Date Desc)
            if (Array.isArray(expenses)) {
                // Determine if we need to parse date strings or if they are already Date objects (usually strings from JSON)
                const sorted = expenses.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setRecentTxns(sorted.slice(0, 5)); // Show top 5 on dashboard
            } else {
                setRecentTxns([]);
            }

            // Categories for Icons
            if (Array.isArray(cats)) {
                setCategories(cats);
            }

            // Daily Stats for Chart
            const points = daily.points || [];
            // Slice ending at today to avoid future zero-days
            const todayDate = new Date().getDate();
            const endIndex = Math.min(todayDate, points.length);
            const startIndex = Math.max(0, endIndex - 7);
            const slicedPoints = points.slice(startIndex, endIndex);
            setDailyStats(slicedPoints);

            try {
                const breakdown = await fetchCategoryStats(year, month, ts);
                if (breakdown && Array.isArray(breakdown.categories)) {
                    setCatStats(breakdown.categories);
                } else if (breakdown && Array.isArray(breakdown.category_breakdown)) {
                    setCatStats(breakdown.category_breakdown);
                } else if (breakdown && Array.isArray(breakdown)) {
                    setCatStats(breakdown);
                }
            } catch (e) {
                console.log("Failed to fetch breakdown", e);
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
        // Try to find in loaded categories first
        const found = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (found && found.icon) return found.icon;

        // Fallback
        const name = catName.toLowerCase();
        if (name.includes("food") || name.includes("burger")) return "🍔";
        if (name.includes("drink") || name.includes("alcohol")) return "🍺";
        if (name.includes("transport") || name.includes("fuel")) return "⛽";
        if (name.includes("shop") || name.includes("grocery")) return "🛒";
        return "💸";
    };

    // Mock Data Fallbacks if API returns empty
    const generateMockDaily = () => {
        const data = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            data.push({
                date: d.toISOString().split('T')[0],
                total_amount: Math.floor(Math.random() * 100) + 20
            });
        }
        return data;
    };

    const MOCK_DAILY = generateMockDaily();

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

    // Use stats (Real Data Only - No Mocks)
    const hasData = dailyStats.length > 0 && Math.max(...dailyStats.map((d: any) => d.total_amount)) > 0;
    const displayDaily = hasData ? dailyStats : [];

    // Categories
    const hasCatData = catStats.length > 0 && catStats.reduce((acc: any, curr: any) => acc + (curr.total_amount || 0), 0) > 0;
    const rawCats = hasCatData ? catStats : [];

    // Sort strictly by amount (Highest first) and take top 4
    const displayCats = rawCats
        .sort((a: any, b: any) => {
            const valA = a.total_amount || a.total || 0;
            const valB = b.total_amount || b.total || 0;
            return valB - valA;
        })
        .slice(0, 4);

    const displayTxns = recentTxns;
    const displayTotal = summary.total_spent || 0;


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
                <MobileCard className="mx-6 min-h-[500px] rounded-3xl" style={{ marginHorizontal: 24, minHeight: 500 }}>

                    {/* Dashboard Header & Add Button */}
                    <View className="flex-row justify-between items-center mb-6" style={{ marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text className="text-white font-bold text-lg" style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Dashboard</Text>
                        <Pressable
                            onPress={() => router.push("/add-expense")}
                            className="bg-white px-5 py-2.5 rounded-full"
                            style={{ backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}
                        >
                            <Text className="text-black font-bold text-xs" style={{ color: 'black', fontWeight: 'bold', fontSize: 12 }}>+ Add Expense</Text>
                        </Pressable>
                    </View>

                    {/* 1. Summary Cards - Even more rounded (3xl) */}
                    <View className="flex-row gap-3 mb-6" style={{ gap: 12, marginBottom: 24 }}>
                        {/* Total Spent */}
                        <View className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/10" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                            <View className="h-10 w-10 bg-indigo-500 rounded-full items-center justify-center mb-3" style={{ height: 40, width: 40, backgroundColor: '#6366f1', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <DollarSign size={20} color="white" />
                            </View>
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Spent</Text>
                            <Text className="text-white text-2xl font-bold" style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>₹{displayTotal.toLocaleString()}</Text>
                        </View>
                        {/* Transactions */}
                        <View className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/10" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                            <View className="h-10 w-10 bg-pink-500 rounded-full items-center justify-center mb-3" style={{ height: 40, width: 40, backgroundColor: '#ec4899', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <List size={20} color="white" />
                            </View>
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Transactions</Text>
                            <Text className="text-white text-2xl font-bold" style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{summary.transactions_count || (displayDaily === MOCK_DAILY ? 15 : 0)}</Text>
                        </View>
                    </View>

                    {/* 2. Expanded Analytics Chart */}
                    <Text className="text-white font-bold mb-4 text-base" style={{ color: 'white', fontWeight: 'bold', marginBottom: 16, fontSize: 16 }}>Spending Trends</Text>
                    <View className="bg-white/5 rounded-3xl p-5 border border-white/10 mb-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 32 }}>
                        <Text className="text-purple-400 font-medium mb-6 text-xs uppercase" style={{ color: '#a855f7', fontSize: 12, textTransform: 'uppercase', marginBottom: 24 }}>Last 7 Days {displayDaily === MOCK_DAILY && "(Demo)"}</Text>
                        <View className="flex-row items-end justify-between h-40" style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160 }}>
                            {displayDaily.map((d: any, i: number) => {
                                const height = maxChartValue > 0 ? (d.total_amount / maxChartValue) * 100 : 0;
                                const dateObj = new Date(d.date);
                                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                const dayLabel = !isNaN(dateObj.getTime()) ? days[dateObj.getDay()] : days[i % 7];
                                return (
                                    <View key={i} className="items-center" style={{ alignItems: 'center' }}>
                                        <View
                                            className="w-8 bg-purple-500 rounded-full"
                                            style={{
                                                width: 32,
                                                height: `${Math.max(height, 5)}%`,
                                                backgroundColor: '#a855f7',
                                                borderRadius: 20,
                                                shadowColor: '#a855f7',
                                                shadowOpacity: 0.3,
                                                shadowRadius: 5
                                            }}
                                        />
                                        <Text className="text-xs text-slate-400 mt-2 font-medium" style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, fontWeight: '500' }}>{dayLabel}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* 3. Distribution (Pie Proxy) */}
                    <Text className="text-white font-bold mb-4 text-base" style={{ color: 'white', fontWeight: 'bold', marginBottom: 16, fontSize: 16 }}>Top Categories</Text>
                    <View className="mb-8" style={{ marginBottom: 32 }}>
                        {displayCats.map((c: any, i: number) => {
                            // Handle difference between mock (total_amount) and real (total) if any, or normalize
                            const amount = c.total_amount || c.total || 0;
                            const name = c.category_name || c.name || "Uncategorized";
                            const total = displayTotal > 0 ? displayTotal : 1;
                            return (
                                <View key={i} className="mb-5" style={{ marginBottom: 20 }}>
                                    <View className="flex-row justify-between mb-2" style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <View className="flex-row items-center gap-3" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <View className="w-8 h-8 rounded-full items-center justify-center bg-white/10" style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                <Text>{getIcon(name)}</Text>
                                            </View>
                                            <Text className="text-slate-300 font-bold" style={{ color: '#cbd5e1', fontWeight: 'bold' }}>{name}</Text>
                                        </View>
                                        <Text className="text-white font-bold" style={{ color: 'white', fontWeight: 'bold' }}>{((amount / total) * 100).toFixed(0)}%</Text>
                                    </View>
                                    <View className="h-2 bg-white/10 rounded-full w-full overflow-hidden" style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, width: '100%', overflow: 'hidden' }}>
                                        <View className="h-full rounded-full" style={{ height: '100%', width: `${(amount / total) * 100}%`, backgroundColor: c.color || '#3b82f6', borderRadius: 999 }} />
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* 4. Recent Activity List */}
                    <Text className="text-slate-900 font-bold mb-4 text-base" style={{ color: 'white', fontWeight: 'bold', marginBottom: 16, fontSize: 16 }}>Recent Activity</Text>
                    <View className="bg-white rounded-3xl p-2" style={{ backgroundColor: 'white', borderRadius: 24, padding: 8 }}>
                        {displayTxns.length > 0 ? displayTxns.map((tx: any, i: number) => {
                            const title = tx.description || tx.title || "Expense";
                            const categoryName = tx.category?.name || tx.category_name || "Uncategorized";
                            const icon = tx.category?.icon || getIcon(categoryName);

                            return (
                                <View key={i} className="flex-row items-center justify-between p-4 mb-2 bg-slate-50 rounded-2xl border border-slate-100" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 8, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                                    <View className="flex-row items-center gap-4" style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                        <View className="h-12 w-12 rounded-full items-center justify-center bg-white border border-slate-100 shadow-sm" style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text className="text-2xl">{icon}</Text>
                                        </View>
                                        <View>
                                            <Text className="text-slate-900 font-bold text-base" style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 16 }}>{title}</Text>
                                            <Text className="text-slate-500 text-xs mt-1" style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{categoryName}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-slate-900 font-bold text-lg" style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 18 }}>-₹{tx.amount.toLocaleString()}</Text>
                                </View>
                            )
                        }) : (
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
