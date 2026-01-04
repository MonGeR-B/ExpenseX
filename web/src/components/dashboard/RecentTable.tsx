"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useExpenseStore } from "@/store/expenses";
import { Loader2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditExpenseDialog } from "./EditExpenseDialog";
import { useCategoriesStore } from "@/store/categories";
import { cn } from "@/lib/utils";

export function RecentTable() {
    const { expenses, fetchExpenses, deleteExpense, isLoading, hasMore } = useExpenseStore();
    const { categories, fetchCategories } = useCategoriesStore();

    const [editId, setEditId] = useState<number | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        if (expenses.length === 0) fetchExpenses(true);
        if (categories.length === 0) fetchCategories();
    }, [fetchExpenses, fetchCategories]);

    const handleEdit = (id: number) => {
        setEditId(id);
        setIsEditOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            await deleteExpense(id);
        }
    };

    const getCategoryIcon = (id: number | null | undefined) => {
        if (!id) return "📝";
        const cat = categories.find(c => c.id === id);
        return cat ? cat.icon : "📝";
    };

    return (
        <div className="rounded-[2rem] bg-white/[0.03] backdrop-blur-[24px] border-t border-l border-t-white/15 border-l-white/15 border-b border-r border-b-black/20 border-r-black/20 p-8 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
            <Link href="/transactions" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity">
                <div>
                    <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">Recent Transactions</h2>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mt-1">History</p>
                </div>
            </Link>

            <div className="overflow-x-auto rounded-2xl bg-white/[0.02] border border-white/10 shadow-sm flex-1">
                {/* Desktop Table View */}
                <table className="hidden md:table w-full text-sm min-w-[300px]">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="py-4 px-6 text-left font-bold text-[11px] uppercase tracking-wider text-slate-400">Date</th>
                            <th className="py-4 px-6 text-left font-bold text-[11px] uppercase tracking-wider text-slate-400">Category</th>
                            <th className="py-4 px-6 text-right font-bold text-[11px] uppercase tracking-wider text-slate-400">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {expenses.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan={3} className="py-12 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 opacity-40">
                                        <img src="/brand/ExpenseX_logo.png" alt="Empty" className="h-10 w-10 grayscale invert" />
                                        <p className="text-slate-400 font-bold text-sm">No expenses found yet</p>
                                    </div>
                                </td>
                            </tr>
                        ) : expenses.slice(0, 5).map((exp) => (
                            <tr
                                key={exp.id}
                                className="group hover:bg-white/5 transition-colors"
                            >
                                <td className="py-4 px-6 text-slate-300 text-xs font-bold">
                                    {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-base shadow-sm">
                                            {getCategoryIcon(exp.category_id)}
                                        </span>
                                        <span className="text-slate-200 font-bold text-xs truncate max-w-[100px]">{categories.find(c => c.id === exp.category_id)?.name || "Uncategorized"}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right font-medium text-white tracking-tight text-sm">
                                    ₹{exp.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Mobile List View */}
                <div className="md:hidden">
                    {expenses.length === 0 && !isLoading ? (
                        <div className="py-12 text-center flex flex-col items-center justify-center gap-3 opacity-40">
                            <img src="/brand/ExpenseX_logo.png" alt="Empty" className="h-10 w-10 grayscale invert" />
                            <p className="text-slate-400 font-bold text-sm">No expenses found yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {expenses.slice(0, 5).map((exp) => (
                                <div key={exp.id} className="p-4 flex items-center gap-3 active:bg-white/5 transition-colors">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl shadow-sm">
                                        {getCategoryIcon(exp.category_id)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-slate-200 text-sm truncate">
                                            {categories.find(c => c.id === exp.category_id)?.name || "Uncategorized"}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                            {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="text-base font-medium text-white tracking-tight">
                                            ₹{exp.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <EditExpenseDialog
                expenseId={editId}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </div>
    );
}
