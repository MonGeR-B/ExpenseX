import axios from "axios";
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.18.17.252:8000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Debug Logging - Errors Only
api.interceptors.request.use(req => req);

api.interceptors.response.use(
    res => res,
    (err: any) => {
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
    category_id: number | null;
    amount: number;
    spent: number;
    percentage: number;
    category?: Category | null;
    month: string;
}

export async function fetchExpenses(timestamp?: number): Promise<Expense[]> {
    const params: any = {};
    if (timestamp) params._t = timestamp;
    const res = await api.get<Expense[]>("/expenses/", { params });
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

export async function deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
}

export async function fetchBudgets(): Promise<Budget[]> {
    const res = await api.get<Budget[]>("/budgets/");
    return res.data;
}

export async function createBudget(payload: {
    amount: number;
    month: string;
    category_id?: number | null;
}): Promise<Budget> {
    const res = await api.post("/budgets/", payload);
    return res.data as Budget;
}

export async function deleteBudget(id: number): Promise<void> {
    await api.delete(`/budgets/${id}`);
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
