import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    TextInput,
    Alert,
    Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { createExpense, fetchExpenses, type Expense, API_BASE_URL } from "../src/lib/api";

export default function DashboardScreen() {
    const router = useRouter();
    const { token, logout } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);

    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            setLastError(null);
            const data = await fetchExpenses();
            setExpenses(data);
        } catch (err: any) {
            console.error(err);
            setLastError(err.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            router.replace("/login");
            return;
        }
        load();
    }, [token]);

    const totalThisSession = expenses.reduce(
        (sum, e) => sum + Number(e.amount || 0),
        0
    );

    const handleAddExpense = async () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) {
            Alert.alert("Invalid amount", "Enter a positive number.");
            return;
        }

        const today = new Date().toISOString().slice(0, 10);

        try {
            const newExp = await createExpense({
                date: today,
                amount: amt,
                description: description || undefined,
            });
            setExpenses((prev) => [newExp, ...prev]);
            setAmount("");
            setDescription("");
            setShowAdd(false);
        } catch (err: any) {
            console.error(err);
            Alert.alert("Error", "Failed to create expense.");
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#020617', paddingHorizontal: 20, paddingTop: 48 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <View>
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>Dashboard</Text>
                    <Text style={{ fontSize: 24, fontWeight: '600', color: '#f8fafc' }}>
                        Your spending
                    </Text>
                </View>
                <Pressable
                    onPress={handleLogout}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }}
                >
                    <Text style={{ fontSize: 12, color: '#e2e8f0' }}>Logout</Text>
                </Pressable>
            </View>

            {/* Balance card */}
            <View style={{ marginBottom: 24, borderRadius: 24, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', padding: 16 }}>
                <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Total tracked</Text>
                <Text style={{ fontSize: 30, fontWeight: '600', color: '#f8fafc', marginBottom: 8 }}>
                    ₹{totalThisSession.toFixed(0)}
                </Text>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                    This is just the sum of all expenses for your current account.
                </Text>
            </View>

            {/* Add expense button */}
            <Pressable
                onPress={() => setShowAdd(true)}
                style={{ marginBottom: 16, borderRadius: 9999, backgroundColor: '#10b981', paddingVertical: 12, alignItems: 'center' }}
            >
                <Text style={{ color: '#020617', fontWeight: '600', fontSize: 14 }}>
                    + Add expense
                </Text>
            </Pressable>

            {/* Recent list */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#e2e8f0', marginBottom: 8 }}>
                Recent expenses
            </Text>

            {loading ? (
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>Loading…</Text>
            ) : expenses.length === 0 ? (
                <Text style={{ fontSize: 12, color: '#64748b' }}>
                    No expenses yet. Start logging your damage.
                </Text>
            ) : (
                <FlatList
                    data={expenses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b' }}>
                            <View>
                                <Text style={{ color: '#f1f5f9', fontSize: 14 }}>
                                    {item.description || "No description"}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#64748b' }}>{item.date}</Text>
                            </View>
                            <Text style={{ color: '#f8fafc', fontWeight: '600', fontSize: 14 }}>
                                ₹{Number(item.amount).toFixed(0)}
                            </Text>
                        </View>
                    )}
                />
            )}

            {/* Add expense modal */}
            <Modal
                visible={showAdd}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAdd(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: '#020617', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderTopWidth: 1, borderTopColor: '#334155' }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#f8fafc', marginBottom: 12 }}>
                            Add expense
                        </Text>

                        <Text style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>Amount</Text>
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            style={{ backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, color: '#f8fafc', marginBottom: 12 }}
                            placeholder="e.g. 250"
                            placeholderTextColor="#4b5563"
                        />

                        <Text style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>Description</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            style={{ backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, color: '#f8fafc', marginBottom: 16 }}
                            placeholder="Swiggy, Uber, etc."
                            placeholderTextColor="#4b5563"
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                            <Pressable
                                onPress={() => setShowAdd(false)}
                                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }}
                            >
                                <Text style={{ fontSize: 12, color: '#e2e8f0' }}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleAddExpense}
                                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, backgroundColor: '#10b981' }}
                            >
                                <Text style={{ fontSize: 12, color: '#020617', fontWeight: '600' }}>
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* DEBUG PANEL */}
            <View style={{ marginTop: 32, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(136, 19, 55, 0.5)' }}>
                <Text style={{ color: '#fb7185', fontWeight: 'bold', marginBottom: 8 }}>🔧 Debug Info</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>API: {API_BASE_URL}</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                    Token: {token ? token.slice(0, 10) + "..." : "None"}
                </Text>
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                    Loaded: {expenses.length} items
                </Text>
                {lastError && (
                    <Text style={{ fontSize: 12, color: '#f43f5e', marginTop: 8, fontFamily: 'monospace' }}>
                        {lastError}
                    </Text>
                )}
                <Pressable
                    onPress={() => {
                        setLastError(null);
                        load();
                    }}
                    style={{ marginTop: 12, backgroundColor: '#1e293b', padding: 8, borderRadius: 4, alignItems: 'center' }}
                >
                    <Text style={{ fontSize: 12, color: '#cbd5e1' }}>Retry Fetch</Text>
                </Pressable>
            </View>
        </View>
    );
}
