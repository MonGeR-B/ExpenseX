import { create } from 'zustand';
import api from '@/lib/api';

// Types mirror the backend Pydantic schemas
interface SummaryStats {
    period: string;
    year: number;
    month: number | null;
    total_spent: number;
    avg_per_day: number;
    transactions_count: number;
    top_category: string | null;
    top_category_amount: number | null;
}

interface MonthlyPoint {
    month: number;
    total_amount: number;
}

interface MonthlyStats {
    year: number;
    points: MonthlyPoint[];
}

interface CategoryPoint {
    category_id: number | null;
    category_name: string | null;
    total_amount: number;
}

interface CategoryStats {
    year: number;
    month: number | null;
    categories: CategoryPoint[];
}

interface StatsState {
    summary: SummaryStats | null;
    monthly: MonthlyStats | null;
    categories: CategoryStats | null;
    isLoading: boolean;
    error: string | null;

    fetchAllStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
    summary: null,
    monthly: null,
    categories: null,
    isLoading: false,
    error: null,

    fetchAllStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const [summaryRes, monthlyRes, categoryRes] = await Promise.all([
                api.get('/stats/summary'),
                api.get('/stats/monthly'),
                api.get('/stats/categories')
            ]);

            set({
                summary: summaryRes.data,
                monthly: monthlyRes.data,
                categories: categoryRes.data,
                isLoading: false
            });
        } catch (error: any) {
            console.error("Stats fetch failed:", error);
            set({
                error: error.message || 'Failed to fetch stats',
                isLoading: false
            });
        }
    }
}));
