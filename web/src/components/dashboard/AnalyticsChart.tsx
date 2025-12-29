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
    Bar,
    BarChart,
} from "recharts";
import {
    getMonthlyStats,
    getDailyStats,
} from "@/lib/api";
import type {
    MonthlyStats,
    DailyStats,
} from "@/lib/types";

import { useExpenseStore } from "@/store/expenses";
import { Button } from "@/components/ui/button";

type ViewMode = "monthly" | "weekly";

function monthLabel(m: number): string {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1] ?? String(m);
}

export function AnalyticsChart() {
    const lastUpdated = useExpenseStore((state) => state.lastUpdated);
    const [monthly, setMonthly] = useState<MonthlyStats | null>(null);
    const [daily, setDaily] = useState<DailyStats | null>(null);
    const [loading, setLoading] = useState(true);

    // View Selector Logic
    const [view, setView] = useState<ViewMode>("weekly");

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const ts = Date.now();
                const [m, d] = await Promise.all([
                    getMonthlyStats(undefined, ts),
                    // We still fetch daily stats, but we'll aggregate them into weeks
                    getDailyStats(undefined, undefined, ts),
                ]);

                if (!mounted) return;
                setMonthly(m);
                setDaily(d);

                // Auto-switch logic: If < 2 months of history, show weekly
                const monthsWithData = m.points.filter(p => p.total_amount > 0).length;
                if (monthsWithData < 2) {
                    setView("weekly");
                }
            } catch (err) {
                console.error("Failed to load analytics stats", err);
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

    const weeklyChartData = (() => {
        if (!daily?.points) return [];

        // Show last 7 days based on today's date
        // Note: This simple implementation only looks at the current month's data.
        // Handling cross-month (e.g., 1st of month) would require fetching previous month data.
        const today = new Date();
        const currentDay = today.getDate();

        // Generate last 7 days numbers (e.g. [23, 24, 25, 26, 27, 28, 29])
        const last7Days = Array.from({ length: 7 }, (_, i) => currentDay - 6 + i);

        return last7Days
            .filter(day => day > 0) // Ensure we don't show negative days if start of month
            .map(day => {
                const point = daily.points.find(p => p.day === day);
                return {
                    name: String(day),
                    amount: point ? point.total_amount : 0
                };
            });
    })();

    return (
        <div className="rounded-xl sm:rounded-[1.5rem] md:rounded-[2rem] bg-white border border-slate-100 p-3 sm:p-4 shadow-sm h-full flex flex-col">
            <div className="mb-2 sm:mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Analytics</h2>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Spending trends</p>
                </div>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 px-3 text-[10px] font-bold rounded-lg transition-all ${view === 'weekly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setView("weekly")}
                    >
                        Weekly
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 px-3 text-[10px] font-bold rounded-lg transition-all ${view === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setView("monthly")}
                    >
                        Monthly
                    </Button>
                </div>
            </div>
            <div className="flex-1 min-h-[220px] sm:min-h-[240px] md:min-h-[260px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400 animate-pulse">Loading chart...</div>
                ) : (view === "monthly" ? monthlyChartData : weeklyChartData).every(d => d.amount === 0) ? (
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
                            <BarChart data={weeklyChartData}>
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
                                    labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Bar dataKey="amount" fill="#8b5cf6" radius={[6, 6, 6, 6]} barSize={48} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
