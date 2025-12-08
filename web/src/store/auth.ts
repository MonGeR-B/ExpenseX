import { create } from 'zustand';
import api from '@/lib/api';

interface User {
    id: number;
    email: string;
    // Add other user fields as needed based on backend response
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    initialize: () => Promise<void>; // To restore session on load
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isAuthenticated: false, // Will be set to true if token exists and valid
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects 'username'
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token } = response.data;
            localStorage.setItem('token', access_token);

            set({ token: access_token, isAuthenticated: true });
            await get().fetchUser(); // Fetch user details after login
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Login failed',
                isLoading: false
            });
            throw error;
        }
    },

    register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/auth/register', { email, password });
            // Automatically login after register? Or redirect to login?
            // For now, let's just complete successfully
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Registration failed',
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    fetchUser: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/auth/me');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            // If fetch user fails (e.g. invalid token), logout
            get().logout();
            set({ isLoading: false });
        }
    },

    initialize: async () => {
        const token = localStorage.getItem('token');
        if (token) {
            set({ token, isAuthenticated: true });
            await get().fetchUser();
        }
    }
}));
