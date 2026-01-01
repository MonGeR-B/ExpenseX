"use client"

import { useState, useEffect } from "react"
import { useCategoriesStore } from "@/store/categories"
import { AppShell } from "@/components/layout/AppShell"
import api from "@/lib/api"
import { Category } from "@/lib/types"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Budget {
    id: number
    category: Category | null // Null means Global
    amount: number
    month: string
    spent: number
    percentage: number
}

export default function BudgetsPage() {
    const { categories, fetchCategories } = useCategoriesStore()
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    // Form
    const [amount, setAmount] = useState("")
    const [catId, setCatId] = useState("all")
    const [submitting, setSubmitting] = useState(false)

    const fetchBudgets = async () => {
        try {
            setLoading(true)
            const res = await api.get<Budget[]>("/budgets/")
            setBudgets(res.data)
        } catch (error) {
            console.error("Failed to fetch budgets", error)
            toast.error("Could not load budgets. Retrying...")
            // Simple retry once after 1s
            setTimeout(async () => {
                try {
                    const res = await api.get<Budget[]>("/budgets/")
                    setBudgets(res.data)
                } catch (retryError) {
                    toast.error("Failed to connect to server.")
                }
            }, 1000)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
        fetchBudgets()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            // Default to current month
            const today = new Date()
            const monthStr = today.toISOString().split('T')[0] // API expects YYYY-MM-DD

            await api.post("/budgets/", {
                amount: parseFloat(amount),
                month: monthStr,
                category_id: catId === "all" ? null : parseInt(catId)
            })
            toast.success("Budget set successfully!")
            setOpen(false)
            fetchBudgets()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to set budget")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Remove this budget?")) return
        try {
            await api.delete(`/budgets/${id}`)
            toast.success("Budget removed")
            fetchBudgets()
        } catch (error) {
            toast.error("Failed to delete budget")
        }
    }

    return (
        <AppShell>
            <div className="space-y-8 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                            Monthly Budgets
                        </h1>
                        <p className="text-slate-500 font-bold">
                            Set limits to keep your spending on track.
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl px-8 font-bold h-12">
                                <Plus className="mr-2 h-5 w-5" /> Create Budget
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-950 border-slate-800 text-slate-50 sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Set Monthly Budget</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={catId} onValueChange={setCatId}>
                                        <SelectTrigger className="bg-slate-900/50 border-slate-800 focus:ring-emerald-500/50 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            <SelectItem value="all">Overall (Total Spending)</SelectItem>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.icon} {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Limit Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="bg-slate-900/50 border-slate-800 focus:ring-emerald-500/50 rounded-xl"
                                        placeholder="5000"
                                        required
                                    />
                                </div>
                                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl" disabled={submitting}>
                                    {submitting ? <Loader2 className="animate-spin" /> : "Save Budget"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                        <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                            <span className="text-3xl">💸</span>
                        </div>
                        <p className="text-lg font-medium text-slate-300">No budgets set</p>
                        <p className="text-sm">Create one to start tracking your limits.</p>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pt-6">
                        {budgets.map((b, index) => {
                            // Glass Themes (Pastels)
                            const themes = [
                                { name: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', accent: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
                                { name: 'pink', bg: 'bg-pink-500/10', border: 'border-pink-500/20', accent: 'bg-pink-500', shadow: 'shadow-pink-500/20' },
                                { name: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', accent: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
                                { name: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20', accent: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
                            ];
                            const t = themes[index % themes.length];

                            const isOver = b.spent > b.amount;

                            return (
                                <div key={b.id} className="relative group">
                                    {/* Pin */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                        <div className={`h-6 w-6 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)] bg-gradient-to-br from-${t.name}-400 to-${t.name}-600 ring-1 ring-white/20`}></div>
                                    </div>

                                    <div className={`relative overflow-hidden rounded-[2.5rem] ${t.bg} border ${t.border} p-6 shadow-2xl backdrop-blur-xl transition-transform hover:-translate-y-1 hover:shadow-${t.name}-500/20 h-full`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`h-12 w-12 rounded-2xl ${t.accent} text-white flex items-center justify-center text-xl shadow-lg ${t.shadow}`}>
                                                {b.category ? b.category.icon : '🌎'}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-white/10"
                                                onClick={() => handleDelete(b.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-xl font-black text-white mb-1">
                                                    {b.category ? b.category.name : 'Overall Budget'}
                                                </h3>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    {new Date(b.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-baseline">
                                                    <span className={`text-3xl font-black ${isOver ? 'text-rose-400' : 'text-white'}`}>
                                                        ₹{b.spent.toLocaleString()}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-500">
                                                        / ₹{b.amount.toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden shadow-inner border border-white/5">
                                                    <div
                                                        className={`h-full ${isOver ? 'bg-rose-500' : t.accent} transition-all duration-500 rounded-full shadow-[0_0_10px_currentColor]`}
                                                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className={`flex items-center gap-2 text-xs font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                {isOver ? (
                                                    <span>⚠️ Over budget by ₹{(b.spent - b.amount).toLocaleString()}</span>
                                                ) : (
                                                    <span>✅ ₹{(b.amount - b.spent).toLocaleString()} left</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </AppShell>
    )
}

