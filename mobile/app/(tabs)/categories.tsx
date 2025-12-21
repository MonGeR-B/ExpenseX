import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable, Alert } from "react-native";
import { MobileContainer } from "../../src/components/MobileContainer";
import { MobileCard } from "../../src/components/MobileCard";
import { fetchCategories, deleteCategory, Category } from "../../src/lib/api";
import { cache, CACHE_KEYS } from "../../src/lib/cache";
import { useFocusEffect } from "expo-router";

export default function CategoriesScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const MOCK_CATEGORIES: Category[] = [
        { id: 1, name: "Food", color: "#f87171" },
        { id: 2, name: "Transport", color: "#60a5fa" },
        { id: 3, name: "Entertainment", color: "#fbbf24" },
        { id: 4, name: "Shopping", color: "#c084fc" },
        { id: 5, name: "Bills", color: "#34d399" },
        { id: 6, name: "Health", color: "#f472b6" },
    ];

    const loadData = useCallback(async () => {
        // 1. Load Cache
        const cached = await cache.load<Category[]>(CACHE_KEYS.CATEGORIES);
        if (cached && cached.length > 0) {
            setCategories(cached);
        }

        try {
            const data = await fetchCategories();
            if (Array.isArray(data) && data.length > 0) {
                setCategories(data);
                await cache.save(CACHE_KEYS.CATEGORIES, data);
            } else if (!cached) {
                setCategories(MOCK_CATEGORIES);
            }
        } catch (error) {
            console.error("Categories: Error", error);
            if (!cached) {
                setCategories(MOCK_CATEGORIES);
            }
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

    const handleDelete = (cat: Category) => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${cat.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const success = await deleteCategory(cat.id);
                        if (success) {
                            setCategories(prev => prev.filter(c => c.id !== cat.id));
                            // Update cache
                            const updated = categories.filter(c => c.id !== cat.id);
                            cache.save(CACHE_KEYS.CATEGORIES, updated);
                        } else {
                            Alert.alert("Error", "Could not delete category.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <MobileContainer>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="p-6">
                    <Text className="text-white text-3xl font-bold mb-6" style={{ fontFamily: 'Outfit_700Bold' }}>Categories</Text>

                    <MobileCard className="min-h-[500px] rounded-3xl">
                        <Text className="text-slate-400 text-xs mb-4 text-center">Long press to delete</Text>
                        <View className="flex-row flex-wrap justify-between gap-y-6">
                            {categories.map((cat) => (
                                <Pressable
                                    key={cat.id}
                                    onLongPress={() => handleDelete(cat)}
                                    className="w-[48%] items-center bg-white/5 p-4 rounded-xl border border-white/10 active:bg-red-500/10 active:border-red-500/50"
                                    style={({ pressed }) => ({
                                        width: '48%',
                                        alignItems: 'center',
                                        backgroundColor: pressed ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                                        padding: 16,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: pressed ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'
                                    })}
                                >
                                    <View className="h-12 w-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: cat.color ? cat.color + '40' : '#334155' }}>
                                        <Text className="text-xl">{cat.icon || "🏷️"}</Text>
                                    </View>
                                    <Text className="font-bold text-white text-center">{cat.name}</Text>
                                    <View className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                                        <View className="h-full bg-slate-400 w-1/2" />
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                        {categories.length === 0 && (
                            <Text className="text-slate-400 text-center mt-10">No categories found.</Text>
                        )}
                        {/* Demo Indicator */}
                        <Text className="text-slate-400 text-[10px] text-center mt-8 italic" style={{ fontSize: 10, textAlign: 'center', marginTop: 32, fontStyle: 'italic', color: '#94a3b8' }}>
                            {categories === MOCK_CATEGORIES ? "Demo Categories" : ""}
                        </Text>
                    </MobileCard>
                </View>
            </ScrollView>
        </MobileContainer>
    );
}
