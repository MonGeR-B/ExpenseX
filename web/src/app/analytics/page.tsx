"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { getDailyStats, getCategoryStats } from "@/lib/api"
import { DailyStats, CategoryStats } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts"
import { Loader2, TrendingUp, PieChart as PieIcon } from "lucide-react"

const categoryColors = ["#10b981", "#3b82f6", "#8b5cf6", "#f43f5e", "#f59e0b", "#ec4899", "#14b8a6"];

export default function AnalyticsPage() {
    const [year, setYear] = useState(new Date().getFullYear())
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [dailyStats, setDailyStats] = useState<DailyStats | null>(null)
    const [catStats, setCatStats] = useState<CategoryStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true)
                const [d, c] = await Promise.all([
                    getDailyStats(year, month),
                    getCategoryStats(year, month)
                ])
                if (mounted) {
                    setDailyStats(d)
                    setCatStats(c)
                }
            } catch (error) {
                console.error("Failed to load analytics", error)
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => { mounted = false }
    }, [year, month])

    const totalSpent = dailyStats?.points.reduce((acc, p) => acc + p.total_amount, 0) || 0;
    const maxDay = dailyStats?.points.reduce((max, p) => p.total_amount > max.total_amount ? p : max, dailyStats?.points[0] || { day: 0, total_amount: 0 });

    return (
        <AppShell>
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Analytics & Insights
                        </h1>
                        <p className="text-slate-400">
                            Deep dive into your spending habits.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                            <SelectTrigger className="w-[140px] bg-slate-900 border-slate-800 focus:ring-emerald-500/50">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <SelectItem key={m} value={m.toString()}>
                                        {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                            <SelectTrigger className="w-[100px] bg-slate-900 border-slate-800 focus:ring-emerald-500/50">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                {[2024, 2025, 2026].map((y) => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl shadow-blue-500/5 group hover:shadow-blue-500/10 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <div className="h-16 w-16 bg-blue-500/20 rounded-full blur-2xl" />
                                </div>
                                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">
                                    Total Spent
                                </p>
                                <div className="text-4xl font-bold text-white mb-2">
                                    ₹{totalSpent.toLocaleString()}
                                </div>
                                <p className="text-sm text-blue-400">
                                    in {new Date(0, month - 1).toLocaleString('default', { month: 'long' })} {year}
                                </p>
                            </div>

                            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl shadow-emerald-500/5 group hover:shadow-emerald-500/10 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <div className="h-16 w-16 bg-emerald-500/20 rounded-full blur-2xl" />
                                </div>
                                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">
                                    Highest Spending Day
                                </p>
                                <div className="text-4xl font-bold text-emerald-400 mb-2">
                                    {maxDay?.day ? `${maxDay.day}` : "—"}
                                    <span className="text-lg text-slate-500 font-normal ml-1">
                                        {new Date(0, month - 1).toLocaleString('default', { month: 'short' })}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Top spend: <span className="text-slate-200">₹{(maxDay?.total_amount || 0).toLocaleString()}</span>
                                </p>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Daily Trend */}
                            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Daily Trend</h3>
                                        <p className="text-sm text-slate-400">Spending flow</p>
                                    </div>
                                </div>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dailyStats?.points || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                            <Tooltip
                                                cursor={{ fill: '#1e293b' }}
                                                contentStyle={{
                                                    backgroundColor: "#0f172a",
                                                    border: "1px solid #1e293b",
                                                    borderRadius: 8,
                                                    color: "#f8fafc"
                                                }}
                                                formatter={(value: number) => [`₹${value}`, 'Spent']}
                                            />
                                            <Bar dataKey="total_amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <PieIcon className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Category Split</h3>
                                        <p className="text-sm text-slate-400">Distribution</p>
                                    </div>
                                </div>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={(catStats?.categories || []) as any}
                                                dataKey="total_amount"
                                                nameKey="category_name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                            >
                                                {(catStats?.categories || []).map((entry, index) => (
                                                    <Cell key={index} fill={categoryColors[index % categoryColors.length]} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#0f172a",
                                                    border: "1px solid #1e293b",
                                                    borderRadius: 8,
                                                    color: "#f8fafc"
                                                }}
                                                formatter={(value: number) => [`₹${value}`, '']}
                                            />
                                            <Legend
                                                layout="vertical"
                                                verticalAlign="middle"
                                                align="right"
                                                iconType="circle"
                                                iconSize={8}
                                                wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    )
}
