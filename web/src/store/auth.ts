import { create } from 'zustand';
import api from '@/lib/api';

interface User {
    id: number;
    email: string;
    username?: string;
    // Add other user fields as needed based on backend response
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    register: (email: string, password: string, username?: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    updateProfile: (username: string) => Promise<void>;
    initialize: () => Promise<void>; // To restore session on load
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isAuthenticated: false, // Will be set to true if token exists and valid
    isLoading: false,
    error: null,

    login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects 'username'
            formData.append('password', password);

            // Append remember_me as query param
            const response = await api.post(`/auth/login?remember_me=${rememberMe}`, formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token } = response.data;
            localStorage.setItem('token', access_token);

            set({ token: access_token, isAuthenticated: true });
            await get().fetchUser(); // Fetch user details after login
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            const errorMessage = typeof detail === 'string' ? detail :
                (Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : JSON.stringify(detail || 'Login failed'));

            set({
                error: errorMessage,
                isLoading: false
            });
            throw error;
        }
    },

    register: async (email, password, username) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/auth/register', { email, password, username });
            // Automatically login after register? Or redirect to login?
            // For now, let's just complete successfully
            set({ isLoading: false });
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            const errorMessage = typeof detail === 'string' ? detail :
                (Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : JSON.stringify(detail || 'Registration failed'));

            set({
                error: errorMessage,
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

    updateProfile: async (username: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put('/auth/profile', { username });
            set({ user: response.data, isLoading: false });
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            const errorMessage = typeof detail === 'string' ? detail :
                (Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : JSON.stringify(detail || 'Profile update failed'));

            set({
                error: errorMessage,
                isLoading: false
            });
            throw error;
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
