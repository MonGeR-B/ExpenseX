import { create } from 'zustand';
import api from '@/lib/api';
import { Expense } from '@/lib/types';

interface ExpenseFilters {
    from_date?: string;
    to_date?: string;
    min_amount?: number;
    max_amount?: number;
    category_id?: number;
}

interface ExpenseState {
    expenses: Expense[];
    isLoading: boolean;
    error: string | null;
    filters: ExpenseFilters;

    // Pagination
    page: number;
    hasMore: boolean;

    // State for triggering refreshes in other components (e.g. stats)
    lastUpdated: number;

    setFilters: (filters: Partial<ExpenseFilters>) => void;
    fetchExpenses: (reset?: boolean) => Promise<void>;
    addExpense: (data: any) => Promise<void>;
    updateExpense: (id: number, data: any) => Promise<void>;
    deleteExpense: (id: number) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
    expenses: [],
    isLoading: false,
    error: null,
    filters: {},
    page: 0,
    hasMore: true,
    lastUpdated: Date.now(),

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            page: 0, // Reset page on filter change
            hasMore: true
        }));
        get().fetchExpenses(true);
    },

    fetchExpenses: async (reset = false) => {
        const { page, filters, expenses, hasMore } = get();
        if (!hasMore && !reset) return;

        set({ isLoading: true, error: null });
        try {
            const limit = 20;
            const skip = reset ? 0 : page * limit;

            // Build query params
            const params = new URLSearchParams({
                skip: skip.toString(),
                limit: limit.toString(),
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
                        .map(([k, v]) => [k, v.toString()])
                )
            });

            const response = await api.get(`/expenses/?${params.toString()}`);
            const newExpenses = response.data;

            set({
                expenses: reset ? newExpenses : [...expenses, ...newExpenses],
                page: reset ? 1 : page + 1,
                hasMore: newExpenses.length === limit,
                isLoading: false
            });
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
            await get().fetchExpenses(true); // Refresh
            set({ lastUpdated: Date.now() }); // Signal stats refresh
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Failed to create expense',
                isLoading: false
            });
            throw error;
        }
    },

    updateExpense: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await api.put(`/expenses/${id}`, data);
            await get().fetchExpenses(true);
            set({ lastUpdated: Date.now() }); // Signal stats refresh
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Failed to update expense',
                isLoading: false
            });
            throw error;
        }
    },

    deleteExpense: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/expenses/${id}`);
            // Optimistic update
            set((state) => ({
                expenses: state.expenses.filter((e) => e.id !== id),
                isLoading: false
            }));
            set({ lastUpdated: Date.now() }); // Signal stats refresh
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Failed to delete expense',
                isLoading: false
            });
            throw error;
        }
    }
}));
