import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { MobileContainer } from "../../src/components/MobileContainer";
import { MobileCard } from "../../src/components/MobileCard";
import { fetchCategories, Category } from "../../src/lib/api";
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

    return (
        <MobileContainer>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="p-6">
                    <Text className="text-white text-3xl font-bold mb-6" style={{ fontFamily: 'Outfit_700Bold' }}>Categories</Text>

                    <MobileCard className="min-h-[500px]">
                        <View className="flex-row flex-wrap justify-between gap-y-6">
                            {categories.map((cat) => (
                                <View key={cat.id} className="w-[48%] items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <View className="h-12 w-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: cat.color || '#e2e8f0' }}>
                                        {/* Placeholder Icon if no icon field */}
                                        <Text className="text-xl">🏷️</Text>
                                    </View>
                                    <Text className="font-bold text-slate-900 text-center">{cat.name}</Text>
                                    <View className="w-full h-1 bg-slate-200 mt-2 rounded-full overflow-hidden">
                                        <View className="h-full bg-slate-400 w-1/2" />
                                    </View>
                                </View>
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
