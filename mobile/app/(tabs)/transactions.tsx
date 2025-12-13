import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { MobileContainer } from "../../src/components/MobileContainer";
import { MobileCard } from "../../src/components/MobileCard";
import { fetchExpenses, Expense } from "../../src/lib/api";
import { useFocusEffect } from "expo-router";

export default function TransactionsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [groupedTxns, setGroupedTxns] = useState<Record<string, Expense[]>>({}); // Added groupedTxns state

    const loadTransactions = useCallback(async () => { // Renamed loadData to loadTransactions
        try {
            const data = await fetchExpenses();
            if (Array.isArray(data) && data.length > 0) {
                // Sort by date desc
                const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setExpenses(sorted); // Keep expenses state updated for existing logic

                // Group by date
                const grouped: Record<string, Expense[]> = {};
                sorted.forEach((tx: Expense) => { // Use sorted data for grouping
                    const dateKey = new Date(tx.date).toLocaleDateString();
                    if (!grouped[dateKey]) grouped[dateKey] = [];
                    grouped[dateKey].push(tx);
                });
                setGroupedTxns(grouped);
            } else {
                // Fallback Mock Data for Demo
                const MOCK_DATA: Expense[] = [
                    {
                        id: 101,
                        description: 'Grocery Run',
                        amount: 450,
                        date: new Date().toISOString().split('T')[0],
                        category_id: 1,
                        category: { id: 1, name: 'Shopping' },
                        created_at: new Date().toISOString(),
                    },
                    {
                        id: 102,
                        description: 'Uber Ride',
                        amount: 220,
                        date: new Date().toISOString().split('T')[0],
                        category_id: 2,
                        category: { id: 2, name: 'Transport' },
                        created_at: new Date().toISOString(),
                    },
                    {
                        id: 103,
                        description: 'Netflix Sub',
                        amount: 199,
                        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                        category_id: 3,
                        category: { id: 3, name: 'Entertainment' },
                        created_at: new Date().toISOString(),
                    },
                    {
                        id: 104,
                        description: 'Coffee',
                        amount: 150,
                        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                        category_id: 4,
                        category: { id: 4, name: 'Food' },
                        created_at: new Date().toISOString(),
                    },
                ];
                // Sort mock data by date desc
                const sortedMock = MOCK_DATA.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setExpenses(sortedMock); // Update expenses state with mock data

                const grouped: Record<string, Expense[]> = {};
                sortedMock.forEach((tx) => {
                    const dateKey = new Date(tx.date).toLocaleDateString();
                    if (!grouped[dateKey]) grouped[dateKey] = [];
                    grouped[dateKey].push(tx);
                });
                setGroupedTxns(grouped);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setRefreshing(true); // Set refreshing to true when screen gains focus
            loadTransactions(); // Call loadTransactions
        }, [loadTransactions])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTransactions(); // Call loadTransactions
        setRefreshing(false);
    };

    // Helper to group by date (Simple: Today vs Others for now to match UI request of grouping)
    const isToday = (dateString: string) => {
        const d = new Date(dateString);
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    };

    const todayExpenses = expenses.filter(e => isToday(e.date));
    const olderExpenses = expenses.filter(e => !isToday(e.date));

    // Helper to get Icon based on category (Simple mapping)
    const getIcon = (catName?: string) => {
        if (!catName) return "💸";
        const name = catName.toLowerCase();
        if (name.includes("food") || name.includes("burger")) return "🍔";
        if (name.includes("drink") || name.includes("alcohol")) return "🍺";
        if (name.includes("transport") || name.includes("fuel")) return "⛽";
        if (name.includes("shop") || name.includes("grocery")) return "🛒";
        return "💸";
    };

    return (
        <MobileContainer>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
            >
                {/* Header */}
                <View className="px-6 py-6" style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
                    <Text className="text-white text-3xl font-bold" style={{ color: 'white', fontSize: 30, fontFamily: 'Outfit_700Bold' }}>Transactions</Text>
                </View>

                {/* Main White Island */}
                <MobileCard className="mx-6 min-h-[500px]" style={{ marginHorizontal: 24, minHeight: 500 }}>

                    {Object.keys(groupedTxns).length > 0 ? Object.keys(groupedTxns).map((dateKey) => (
                        <View key={dateKey} className="mb-6">
                            <Text className="text-slate-400 font-bold mb-4 text-xs uppercase tracking-wider" style={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: 16, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
                                {isToday(dateKey) ? "Today" : dateKey}
                            </Text>
                            <View className="gap-6" style={{ gap: 24 }}>
                                {groupedTxns[dateKey].map(t => (
                                    <View key={t.id} className="flex-row items-center" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View className="h-12 w-12 bg-slate-50 rounded-full items-center justify-center mr-4" style={{ height: 48, width: 48, backgroundColor: '#f8fafc', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                            <Text style={{ fontSize: 20 }}>{getIcon(t.category?.name)}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text className="text-slate-900 font-bold text-base" style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 16 }}>{t.category?.name || "Uncategorized"}</Text>
                                            </View>
                                            <Text className="text-slate-400 text-xs" style={{ color: '#94a3b8', fontSize: 12 }}>{t.date} | {t.description || "No description"}</Text>
                                        </View>
                                        <Text className="text-slate-900 font-bold text-base" style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 16 }}>₹{t.amount}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )) : (
                        <View className="items-center justify-center py-20">
                            <Text className="text-slate-400 text-base">No transactions to show.</Text>
                        </View>
                    )}

                </MobileCard>
            </ScrollView>
        </MobileContainer>
    );
}
