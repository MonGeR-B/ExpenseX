// web/components/dashboard/CardsAndCharts.tsx
"use client";

import {
    summary,
    monthlySpending,
    categoryBreakdown,
} from "./mock-data";
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

const categoryColors = ["#22c55e", "#38bdf8", "#a855f7", "#f97316", "#e5e7eb"];

export function CardsAndCharts() {
    const totalCategories = categoryBreakdown.reduce(
        (acc, item) => acc + item.value,
        0
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Top cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/40">
                    <p className="text-xs text-slate-400 mb-1">Available balance</p>
                    <div className="text-2xl font-semibold tracking-tight mb-1">
                        ₹{summary.balance.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">
                        You&apos;re{" "}
                        <span className="text-emerald-400 font-medium">
                            +{summary.changeVsLastMonth}%
                        </span>{" "}
                        vs last month
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/40">
                    <p className="text-xs text-slate-400 mb-1">Income this month</p>
                    <div className="text-2xl font-semibold tracking-tight mb-1">
                        ₹{summary.incomeThisMonth.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">
                        Salary + side gigs combined.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/40">
                    <p className="text-xs text-slate-400 mb-1">Spent this month</p>
                    <div className="text-2xl font-semibold tracking-tight mb-1 text-rose-300">
                        ₹{summary.spentThisMonth.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">
                        Track this to avoid stupid impulse buys.
                    </p>
                </div>
            </div>

            {/* Charts row */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Monthly spending chart */}
                <div className="md:col-span-2 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/40">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">
                                Trend
                            </p>
                            <h2 className="text-sm font-semibold">Monthly spending</h2>
                        </div>
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300 border border-slate-700">
                            Last 6 months
                        </span>
                    </div>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlySpending}>
                                <defs>
                                    <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1f2937"
                                    vertical={false}
                                />
                                <XAxis dataKey="month" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#020617",
                                        borderRadius: 12,
                                        border: "1px solid #1f2937",
                                        fontSize: 12,
                                    }}
                                    formatter={(value: any) => [`₹${value}`, "Spending"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#22c55e"
                                    fill="url(#spend)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category breakdown */}
                <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/40">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">
                                Categories
                            </p>
                            <h2 className="text-sm font-semibold">Spending split</h2>
                        </div>
                    </div>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryBreakdown}
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {categoryBreakdown.map((entry, index) => (
                                        <Cell
                                            key={`cell-${entry.name}`}
                                            fill={categoryColors[index % categoryColors.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#020617",
                                        borderRadius: 12,
                                        border: "1px solid #1f2937",
                                        fontSize: 12,
                                    }}
                                    formatter={(value: any, name: any) => [
                                        `₹${value}`,
                                        String(name),
                                    ]}
                                />
                                <Legend
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    formatter={(value: any) => (
                                        <span className="text-xs text-slate-300">{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                        Total this month:{" "}
                        <span className="text-slate-100 font-medium">
                            ₹{totalCategories.toLocaleString()}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
