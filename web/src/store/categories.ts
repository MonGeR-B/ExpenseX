import { create } from 'zustand';
import api from '@/lib/api';
import { Category } from '@/lib/types';

interface CategoriesState {
    categories: Category[];
    isLoading: boolean;
    error: string | null;

    fetchCategories: () => Promise<void>;
    addCategory: (name: string, color: string, icon: string) => Promise<void>;
    updateCategory: (id: number, name: string, color: string, icon: string) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;
    seedDefaults: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
    categories: [],
    isLoading: false,
    error: null,

    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/categories/');
            set({ categories: res.data });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch categories' });
        } finally {
            set({ isLoading: false });
        }
    },

    addCategory: async (name, color, icon) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/categories/', { name, color, icon });
            set((state) => ({ categories: [...state.categories, res.data] }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to add category' });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteCategory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/categories/${id}`);
            set((state) => ({
                categories: state.categories.filter((c) => c.id !== id),
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to delete category' });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    updateCategory: async (id, name, color, icon) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.put(`/categories/${id}`, { name, color, icon });
            set((state) => ({
                categories: state.categories.map((c) => (c.id === id ? res.data : c)),
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to update category' });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    seedDefaults: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/categories/seed');
            set({ categories: res.data });
        } catch (err: any) {
            set({ error: err.message || 'Failed to seed categories' });
        } finally {
            set({ isLoading: false });
        }
    }
}));
