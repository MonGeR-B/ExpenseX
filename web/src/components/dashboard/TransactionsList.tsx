"use client";

import { useEffect, useState } from "react";
import { useExpenseStore } from "@/store/expenses";
import { Loader2, Edit2, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditExpenseDialog } from "./EditExpenseDialog";
import { useCategoriesStore } from "@/store/categories";
import { cn } from "@/lib/utils";

export function TransactionsList() {
    const { expenses, fetchExpenses, deleteExpense, isLoading, hasMore } = useExpenseStore();
    const { categories, fetchCategories } = useCategoriesStore();

    const [editId, setEditId] = useState<number | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        // Fetch if empty, but for full list maybe we always want to ensure we have data?
        // The store handles pagination state.
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
        <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">All Transactions</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage and track your spending</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-white border border-blue-100 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                        <thead>
                            <tr className="border-b border-blue-50 bg-blue-50/50">
                                <th className="py-4 px-6 text-left font-bold text-xs uppercase tracking-wider text-blue-900/60">Date</th>
                                <th className="py-4 px-6 text-left font-bold text-xs uppercase tracking-wider text-blue-900/60">Description</th>
                                <th className="py-4 px-6 text-left font-bold text-xs uppercase tracking-wider text-blue-900/60">Category</th>
                                <th className="py-4 px-6 text-right font-bold text-xs uppercase tracking-wider text-blue-900/60">Amount</th>
                                <th className="py-4 px-6 text-right font-bold text-xs uppercase tracking-wider text-blue-900/60">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {expenses.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                                            <p className="text-slate-400 font-bold text-sm">No expenses found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : expenses.map((exp) => (
                                <tr
                                    key={exp.id}
                                    className="group hover:bg-blue-50/30 transition-colors"
                                >
                                    <td className="py-4 px-6 text-slate-500 font-bold">
                                        {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-slate-700 font-bold block max-w-[200px] truncate" title={exp.description || "Expense"}>
                                            {exp.description || "Expense"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-base shadow-sm group-hover:bg-white transition-colors">
                                                {getCategoryIcon(exp.category_id)}
                                            </span>
                                            <span className="text-slate-700 font-bold text-sm">{categories.find(c => c.id === exp.category_id)?.name || "Uncategorized"}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right font-black text-slate-900 tracking-tight text-base">
                                        ₹{exp.amount.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleEdit(exp.id)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                onClick={() => handleDelete(exp.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination / Load More */}
                {hasMore && (
                    <div className="p-4 border-t border-blue-50 bg-blue-50/30 flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => fetchExpenses()}
                            disabled={isLoading}
                            className="bg-white hover:bg-white text-slate-600 border-blue-200 hover:border-blue-300 font-bold gap-2 pl-6 pr-4 shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Load More History <ArrowRight className="h-4 w-4 opacity-50" />
                        </Button>
                    </div>
                )}
            </div>

            <EditExpenseDialog
                expenseId={editId}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </div>
    );
}
