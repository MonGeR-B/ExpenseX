"use client"

import { useState, useEffect } from "react"
import { useExpenseStore } from "@/store/expenses"
import { useCategoriesStore } from "@/store/categories"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, CalendarIcon, IndianRupee } from "lucide-react"

export function EditExpenseDialog({
    expenseId,
    open,
    onOpenChange
}: {
    expenseId: number | null,
    open: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const { expenses, updateExpense, isLoading } = useExpenseStore()
    const { categories, fetchCategories } = useCategoriesStore()

    // Form state
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState("")
    const [categoryId, setCategoryId] = useState("none")

    // Load data when dialog opens or expenseId changes
    useEffect(() => {
        if (open && expenseId) {
            const exp = expenses.find(e => e.id === expenseId)
            if (exp) {
                setAmount(exp.amount.toString())
                setDescription(exp.description || "")
                // Ensure date is valid YYYY-MM-DD
                const d = new Date(exp.date);
                if (!isNaN(d.getTime())) {
                    setDate(d.toISOString().split('T')[0]);
                } else {
                    setDate(new Date().toISOString().split('T')[0]);
                }

                setCategoryId(exp.category_id ? exp.category_id.toString() : "none")
            }
            if (categories.length === 0) fetchCategories()
        }
    }, [open, expenseId, expenses, categories.length, fetchCategories])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!expenseId) return

        // Validation
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        if (!date) {
            alert("Please select a date");
            return;
        }

        try {
            await updateExpense(expenseId, {
                amount: numAmount,
                description,
                date,
                category_id: categoryId !== "none" ? parseInt(categoryId) : null
            })
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update expense", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-slate-950/90 backdrop-blur-xl border-slate-800 text-slate-50 shadow-2xl shadow-emerald-500/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-light tracking-wide bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Edit Transaction
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">

                    {/* Amount Input - Prominent */}
                    <div className="relative group">
                        <Label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Amount</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="pl-9 h-12 bg-slate-900/50 border-slate-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-lg font-medium text-emerald-400 placeholder:text-slate-700 transition-all"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400 uppercase tracking-wider">Category</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger className="h-10 bg-slate-900/50 border-slate-800 focus:ring-slate-700 text-slate-200">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 max-h-[200px]">
                                    <SelectItem value="none">Uncategorized</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            <span className="flex items-center gap-2">
                                                <span>{cat.icon}</span>
                                                <span>{cat.name}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400 uppercase tracking-wider">Date</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-3.5 text-slate-500 pointer-events-none" />
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="pl-9 h-10 bg-slate-900/50 border-slate-800 focus:border-slate-700 text-slate-300 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-slate-400 uppercase tracking-wider">Description</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-slate-900/50 border-slate-800 focus:border-slate-700 text-slate-200 placeholder:text-slate-700"
                            placeholder="What was this for?"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
