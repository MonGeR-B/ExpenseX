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

    const isToday = (dateString: string) => {
        const today = new Date().toLocaleDateString();
        return dateString === today;
    };

    // Helper to group by date (Simple: Today vs Others for now to match UI request of grouping)
    // NOTE: isToday is defined above.

    // const todayExpenses = expenses.filter(e => isToday(e.date));
    // const olderExpenses = expenses.filter(e => !isToday(e.date));

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
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
            >
                {/* Header */}
                <View className="px-6 py-6" style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
                    <Text className="text-white text-3xl font-bold" style={{ color: 'white', fontSize: 30, fontFamily: 'Outfit_700Bold' }}>Transactions</Text>
                </View>

                {/* Filters (Mock) */}
                <View className="px-6 mb-6 flex-row gap-3" style={{ paddingHorizontal: 24, marginBottom: 24, flexDirection: 'row', gap: 12 }}>
                    <View className="bg-white/10 px-4 py-2 rounded-full border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Text className="text-white font-bold text-xs" style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>All Time</Text>
                    </View>
                    <View className="bg-white/5 px-4 py-2 rounded-full border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Text className="text-slate-400 font-bold text-xs" style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: 12 }}>Category</Text>
                    </View>
                </View>

                {/* Grouped Lists */}
                {Object.keys(groupedTxns).length === 0 ? (
                    <Text className="text-slate-400 text-center mt-10" style={{ color: '#94a3b8', textAlign: 'center', marginTop: 40 }}>No transactions found.</Text>
                ) : (
                    Object.entries(groupedTxns).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([date, txns]) => (
                        <View key={date} className="mb-6 px-6" style={{ marginBottom: 24, paddingHorizontal: 24 }}>
                            <Text className="text-slate-400 font-bold mb-3 text-xs uppercase" style={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: 12, fontSize: 12, textTransform: 'uppercase' }}>{date}</Text>
                            {txns.map((tx) => (
                                <MobileCard key={tx.id} className="rounded-3xl mb-3 p-4 flex-row items-center justify-between" style={{ marginBottom: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View className="flex-row items-center gap-4" style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                        <View className="h-10 w-10 bg-white/10 rounded-full items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text className="text-lg">{tx.category && tx.category.icon ? tx.category.icon : "💸"}</Text>
                                        </View>
                                        <View>
                                            <Text className="text-white font-bold text-base" style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{tx.description}</Text>
                                            <Text className="text-slate-400 text-xs" style={{ color: '#94a3b8', fontSize: 12 }}>{tx.category ? tx.category.name : 'Uncategorized'}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-white font-bold text-base" style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>-₹{tx.amount.toLocaleString()}</Text>
                                </MobileCard>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
        </MobileContainer>
    );
}
