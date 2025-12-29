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
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Top cards - "Designer's Toolkit" Pinned Style (Pins Removed) */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* Card 01: Total Spent (Blue/Freepik Theme) */}
                <div className="relative group flex-1">
                    {/* The Card */}
                    <div className="relative overflow-hidden rounded-xl sm:rounded-[2rem] bg-blue-50 border-2 border-blue-200 p-3 sm:p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-xl sm:rounded-2xl bg-blue-500 text-white flex items-center justify-center text-base sm:text-lg shadow-lg shadow-blue-500/20">
                                💰
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-800 mb-0.5">Total Spent</h3>
                            <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight my-1">
                                ₹{(summary?.total_spent ?? 0).toLocaleString()}
                            </div>
                            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 leading-snug">
                                Total amount spent this month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 02: Transactions (Pink/Pinterest Theme) */}
                <div className="relative group flex-1">
                    <div className="relative overflow-hidden rounded-xl sm:rounded-[2rem] bg-pink-50 border-2 border-pink-200 p-3 sm:p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-xl sm:rounded-2xl bg-pink-500 text-white flex items-center justify-center text-base sm:text-lg shadow-lg shadow-pink-500/20">
                                🧾
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-800 mb-0.5">Transactions</h3>
                            <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight my-1">
                                {summary?.transactions_count ?? 0}
                            </div>
                            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 leading-relaxed">
                                Total active transactions processed this month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 03: Top Category (Green/Envato Theme) */}
                <div className="relative group flex-1">
                    <div className="relative overflow-hidden rounded-xl sm:rounded-[2rem] bg-emerald-50 border-2 border-emerald-200 p-3 sm:p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-xl sm:rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-base sm:text-lg shadow-lg shadow-emerald-500/20">
                                🏆
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-800 mb-0.5">Top Category</h3>
                            <div className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight my-1 truncate">
                                {summary?.top_category ?? "—"}
                            </div>
                            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 leading-relaxed">
                                Most spent on <span className="text-emerald-600 font-bold">{summary?.top_category ?? "nothing"}</span> with <span className="text-emerald-700 font-bold">₹{(summary?.top_category_amount ?? 0).toLocaleString()}</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
