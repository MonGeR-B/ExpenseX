export interface User {
    id: number;
    email: string;
}

export interface Category {
    id: number;
    name: string;
    color: string; // Hex
    icon: string; // Emoji
    user_id: number;
}

export interface Expense {
    id: number;
    date: string; // YYYY-MM-DD
    amount: number;
    description?: string;
    category_id?: number | null;
    category?: Category | null;
}


export interface MonthlyTotal {
    month: string; // YYYY-MM
    total: number;
}

export interface SummaryStats {
    total_spent: number;
    avg_per_day: number;
    transactions_count: number;
    top_category: string | null;
    top_category_amount: number;
}

export interface MonthlyPoint {
    month: number;
    total_amount: number;
    transaction_count: number;
}

export interface MonthlyStats {
    current_month_total: number;
    points: MonthlyPoint[];
}

export interface CategoryPoint {
    category_id: number | null;
    category_name: string | null;
    total_amount: number;
    percentage: number;
}

export interface CategoryStats {
    categories: CategoryPoint[];
}

export interface DailyPoint {
    day: number;
    date: string;
    total_amount: number;
}

export interface DailyStats {
    year: number;
    month: number;
    points: DailyPoint[];
}
