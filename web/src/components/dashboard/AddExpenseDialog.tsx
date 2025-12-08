"use client"

import { useState } from "react"
import { useExpenseStore } from "@/store/expenses"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function AddExpenseDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    const { addExpense, isLoading } = useExpenseStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await addExpense({
                amount: parseFloat(amount),
                description,
                date
            })
            setOpen(false)
            // Reset form
            setAmount("")
            setDescription("")
            setDate(new Date().toISOString().split('T')[0])
        } catch (error) {
            console.error("Failed to add expense", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
                <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Add a new transaction to your history.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Lunch, Taxi, etc."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save expense
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
