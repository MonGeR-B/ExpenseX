import { Tabs, useRouter } from "expo-router";
import { View, Platform } from "react-native";
import { Home, List, PieChart, User, Plus, Wallet, Grid } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function TabLayout() {
    const router = useRouter();
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 90 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: "#2563eb", // Blue-600
                tabBarInactiveTintColor: "#94a3b8", // Slate-400
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 9, // Smaller font for 6 items
                    fontFamily: 'Outfit_700Bold',
                    marginTop: -5,
                    marginBottom: 5
                }
            }}
        >
            <Tabs.Screen
                name="overview"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <Home size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: "History",
                    tabBarIcon: ({ color }) => <List size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="analysis"
                options={{
                    title: "Reports",
                    tabBarIcon: ({ color }) => <PieChart size={22} color={color} />,
                }}
            />

            {/* Custom FAB */}
            <Tabs.Screen
                name="add"
                options={{
                    title: "",
                    tabBarIcon: () => (
                        <View style={{
                            top: -24,
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            shadowColor: "#8b5cf6",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5,
                        }}>
                            <LinearGradient
                                colors={['#8B5CF6', '#C084FC']}
                                style={{ flex: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Plus size={28} color="white" />
                            </LinearGradient>
                        </View>
                    ),
                    tabBarButton: (props) => (
                        <View {...(props as any)} style={[{ flex: 1, alignItems: 'center' }, props.style]} />
                    )
                }}
                listeners={() => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        router.push("/add-expense");
                    },
                })}
            />

            <Tabs.Screen
                name="budgets"
                options={{
                    title: "Budgets",
                    tabBarIcon: ({ color }) => <Wallet size={22} color={color} />,
                }}
            />

            <Tabs.Screen
                name="categories"
                options={{
                    title: "Categories",
                    tabBarIcon: ({ color }) => <Grid size={22} color={color} />,
                }}
            />

            {/* Hidden Profile Tab - Now Accessed via Header */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Settings",
                    href: null, // Fully hide from tab bar
                }}
            />
        </Tabs>
    );
}
