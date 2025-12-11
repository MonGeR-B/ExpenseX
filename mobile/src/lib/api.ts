import axios from "axios";

// change to your LAN IP when testing on device
export const API_BASE_URL = "http://192.168.1.4:8000/api";

export const api = axios.create({
    baseURL: API_BASE_URL,
});

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
}

export async function fetchExpenses(): Promise<Expense[]> {
    const res = await api.get<Expense[]>("/expenses");
    return res.data;
}

export async function createExpense(payload: {
    date: string;
    amount: number;
    description?: string;
    category_id?: number | null;
}) {
    const res = await api.post("/expenses", payload);
    return res.data as Expense;
}
