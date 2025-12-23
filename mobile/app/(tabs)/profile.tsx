import React from "react";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { MobileContainer } from "../../src/components/MobileContainer";
import { MobileCard } from "../../src/components/MobileCard";
import { Settings, Download, Upload, Trash2, ChevronRight, Grid, Star, Bell } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <MobileContainer>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="px-6 py-6" style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
                    <Text className="text-white text-3xl font-bold" style={{ color: 'white', fontSize: 30, fontFamily: 'Outfit_700Bold' }}>Settings</Text>
                </View>

                {/* Main Content */}
                <View className="px-6" style={{ paddingHorizontal: 24 }}>

                    {/* Pro Banner - Darker, Premium Look */}
                    <MobileCard className="p-0 overflow-hidden mb-6 border-0 rounded-3xl" style={{ padding: 0, overflow: 'hidden', marginBottom: 24, borderWidth: 0, borderRadius: 24 }}>
                        <LinearGradient
                            colors={['#4338ca', '#3b82f6']} // Indigo to Blue
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ padding: 24 }}
                        >
                            <View className="flex-row justify-between items-center" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text className="text-white text-xl font-bold mb-1" style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>Pro Plan</Text>
                                    <Text className="text-blue-100 text-sm" style={{ color: '#dbeafe', fontSize: 14 }}>Unlock advanced AI insights</Text>
                                </View>
                                <View className="h-10 w-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md" style={{ height: 40, width: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    <Star size={20} color="white" fill="white" />
                                </View>
                            </View>
                            <Pressable className="mt-6 bg-white py-3 rounded-full items-center" style={{ marginTop: 24, backgroundColor: 'white', paddingVertical: 12, borderRadius: 999, alignItems: 'center' }}>
                                <Text className="text-indigo-600 font-bold" style={{ color: '#4f46e5', fontWeight: 'bold' }}>Upgrade Now</Text>
                            </Pressable>
                        </LinearGradient>
                    </MobileCard>

                    {/* Settings Groups */}
                    <MobileCard className="p-5 mb-6 rounded-3xl" style={{ padding: 20, marginBottom: 24, borderRadius: 24 }}>
                        <Text className="text-white font-bold text-lg mb-4" style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>General</Text>

                        {/* Categories */}
                        <Pressable onPress={() => router.push("/categories")} className="flex-row items-center py-3 border-b border-slate-50 mb-2" style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc', marginBottom: 8 }}>
                            <View className="h-10 w-10 bg-orange-100 rounded-full items-center justify-center mr-4" style={{ height: 40, width: 40, backgroundColor: '#ffedd5', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                <Grid size={20} color="#ea580c" />
                            </View>
                            <Text className="text-white font-medium flex-1 text-base" style={{ color: 'white', fontWeight: '500', flex: 1, fontSize: 16 }}>Categories</Text>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </Pressable>

                        {/* Notifications (Mock) */}
                        <View className="flex-row items-center py-3" style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                            <View className="h-10 w-10 bg-blue-100 rounded-full items-center justify-center mr-4" style={{ height: 40, width: 40, backgroundColor: '#dbeafe', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                <Bell size={20} color="#2563eb" />
                            </View>
                            <Text className="text-white font-medium flex-1 text-base" style={{ color: 'white', fontWeight: '500', flex: 1, fontSize: 16 }}>Push Notifications</Text>
                            <Switch value={true} trackColor={{ false: "#e2e8f0", true: "#3b82f6" }} thumbColor="white" />
                        </View>
                    </MobileCard>

                    <MobileCard className="p-5 mb-6 rounded-3xl" style={{ padding: 20, marginBottom: 24, borderRadius: 24 }}>
                        <Text className="text-white font-bold text-lg mb-4" style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Data</Text>
                        <View className="flex-row gap-4" style={{ flexDirection: 'row', gap: 16 }}>
                            <Pressable className="flex-1 bg-slate-50 py-4 rounded-2xl items-center border border-slate-100" style={{ flex: 1, backgroundColor: '#f8fafc', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' }}>
                                <Download size={24} color="#64748b" style={{ marginBottom: 8 }} />
                                <Text className="text-slate-600 font-bold text-sm" style={{ color: 'black', fontWeight: 'bold', fontSize: 14 }}>Export CSV</Text>
                            </Pressable>
                            <Pressable className="flex-1 bg-slate-50 py-4 rounded-2xl items-center border border-slate-100" style={{ flex: 1, backgroundColor: '#f8fafc', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' }}>
                                <Upload size={24} color="#64748b" style={{ marginBottom: 8 }} />
                                <Text className="text-slate-600 font-bold text-sm" style={{ color: 'black', fontWeight: 'bold', fontSize: 14 }}>Import Data</Text>
                            </Pressable>
                        </View>
                    </MobileCard>

                    <MobileCard className="p-0 overflow-hidden bg-red-50 border-red-100 rounded-3xl" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#fef2f2', borderColor: '#fee2e2', borderRadius: 24 }}>
                        <Pressable onPress={handleLogout} className="p-6 flex-row items-center justify-center gap-2" style={{ padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Trash2 size={20} color="#dc2626" />
                            <Text className="text-red-600 font-bold text-lg" style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 18 }}>Log Out</Text>
                        </Pressable>
                    </MobileCard>

                    <Text className="text-slate-600 text-center mt-6 mb-2" style={{ color: '#475569', textAlign: 'center', marginTop: 24, marginBottom: 8 }}>ExpenseX v1.0.0</Text>

                </View>
            </ScrollView>
        </MobileContainer>
    );
}
