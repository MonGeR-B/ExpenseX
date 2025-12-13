import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { setAuthToken } from "../lib/api";

interface AuthContextValue {
    token: string | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                let stored: string | null = null;
                if (Platform.OS === 'web') {
                    stored = localStorage.getItem("expensx_token");
                } else {
                    stored = await SecureStore.getItemAsync("expensx_token");
                }

                if (stored) {
                    setToken(stored);
                    setAuthToken(stored);
                }
            } catch (e) {
                console.error("Failed to load token", e);
            } finally {
                setLoading(false);
            }
        };
        loadToken();
    }, []);

    const login = async (newToken: string) => {
        setToken(newToken);
        setAuthToken(newToken);
        if (Platform.OS === 'web') {
            localStorage.setItem("expensx_token", newToken);
        } else {
            await SecureStore.setItemAsync("expensx_token", newToken);
        }
    };

    const logout = async () => {
        setToken(null);
        setAuthToken(null);
        if (Platform.OS === 'web') {
            localStorage.removeItem("expensx_token");
        } else {
            await SecureStore.deleteItemAsync("expensx_token");
        }
    };

    return (
        <AuthContext.Provider value={{ token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
