import axios from "axios";
import { Platform } from "react-native";

// Use localhost for Web/iOS Simulator, 10.0.2.2 for Android Emulator
// Or your specific LAN IP if testing on physical device
export const API_BASE_URL = Platform.OS === 'web'
    ? "http://localhost:8000/api"
    : Platform.OS === 'android'
        ? "http://10.0.2.2:8000/api"  // Android Emulator
        : "http://192.168.1.4:8000/api"; // Your Physical Device (Wi-Fi IP)

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Debug Logging
// Debug Logging
api.interceptors.request.use(req => {
    console.log(`[API Request] ${req.method?.toUpperCase()} ${req.url} [Base: ${req.baseURL}]`); // Log Base URL
    return req;
});

api.interceptors.response.use(
    res => {
        console.log(`[API Response] ${res.status} ${res.config.url}`, res.data);
        return res;
    },
    err => {
        if (err.response) {
            // Server responded with a status code out of 2xx range
            console.error(`[API Error] ${err.response.status} ${err.config.url}`, JSON.stringify(err.response.data, null, 2));
        } else if (err.request) {
            // Request was made but no response received
            console.error(`[API Error] No Response from ${err.config.url}`, err.request);
        } else {
            // Something happened in setting up the request
            console.error(`[API Error] Setup Error`, err.message);
        }
        return Promise.reject(err);
    }
);

export function setAuthToken(token: string | null) {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
}

export async function loginApi(email: string, password: string) {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);
    const res = await api.post("/auth/login", body.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    // FastAPI returns { access_token, token_type }
    return res.data as { access_token: string; token_type: string };
}

export async function registerApi(email: string, password: string) {
    const res = await api.post("/auth/register", { email, password });
    return res.data;
}

export interface Expense {
    id: number;
    date: string;
    amount: number;
    category_id?: number | null;
    description?: string | null;
    created_at: string;
    category?: Category;
}

export interface Category {
    id: number;
    name: string;
    color?: string;
    icon?: string;
}

export interface Budget {
    id: number;
    amount: number;
    spent: number;
    percentage: number;
    category?: Category;
    month: string;
}

export async function fetchExpenses(): Promise<Expense[]> {
    const res = await api.get<Expense[]>("/expenses/");
    return res.data;
}

export async function createExpense(payload: {
    date: string;
    amount: number;
    description?: string;
    category_id?: number | null;
}) {
    const res = await api.post("/expenses/", payload);
    return res.data as Expense;
}

export async function fetchSummaryStats(year?: number, month?: number, timestamp?: number) {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (timestamp) params._t = timestamp;
    const res = await api.get("/stats/summary", { params });
    return res.data;
}

export async function fetchCategories(): Promise<Category[]> {
    const res = await api.get<Category[]>("/categories/");
    return res.data;
}

export async function createCategory(name: string, icon: string = "🏷️", color: string = "#94a3b8"): Promise<Category> {
    const res = await api.post("/categories/", { name, icon, color });
    return res.data as Category;
}

export async function deleteCategory(id: number): Promise<boolean> {
    try {
        await api.delete(`/categories/${id}`);
        return true;
    } catch {
        return false;
    }
}

export async function fetchBudgets(): Promise<Budget[]> {
    const res = await api.get<Budget[]>("/budgets/");
    return res.data;
}

export async function fetchDailyStats(year?: number, month?: number, timestamp?: number) {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (timestamp) params._t = timestamp;
    const res = await api.get("/stats/daily", { params });
    return res.data;
}

export async function fetchMonthlyStats(year?: number, timestamp?: number) {
    const params: any = {};
    if (year) params.year = year;
    if (timestamp) params._t = timestamp;
    const res = await api.get("/stats/monthly", { params });
    return res.data;
}

export async function fetchCategoryStats(year?: number, month?: number, timestamp?: number) {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (timestamp) params._t = timestamp;
    const res = await api.get("/stats/categories", { params });
    return res.data;
}
