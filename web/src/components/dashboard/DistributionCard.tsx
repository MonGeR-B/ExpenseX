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
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
            <div className="rounded-[2rem] bg-white/[0.03] backdrop-blur-[24px] border-t border-l border-t-white/15 border-l-white/15 border-b border-r border-b-black/20 border-r-black/20 p-8 shadow-sm flex flex-col w-full h-full">
                <div className="mb-6">
                    <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">Distribution</h2>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mt-1">Where it goes</p>
                </div>
                <div className="relative h-[160px] w-full">
                    {loading && !categories ? (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400 animate-pulse">Loading...</div>
                    ) : categoryChartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            No stats available 📊
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <Pie
                                    data={categoryChartData}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={4}
                                    cornerRadius={8}
                                    dataKey="value"
                                    stroke="none"
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    {categoryChartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${entry.name}-${index}`}
                                            fill={categoryColors[index % categoryColors.length]}
                                            style={{
                                                filter: activeIndex === index ? "url(#glow)" : undefined,
                                                opacity: activeIndex !== null && activeIndex !== index ? 0.6 : 1,
                                                transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                                                transformOrigin: "center",
                                                transition: "all 0.3s ease"
                                            }}
                                            stroke="rgba(0,0,0,0)"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    cursor={false}
                                    contentStyle={{ display: 'none' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Dynamic Stats Legend (Outside Chart) */}
                <div className="mt-2 flex flex-col items-center justify-center h-[50px] transition-all duration-300">
                    {activeIndex !== null && categoryChartData[activeIndex] ? (
                        <>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-200">
                                {categoryChartData[activeIndex].name}
                            </p>
                            <p className="text-2xl font-black text-white tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-200" style={{ color: categoryColors[activeIndex % categoryColors.length] }}>
                                ₹{categoryChartData[activeIndex].value.toLocaleString()}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Total Spent
                            </p>
                            <p className="text-2xl font-black text-slate-200 tracking-tight">
                                ₹{Math.round(totalCategories / 1000)}k
                            </p>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}
