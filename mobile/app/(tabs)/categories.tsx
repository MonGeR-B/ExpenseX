import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable, Alert, Modal, TextInput } from "react-native";
import { MobileContainer } from "../../src/components/MobileContainer";
import { MobileCard } from "../../src/components/MobileCard";
import { fetchCategories, deleteCategory, createCategory, Category } from "../../src/lib/api";
import { cache, CACHE_KEYS } from "../../src/lib/cache";
import { useFocusEffect } from "expo-router";
import { Plus, Trash2 } from "lucide-react-native";

export default function CategoriesScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: "", color: "#3b82f6", icon: "💰" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = useCallback(async () => {
        // 1. Load Cache
        const cached = await cache.load<Category[]>(CACHE_KEYS.CATEGORIES);
        if (cached && cached.length > 0) {
            setCategories(cached);
        }

        try {
            const data = await fetchCategories();
            if (Array.isArray(data)) {
                setCategories(data);
                await cache.save(CACHE_KEYS.CATEGORIES, data);
            }
        } catch (error) {
            console.error("Categories: Error", error);
            // Don't fall back to mock data - show empty or cached
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

    const handleDelete = async (id: number, name: string) => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${name}"? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteCategory(id);
                            loadData();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete category");
                        }
                    }
                }
            ]
        );
    };

    const handleCreate = async () => {
        if (!newCategory.name.trim()) {
            Alert.alert("Error", "Please enter a category name");
            return;
        }

        setIsSubmitting(true);
        try {
            await createCategory(newCategory.name.trim(), newCategory.icon, newCategory.color);
            setModalVisible(false);
            setNewCategory({ name: "", color: "#3b82f6", icon: "💰" });
            loadData();
        } catch (error) {
            Alert.alert("Error", "Failed to create category");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MobileContainer>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
            >
                {/* Header */}
                <View className="px-6 py-6 flex-row justify-between items-center" style={{ paddingHorizontal: 24, paddingVertical: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text className="text-white text-3xl font-bold" style={{ color: 'white', fontSize: 30, fontFamily: 'Outfit_700Bold' }}>Categories</Text>
                        <Text className="text-slate-400 text-sm mt-1" style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Manage where your money goes</Text>
                    </View>
                    <Pressable
                        onPress={() => setModalVisible(true)}
                        className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 rounded-2xl flex-row items-center"
                        style={{ backgroundColor: '#8b5cf6', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#8b5cf6', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
                    >
                        <Plus size={18} color="white" />
                        <Text className="text-white font-bold ml-2" style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 14 }}>Add</Text>
                    </Pressable>
                </View>

                {/* Categories Grid */}
                <View className="px-6" style={{ paddingHorizontal: 24 }}>
                    {categories.length === 0 ? (
                        <MobileCard className="p-8 items-center" style={{ padding: 32, alignItems: 'center' }}>
                            <Text className="text-6xl mb-4">📂</Text>
                            <Text className="text-white text-lg font-bold mb-2" style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>No Categories Yet</Text>
                            <Text className="text-slate-400 text-center text-sm" style={{ color: '#94a3b8', textAlign: 'center', fontSize: 14 }}>Create your first category to start organizing expenses</Text>
                        </MobileCard>
                    ) : (
                        <View className="gap-4" style={{ gap: 16 }}>
                            {categories.map((cat) => (
                                <MobileCard key={cat.id} className="p-5 flex-row items-center justify-between rounded-3xl" style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 24 }}>
                                    <View className="flex-row items-center flex-1" style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        {/* Icon with colored background */}
                                        <View
                                            className="h-14 w-14 rounded-2xl items-center justify-center mr-4"
                                            style={{
                                                height: 56,
                                                width: 56,
                                                borderRadius: 16,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 16,
                                                backgroundColor: cat.color || '#3b82f6',
                                                shadowColor: cat.color || '#3b82f6',
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                shadowOffset: { width: 0, height: 2 }
                                            }}
                                        >
                                            <Text className="text-3xl">{cat.icon || "💰"}</Text>
                                        </View>

                                        {/* Name and Color */}
                                        <View className="flex-1" style={{ flex: 1 }}>
                                            <Text className="text-white text-lg font-bold mb-1" style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{cat.name}</Text>
                                            <View className="flex-row items-center gap-2" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <View className="h-3 w-3 rounded-full" style={{ height: 12, width: 12, borderRadius: 6, backgroundColor: cat.color || '#3b82f6' }} />
                                                <Text className="text-slate-400 text-xs font-mono" style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}>{cat.color || '#3b82f6'}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Delete Button */}
                                    <Pressable
                                        onPress={() => handleDelete(cat.id, cat.name)}
                                        className="bg-white/5 p-3 rounded-xl"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12 }}
                                    >
                                        <Trash2 size={20} color="#f87171" />
                                    </Pressable>
                                </MobileCard>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Create Category Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-start pt-12" style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 48 }}>
                    <View className="bg-zinc-900 rounded-b-[2rem] p-6" style={{ backgroundColor: '#18181b', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, padding: 24 }}>
                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center mb-6" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Text className="text-white text-2xl font-bold" style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>New Category</Text>
                            <Pressable onPress={() => setModalVisible(false)} className="p-2" style={{ padding: 8 }}>
                                <Text className="text-slate-400 text-lg" style={{ color: '#94a3b8', fontSize: 18 }}>✕</Text>
                            </Pressable>
                        </View>

                        {/* Name Input */}
                        <View className="mb-4" style={{ marginBottom: 16 }}>
                            <Text className="text-slate-400 text-sm font-bold mb-2 uppercase" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Name</Text>
                            <TextInput
                                value={newCategory.name}
                                onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
                                className="bg-white/10 text-white p-4 rounded-xl text-base"
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                                placeholder="e.g. Groceries"
                                placeholderTextColor="#64748b"
                            />
                        </View>

                        {/* Icon and Color Row */}
                        <View className="flex-row gap-4 mb-6" style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
                            {/* Icon Input */}
                            <View className="flex-1" style={{ flex: 1 }}>
                                <Text className="text-slate-400 text-sm font-bold mb-2 uppercase" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Icon (Emoji)</Text>
                                <TextInput
                                    value={newCategory.icon}
                                    onChangeText={(text) => setNewCategory({ ...newCategory, icon: text.slice(0, 2) })}
                                    className="bg-white/10 text-white p-4 rounded-xl text-center text-2xl"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: 16, borderRadius: 12, textAlign: 'center', fontSize: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                                    maxLength={2}
                                />
                            </View>

                            {/* Color Input */}
                            <View className="flex-1" style={{ flex: 1 }}>
                                <Text className="text-slate-400 text-sm font-bold mb-2 uppercase" style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>Color</Text>
                                <View className="flex-row gap-2 items-center" style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                    <View className="h-12 w-12 rounded-xl" style={{ height: 48, width: 48, borderRadius: 12, backgroundColor: newCategory.color, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                                    <TextInput
                                        value={newCategory.color}
                                        onChangeText={(text) => setNewCategory({ ...newCategory, color: text })}
                                        className="bg-white/10 text-white p-3 rounded-xl flex-1 text-xs font-mono"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: 12, borderRadius: 12, flex: 1, fontSize: 12, fontFamily: 'monospace', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                                        placeholder="#3b82f6"
                                        placeholderTextColor="#64748b"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Create Button */}
                        <Pressable
                            onPress={handleCreate}
                            disabled={isSubmitting}
                            className="bg-emerald-500 p-4 rounded-2xl items-center"
                            style={{
                                backgroundColor: isSubmitting ? '#6b7280' : '#10b981',
                                padding: 16,
                                borderRadius: 16,
                                alignItems: 'center',
                                shadowColor: '#10b981',
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 4 }
                            }}
                        >
                            <Text className="text-white font-bold text-base" style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                                {isSubmitting ? "Creating..." : "Create Category"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </MobileContainer>
    );
}
