"use client";

import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
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

export function ReportsDistributionChart() {
    const lastUpdated = useExpenseStore((state) => state.lastUpdated);
    const [categories, setCategories] = useState<CategoryStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const ts = Date.now();
                const c = await getCategoryStats(undefined, undefined, ts);

                if (!mounted) return;
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
            // No filtering for reports page to show full picture? Or keep consistency?
            // User said "remove food/health/bills" for dashboard. Reports might want ALL data.
            // But "as it was before" likely implies the original filtered/unfiltered state.
            // I'll show ALL categories here for better reporting.
            .map((c) => ({
                name: c.category_name ?? "Uncategorized",
                value: c.total_amount,
            })) ?? [];

    const totalCategories = categoryChartData.reduce(
        (acc, item) => acc + item.value,
        0
    );

    return (
        <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-slate-100 p-8 shadow-sm flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Expense Distribution</h2>
                <p className="text-sm text-slate-400 font-medium mt-1">Breakdown by category</p>
            </div>
            <div className="relative h-[320px] w-full shrink-0">
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
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={4}
                                cornerRadius={8}
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
                                    borderRadius: "16px",
                                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                    color: "#1e293b",
                                    padding: "12px 16px"
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
                        <span className="text-3xl font-black text-slate-900">
                            ₹{Math.round(totalCategories / 1000)}k
                        </span>
                    </div>
                )}
            </div>

            {/* Custom Grid Legend */}
            <div className="mt-8 grid grid-cols-3 gap-x-2 gap-y-3">
                {categoryChartData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        <div
                            className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                        />
                        <span className="text-xs font-bold text-slate-600 truncate">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
