import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        // Check if running in the browser
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login if unauthorized
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);


import type {
    SummaryStats,
    MonthlyStats,
    CategoryStats,
    DailyStats,
} from "./types";

export async function getSummaryStats(
    year?: number,
    month?: number,
    timestamp?: number
): Promise<SummaryStats> {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (timestamp) params._t = timestamp;
    const res = await api.get<SummaryStats>("/stats/summary", { params });
    return res.data;
}

export async function getMonthlyStats(year?: number, timestamp?: number): Promise<MonthlyStats> {
    const params: any = {};
    if (year) params.year = year;
    if (timestamp) params._t = timestamp;
    const res = await api.get<MonthlyStats>("/stats/monthly", { params });
    return res.data;
}

export async function getCategoryStats(
    year?: number,
    month?: number,
    timestamp?: number
): Promise<CategoryStats> {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (timestamp) params._t = timestamp;
    const res = await api.get<CategoryStats>("/stats/categories", { params });
    return res.data;
}


export async function getDailyStats(
    year?: number,
    month?: number,
    timestamp?: number
): Promise<DailyStats> {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (timestamp) params._t = timestamp;
    const res = await api.get<DailyStats>("/stats/daily", { params });
    return res.data;
}

export default api;
