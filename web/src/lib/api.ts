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
// Response Interceptor: Handle 401s and Silent Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loop if refresh endpoint itself fails
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh token
                // Use the base URL of the instance
                const baseURL = api.defaults.baseURL || 'http://localhost:8000/api';
                const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });

                // If successful (new access token received)
                if (res.status === 200) {
                    const { access_token } = res.data;
                    localStorage.setItem('token', access_token);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed (token invalid or theft detected) -> Logout
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
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
