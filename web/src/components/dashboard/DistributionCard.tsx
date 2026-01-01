"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    getSummaryStats,
    getCategoryStats,
} from "@/lib/api";
import type {
    SummaryStats,
    CategoryStats,
} from "@/lib/types";
import { useExpenseStore } from "@/store/expenses";

const categoryColors = ["#10b981", "#3b82f6", "#8b5cf6", "#f43f5e", "#f59e0b", "#ec4899", "#14b8a6"];

export function DistributionCard() {
    const lastUpdated = useExpenseStore((state) => state.lastUpdated);
    const [summary, setSummary] = useState<SummaryStats | null>(null);
    const [categories, setCategories] = useState<CategoryStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const ts = Date.now();
                const [s, c] = await Promise.all([
                    getSummaryStats(undefined, undefined, ts),
                    getCategoryStats(undefined, undefined, ts),
                ]);

                if (!mounted) return;
                setSummary(s);
                setCategories(c);
            } catch (err) {
                console.error("Failed to load distribution stats", err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [lastUpdated]);

    const categoryChartData =
        categories?.categories
            .filter(c => !["food", "health", "bills"].includes(c.category_name?.toLowerCase() ?? ""))
            .map((c) => ({
                name: c.category_name ?? "Uncategorized",
                value: c.total_amount,
            })) ?? [];

    const totalCategories = categoryChartData.reduce(
        (acc, item) => acc + item.value,
        0
    );

    return (
        <Link href="/reports" className="block w-full cursor-pointer transition-transform hover:scale-[1.02]">
            <div className="rounded-[1.5rem] bg-white/20 backdrop-blur-md border border-white/20 p-3 shadow-sm flex flex-col w-full h-full">
                <div className="mb-2">
                    <h2 className="text-sm font-bold text-slate-900">Distribution</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Where it goes</p>
                </div>
                <div className="relative h-[140px] w-full">
                    {loading && !categories ? (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400 animate-pulse">Loading...</div>
                    ) : categoryChartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            No stats available 📊
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryChartData}
                                    innerRadius={35}
                                    outerRadius={55}
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
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                            <span className="text-base font-black text-slate-900">
                                ₹{Math.round(totalCategories / 1000)}k
                            </span>
                        </div>
                    )}
                </div>

                {/* Simple Legend for compact view */}
                <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
                    {categoryChartData.slice(0, 3).map((entry, index) => (
                        <div key={index} className="flex items-center gap-1 text-[10px]">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
                            <span className="font-semibold text-slate-600 truncate max-w-[60px]">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Link>
    );
}
