import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
                const stored = await AsyncStorage.getItem("expensx_token");
                if (stored) {
                    setToken(stored);
                    setAuthToken(stored);
                }
            } finally {
                setLoading(false);
            }
        };
        loadToken();
    }, []);

    const login = async (newToken: string) => {
        setToken(newToken);
        setAuthToken(newToken);
        await AsyncStorage.setItem("expensx_token", newToken);
    };

    const logout = async () => {
        setToken(null);
        setAuthToken(null);
        await AsyncStorage.removeItem("expensx_token");
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
