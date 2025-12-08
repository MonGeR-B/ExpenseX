// web/components/dashboard/mock-data.ts
export const summary = {
    balance: 4682,
    incomeThisMonth: 2200,
    spentThisMonth: 1430,
    changeVsLastMonth: 8.25, // %
};

export const monthlySpending = [
    { month: "Jan", amount: 1200 },
    { month: "Feb", amount: 980 },
    { month: "Mar", amount: 1340 },
    { month: "Apr", amount: 1100 },
    { month: "May", amount: 1560 },
    { month: "Jun", amount: 1430 },
];

export const categoryBreakdown = [
    { name: "Food & Drinks", value: 450 },
    { name: "Transport", value: 280 },
    { name: "Shopping", value: 320 },
    { name: "Subscriptions", value: 180 },
    { name: "Other", value: 200 },
];

export const recentExpenses = [
    { id: 1, date: "2025-12-05", category: "Food & Drinks", description: "Swiggy", amount: 320 },
    { id: 2, date: "2025-12-04", category: "Transport", description: "Uber to office", amount: 180 },
    { id: 3, date: "2025-12-03", category: "Subscriptions", description: "Spotify + Netflix", amount: 499 },
    { id: 4, date: "2025-12-02", category: "Shopping", description: "Amazon order", amount: 899 },
    { id: 5, date: "2025-12-01", category: "Food & Drinks", description: "Breakfast", amount: 150 },
];
