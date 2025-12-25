"use client"

import { useState } from "react"
import { useExpenseStore } from "@/store/expenses"
import { useCategoriesStore } from "@/store/categories"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Plus, Loader2, CalendarIcon, IndianRupee } from "lucide-react"

export function AddExpenseDialog({ children }: { children?: React.ReactNode }) {
    const { addExpense, isLoading } = useExpenseStore()
    const { categories, fetchCategories } = useCategoriesStore()
    const [open, setOpen] = useState(false)

    // Form state
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [categoryId, setCategoryId] = useState("none")

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen && categories.length === 0) {
            fetchCategories()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        // Maximum amount validation (999,999,999)
        if (numAmount > 999999999) {
            alert("Amount cannot exceed ₹999,999,999 (1 billion)");
            return;
        }

        try {
            await addExpense({
                amount: numAmount,
                description,
                date,
                category_id: categoryId !== "none" ? parseInt(categoryId) : null
            })
            setOpen(false)
            // Reset form
            setAmount("")
            setDescription("")
            setDate(new Date().toISOString().split('T')[0])
            setCategoryId("none")
        } catch (error) {
            console.error("Failed to add expense", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all hover:scale-105 px-6 font-bold h-11">
                        <Plus className="mr-2 h-5 w-5" /> Add Expense
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-slate-100 text-slate-900 shadow-2xl rounded-[2rem] p-6 lg:p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-900">
                        New Expense
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">

                    {/* Amount Input - Prominent */}
                    <div className="relative group">
                        <Label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block font-bold">Amount</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500 pointer-events-none" />
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="pl-10 h-14 bg-slate-50 border-slate-200 focus:border-slate-900 focus:ring-slate-900/10 text-2xl font-bold text-slate-900 placeholder:text-slate-300 transition-all rounded-2xl"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Category</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-slate-900 text-slate-900 rounded-xl font-medium">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-100 text-slate-700 shadow-xl rounded-xl max-h-[300px]">
                                    <SelectItem value="none" className="font-medium focus:bg-slate-50">Uncategorized</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()} className="font-medium focus:bg-slate-50">
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
                            <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Date</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:ring-slate-900 text-slate-900 text-sm font-medium rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Description</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 font-medium"
                            placeholder="What was this for?"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Transaction
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
