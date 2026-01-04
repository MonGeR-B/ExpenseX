"use client";

import { useEffect, useState } from "react";
import { getSummaryStats } from "@/lib/api";
import type { SummaryStats } from "@/lib/types";
import { useExpenseStore } from "@/store/expenses";

export function CardsAndCharts() {
    const lastUpdated = useExpenseStore((state) => state.lastUpdated);
    const [summary, setSummary] = useState<SummaryStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const ts = Date.now();
                const s = await getSummaryStats(undefined, undefined, ts);

                if (!mounted) return;
                setSummary(s);
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

    if (loading && !summary) {
        return <div className="text-sm text-slate-400 animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Top cards - "Designer's Toolkit" Pinned Style (Pins Removed) */}
            <div className="flex flex-col md:flex-row gap-6 w-full">
                {/* Card 01: Total Spent (Blue/Freepik Theme) */}
                <div className="relative group flex-1">
                    {/* The Card */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.03] backdrop-blur-[24px] border-t border-l border-t-white/15 border-l-white/15 border-b border-r border-b-black/20 border-r-black/20 p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl shadow-sm">
                                💰
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-100 mb-1 uppercase tracking-tight">Total Spent</h3>
                            <div className="text-3xl lg:text-4xl font-medium text-white tracking-tight my-2">
                                ₹{(summary?.total_spent ?? 0).toLocaleString()}
                            </div>
                            <p className="text-xs font-semibold text-slate-300 leading-snug">
                                Total amount spent this month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 02: Transactions (Pink/Pinterest Theme) */}
                <div className="relative group flex-1">
                    <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.03] backdrop-blur-[24px] border-t border-l border-t-white/15 border-l-white/15 border-b border-r border-b-black/20 border-r-black/20 p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-xl shadow-sm">
                                🧾
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-100 mb-1 uppercase tracking-tight">Transactions</h3>
                            <div className="text-3xl lg:text-4xl font-medium text-white tracking-tight my-2">
                                {summary?.transactions_count ?? 0}
                            </div>
                            <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                                Total active transactions processed this month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 03: Top Category (Green/Envato Theme) */}
                <div className="relative group flex-1">
                    <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.03] backdrop-blur-[24px] border-t border-l border-t-white/15 border-l-white/15 border-b border-r border-b-black/20 border-r-black/20 p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shadow-sm">
                                🏆
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-100 mb-1 uppercase tracking-tight">Top Category</h3>
                            <div className="text-2xl lg:text-3xl font-medium text-white tracking-tight my-2 truncate">
                                {summary?.top_category ?? "—"}
                            </div>
                            <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                                Most spent on <span className="text-emerald-400 font-bold">{summary?.top_category ?? "nothing"}</span> with <span className="text-emerald-400 font-bold">₹{(summary?.top_category_amount ?? 0).toLocaleString()}</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
