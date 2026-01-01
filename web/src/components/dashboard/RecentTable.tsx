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
        <div className="rounded-xl sm:rounded-[1.5rem] bg-white/20 backdrop-blur-md border border-white/20 p-3 sm:p-4 md:p-5 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
            <Link href="/transactions" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900">Recent Transactions</h2>
                    <p className="text-[10px] sm:text-xs font-bold text-blue-900/60 uppercase tracking-wide mt-0.5">History</p>
                </div>
            </Link>

            <div className="overflow-x-auto rounded-2xl bg-white border border-blue-100 shadow-sm flex-1">
                <table className="w-full text-sm min-w-[300px]">
                    <thead>
                        <tr className="border-b border-blue-50 bg-blue-50/50">
                            <th className="py-2 px-3 text-left font-bold text-[10px] uppercase tracking-wider text-blue-900/60">Date</th>
                            <th className="py-2 px-3 text-left font-bold text-[10px] uppercase tracking-wider text-blue-900/60">Category</th>
                            <th className="py-2 px-3 text-right font-bold text-[10px] uppercase tracking-wider text-blue-900/60">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50">
                        {expenses.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan={3} className="py-8 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                                        <img src="/brand/ExpenseX_logo.png" alt="Empty" className="h-8 w-8 grayscale" />
                                        <p className="text-slate-400 font-bold text-xs">No expenses found yet</p>
                                    </div>
                                </td>
                            </tr>
                        ) : expenses.slice(0, 5).map((exp) => (
                            <tr
                                key={exp.id}
                                className="group hover:bg-blue-50/30 transition-colors"
                            >
                                <td className="py-2.5 px-3 text-slate-500 text-[11px] font-bold">
                                    {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-sm shadow-sm">
                                            {getCategoryIcon(exp.category_id)}
                                        </span>
                                        <span className="text-slate-700 font-bold text-[11px] truncate max-w-[80px]">{categories.find(c => c.id === exp.category_id)?.name || "Uncategorized"}</span>
                                    </div>
                                </td>
                                <td className="py-2.5 px-3 text-right font-black text-slate-900 tracking-tight text-xs">
                                    ₹{exp.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>



            <EditExpenseDialog
                expenseId={editId}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </div>
    );
}
