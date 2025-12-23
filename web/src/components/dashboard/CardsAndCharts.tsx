"use client";

import { useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {
    getSummaryStats,
    getMonthlyStats,
    getCategoryStats,
    getDailyStats,
} from "@/lib/api";
import type {
    SummaryStats,
    MonthlyStats,
    CategoryStats,
    DailyStats,
} from "@/lib/types";

import { useExpenseStore } from "@/store/expenses";
import { Bar, BarChart } from "recharts";
import { Button } from "@/components/ui/button";

const categoryColors = ["#10b981", "#3b82f6", "#8b5cf6", "#f43f5e", "#f59e0b", "#ec4899", "#14b8a6"];

type ViewMode = "monthly" | "daily";

export function CardsAndCharts() {
    const lastUpdated = useExpenseStore((state) => state.lastUpdated);
    const [summary, setSummary] = useState<SummaryStats | null>(null);
    const [monthly, setMonthly] = useState<MonthlyStats | null>(null);
    const [daily, setDaily] = useState<DailyStats | null>(null);
    const [categories, setCategories] = useState<CategoryStats | null>(null);
    const [loading, setLoading] = useState(true);

    // View Selector Logic
    const [view, setView] = useState<ViewMode>("monthly");

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const ts = Date.now();
                const [s, m, c, d] = await Promise.all([
                    getSummaryStats(undefined, undefined, ts),
                    getMonthlyStats(undefined, ts),
                    getCategoryStats(undefined, undefined, ts),
                    getDailyStats(undefined, undefined, ts),
                ]);

                if (!mounted) return;
                setSummary(s);
                setMonthly(m);
                setCategories(c);
                setDaily(d);

                // Auto-switch logic: If < 2 months of history, show daily
                const monthsWithData = m.points.filter(p => p.total_amount > 0).length;
                if (monthsWithData < 2) {
                    setView("daily");
                }
            } catch (err) {
                console.error("Failed to load stats", err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [lastUpdated]);

    const monthlyChartData =
        monthly?.points.map((p) => ({
            name: monthLabel(p.month),
            amount: p.total_amount,
        })) ?? [];

    const dailyChartData =
        daily?.points.map((p) => ({
            name: p.day.toString(),
            amount: p.total_amount
        })) ?? [];

    const categoryChartData =
        categories?.categories.map((c) => ({
            name: c.category_name ?? "Uncategorized",
            value: c.total_amount,
        })) ?? [];

    const totalCategories = categoryChartData.reduce(
        (acc, item) => acc + item.value,
        0
    );

    if (loading && !summary) {
        return <div className="text-sm text-slate-400 animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Top cards - "Designer's Toolkit" Pinned Style */}
            <div className="grid gap-8 md:grid-cols-3 pt-6">
                {/* Card 01: Total Spent (Blue/Freepik Theme) */}
                <div className="relative group">
                    {/* The Pin */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <div className="h-6 w-6 rounded-full bg-blue-600 shadow-[2px_4px_6px_rgba(0,0,0,0.3)] bg-gradient-to-br from-blue-400 to-blue-700 ring-1 ring-black/10"></div>
                    </div>
                    {/* The Card */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-blue-50 border-2 border-blue-200 p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-4xl font-black text-blue-900/20 font-sans">01</span>
                            <div className="h-12 w-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
                                💰
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 mb-1">Total Spent</h3>
                            <div className="text-4xl font-black text-slate-900 tracking-tight my-2">
                                ₹{(summary?.total_spent ?? 0).toLocaleString()}
                            </div>
                            <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                                You've spent <span className="text-blue-600 font-bold">+12%</span> more than last month. Keep an eye on it!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 02: Transactions (Pink/Pinterest Theme) */}
                <div className="relative group mt-8 md:mt-0">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <div className="h-6 w-6 rounded-full bg-pink-600 shadow-[2px_4px_6px_rgba(0,0,0,0.3)] bg-gradient-to-br from-pink-400 to-pink-700 ring-1 ring-black/10"></div>
                    </div>
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-pink-50 border-2 border-pink-200 p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-4xl font-black text-pink-900/20 font-sans">02</span>
                            <div className="h-12 w-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-xl shadow-lg shadow-pink-500/20">
                                🧾
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 mb-1">Transactions</h3>
                            <div className="text-4xl font-black text-slate-900 tracking-tight my-2">
                                {summary?.transactions_count ?? 0}
                            </div>
                            <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                                Total active transactions processed this month across all categories.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 03: Top Category (Green/Envato Theme) */}
                <div className="relative group">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <div className="h-6 w-6 rounded-full bg-emerald-600 shadow-[2px_4px_6px_rgba(0,0,0,0.3)] bg-gradient-to-br from-emerald-400 to-emerald-700 ring-1 ring-black/10"></div>
                    </div>
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-emerald-50 border-2 border-emerald-200 p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-4xl font-black text-emerald-900/20 font-sans">03</span>
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
                                🏆
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 mb-1">Top Category</h3>
                            <div className="text-3xl font-black text-slate-900 tracking-tight my-2 truncate">
                                {summary?.top_category ?? "—"}
                            </div>
                            <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                                Most spent on <span className="text-emerald-600 font-bold">{summary?.top_category ?? "nothing"}</span> with <span className="text-emerald-700 font-bold">₹{(summary?.top_category_amount ?? 0).toLocaleString()}</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts row */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Spending chart - White Card */}
                <div className="md:col-span-2 rounded-[2rem] bg-white border border-slate-100 p-8 shadow-sm">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
                            <p className="text-sm text-slate-400 font-medium">Spending trends</p>
                        </div>
                        <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 px-4 text-xs font-bold rounded-lg transition-all ${view === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setView("daily")}
                            >
                                Daily
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 px-4 text-xs font-bold rounded-lg transition-all ${view === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setView("monthly")}
                            >
                                Monthly
                            </Button>
                        </div>
                    </div>
                    <div className="h-80">
                        {(view === "monthly" ? monthlyChartData : dailyChartData).length === 0 ? (
                            <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                Not enough data yet 📉
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                {view === "monthly" ? (
                                    <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} fontWeight={500} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} fontWeight={500} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "16px",
                                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                                color: "#1e293b",
                                                padding: "12px 16px"
                                            }}
                                            itemStyle={{ color: "#7c3aed", fontWeight: "bold" }}
                                            formatter={(value: any) => [`₹${value}`, "Spent"]}
                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={4} fill="url(#spend)" />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={dailyChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} fontWeight={500} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} fontWeight={500} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc', radius: 8 }}
                                            contentStyle={{
                                                backgroundColor: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "16px",
                                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                                color: "#1e293b"
                                            }}
                                            formatter={(value: any) => [`₹${value}`, "Spent"]}
                                        />
                                        <Bar dataKey="amount" fill="#8b5cf6" radius={[6, 6, 6, 6]} barSize={32} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Category breakdown - White Card */}
                <div className="rounded-[2rem] bg-white border border-slate-100 p-8 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Distribution</h2>
                        <p className="text-sm text-slate-400 font-medium">Where it goes</p>
                    </div>
                    <div className="flex-1 relative min-h-[220px]">
                        {categoryChartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                No stats available 📊
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryChartData}
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        cornerRadius={6}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${entry.name}-${index}`}
                                                fill={categoryColors[index % categoryColors.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                            color: "#1e293b"
                                        }}
                                        formatter={(value: any, name: any) => [
                                            `₹${value}`,
                                            String(name),
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        {/* Center Text */}
                        {categoryChartData.length > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
                                <span className="text-2xl font-black text-slate-900">
                                    ₹{Math.round(totalCategories / 1000)}k
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 space-y-3">
                        {categoryChartData.slice(0, 4).map((entry, index) => (
                            <div key={index} className="flex items-center justify-between text-sm group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-3 w-3 rounded-full shadow-sm"
                                        style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                                    />
                                    <span className="font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{entry.name}</span>
                                </div>
                                <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md">₹{entry.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function monthLabel(m: number): string {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1] ?? String(m);
}
