"use client";

import { useEffect, useState } from "react";
import { getSummaryStats } from "@/lib/api";
import type { SummaryStats } from "@/lib/types";
import { useExpenseStore } from "@/store/expenses";

export function ReportsCards() {
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
        return <div className="text-sm text-slate-400 animate-pulse">Loading reports...</div>;
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Top cards - "Designer's Toolkit" Pinned Style (Pins Removed) */}
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 pt-6">
                {/* Card 01: Total Spent (Blue/Freepik Theme) */}
                <div className="relative group">
                    {/* The Card */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-blue-50 border-2 border-blue-200 p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-4">
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
                                Total amount spent this month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 02: Transactions (Pink/Pinterest Theme) */}
                <div className="relative group mt-0">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-pink-50 border-2 border-pink-200 p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-4">
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
                                Total active transactions processed this month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 03: Top Category (Green/Envato Theme) */}
                <div className="relative group mt-0">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-emerald-50 border-2 border-emerald-200 p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
                                🏆
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 mb-1">Top Category</h3>
                            <div className="text-2xl font-black text-slate-900 tracking-tight my-2 truncate">
                                {summary?.top_category ?? "—"}
                            </div>
                            <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                                Most spent on <span className="text-emerald-600 font-bold">{summary?.top_category ?? "nothing"}</span> with <span className="text-emerald-700 font-bold">₹{(summary?.top_category_amount ?? 0).toLocaleString()}</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
