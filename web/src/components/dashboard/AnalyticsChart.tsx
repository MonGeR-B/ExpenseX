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
    const [monthlyData, setMonthlyData] = useState<{ name: string; amount: number }[]>([]);
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

                // 1. Calculate Rolling 5 Months
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth() + 1; // 1-12

                // Determine years to fetch (if current month is Jan-Apr, we need previous year too)
                const yearsToFetch = currentMonth < 5 ? [currentYear - 1, currentYear] : [currentYear];

                // 2. Fetch Data
                const [dailyStats, ...monthlyResponses] = await Promise.all([
                    getDailyStats(undefined, undefined, ts), // Always fetch daily
                    ...yearsToFetch.map(y => getMonthlyStats(y, ts))
                ]);

                if (!mounted) return;
                setDaily(dailyStats);

                // 3. Process Monthly Data (Last 5 Months)
                // Flatten all fetched monthly points with their year
                const allMonthlyPoints: { month: number; year: number; total_amount: number }[] = [];
                monthlyResponses.forEach((res, index) => {
                    const year = yearsToFetch[index];
                    res.points.forEach(p => allMonthlyPoints.push({ ...p, year }));
                });

                // Generate last 5 months based on today
                const last5MonthsToCheck = [];
                for (let i = 4; i >= 0; i--) {
                    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    last5MonthsToCheck.push({ month: d.getMonth() + 1, year: d.getFullYear() });
                }

                // Map to chart data
                const processedMonthlyData = last5MonthsToCheck.map(m => {
                    const found = allMonthlyPoints.find(p => p.month === m.month && p.year === m.year);
                    return {
                        name: monthLabel(m.month),
                        amount: found ? found.total_amount : 0
                    };
                });

                setMonthlyData(processedMonthlyData);

                // Auto-switch logic: If < 2 months of history in the valid range, maybe default to weekly? 
                // But user wants to SEE the graph. So we keep it.
                // We'll trust the user selection or default to weekly if it's the very first load ever.
                // Actually, let's just default to "weekly" initially (state default) and let user switch.

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

    const weeklyChartData = (() => {
        if (!daily?.points) return [];
        const today = new Date();
        const currentDay = today.getDate();
        const last7Days = Array.from({ length: 7 }, (_, i) => currentDay - 6 + i);
        return last7Days
            .filter(day => day > 0)
            .map(day => {
                const point = daily.points.find(p => p.day === day);
                return {
                    name: String(day),
                    amount: point ? point.total_amount : 0
                };
            });
    })();

    return (
        <div className="rounded-[2rem] bg-white/[0.03] backdrop-blur-[24px] border-t border-l border-t-white/15 border-l-white/15 border-b border-r border-b-black/20 border-r-black/20 p-8 shadow-sm flex flex-col">
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                    <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">Analytics</h2>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mt-1">Spending trends</p>
                </div>
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-4 text-[10px] font-bold rounded-xl transition-all uppercase tracking-wide ${view === 'weekly' ? 'bg-[#d2f34c] text-black shadow-lg shadow-[#d2f34c]/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        onClick={() => setView("weekly")}
                    >
                        Weekly
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-4 text-[10px] font-bold rounded-xl transition-all uppercase tracking-wide ${view === 'monthly' ? 'bg-[#d2f34c] text-black shadow-lg shadow-[#d2f34c]/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        onClick={() => setView("monthly")}
                    >
                        Monthly
                    </Button>
                </div>
            </div>
            <div className="w-full h-[250px] sm:h-[320px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400 animate-pulse">Loading chart...</div>
                ) : (view === "monthly" ? monthlyData : weeklyChartData).length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        No stats available 📉
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {view === "monthly" ? (
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#a855f7" /> {/* Neon Purple */}
                                        <stop offset="100%" stopColor="#4338ca" /> {/* Deep Indigo */}
                                    </linearGradient>
                                </defs>
                                {/* Removed Grid */}
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                                {/* Hidden YAxis */}
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#0f172a",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "16px",
                                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
                                        color: "#f8fafc",
                                        padding: "12px 16px"
                                    }}
                                    itemStyle={{ color: "#d2f34c", fontWeight: "bold", fontFamily: 'Antonio', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    formatter={(value: any) => [`₹${value}`, "SPENT"]}
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="url(#spend)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: "#d2f34c" }}
                                />
                            </AreaChart>
                        ) : (
                            <BarChart data={weeklyChartData}>
                                <defs>
                                    <linearGradient id="neonBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#d946ef" /> {/* Fuchsia */}
                                        <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet */}
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} fontWeight={700} tick={{ fill: '#94a3b8' }} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                                    contentStyle={{
                                        backgroundColor: "#0f172a",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "16px",
                                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
                                        color: "#f8fafc"
                                    }}
                                    itemStyle={{ color: "#d2f34c", fontWeight: "bold", fontFamily: 'Antonio', textTransform: 'uppercase' }}
                                    formatter={(value: any) => [`₹${value}`, "SPENT"]}
                                    labelFormatter={(label) => `DATE: ${label}`}
                                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                />
                                <Bar dataKey="amount" fill="url(#neonBar)" radius={[6, 6, 6, 6]} barSize={40} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
