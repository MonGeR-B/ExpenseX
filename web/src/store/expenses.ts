import { create } from 'zustand';
import api from '@/lib/api';

export interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string; // ISO date string
    category_id: number | null;
    // backend might return category object if joined, but let's stick to basic for now
}

interface ExpenseState {
    expenses: Expense[];
    isLoading: boolean;
    error: string | null;

    fetchExpenses: () => Promise<void>;
    addExpense: (data: { amount: number; description: string; date: string }) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
    expenses: [],
    isLoading: false,
    error: null,

    fetchExpenses: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/expenses/?limit=10'); // Get recent 10 by default
            set({ expenses: response.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Failed to fetch expenses',
                isLoading: false
            });
        }
    },

    addExpense: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/expenses/', data);
            // Refresh list after add
            await get().fetchExpenses();
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Failed to create expense',
                isLoading: false
            });
            throw error;
        }
    }
}));
