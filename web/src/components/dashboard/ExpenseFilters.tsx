"use client"

import { useExpenseStore } from "@/store/expenses"
import { useCategoriesStore } from "@/store/categories"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

export function ExpenseFilters() {
    const { filters, setFilters } = useExpenseStore()
    const { categories, fetchCategories } = useCategoriesStore()

    useEffect(() => {
        if (categories.length === 0) fetchCategories()
    }, [categories.length, fetchCategories])

    return (
        <div className="flex flex-wrap gap-3 items-center bg-[#111] p-2 rounded-2xl border border-white/5">
            <Input
                type="date"
                value={filters.from_date || ""}
                onChange={(e) => setFilters({ from_date: e.target.value || undefined })}
                className="w-auto h-10 bg-white/5 border-white/10 text-slate-200 text-xs rounded-xl focus:ring-white/10"
                placeholder="From"
            />
            <span className="text-slate-500 text-xs font-bold">TO</span>
            <Input
                type="date"
                value={filters.to_date || ""}
                onChange={(e) => setFilters({ to_date: e.target.value || undefined })}
                className="w-auto h-10 bg-white/5 border-white/10 text-slate-200 text-xs rounded-xl focus:ring-white/10"
                placeholder="To"
            />

            <Select
                value={filters.category_id?.toString() || "all"}
                onValueChange={(val) => setFilters({ category_id: val === "all" ? undefined : parseInt(val) })}
            >
                <SelectTrigger className="w-[140px] h-10 bg-white text-black font-bold border-0 text-xs rounded-xl hover:bg-slate-200 transition-colors">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10 text-slate-200">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.icon} {cat.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ from_date: undefined, to_date: undefined, category_id: undefined })}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                title="Reset Filters"
            >
                <RotateCcw className="h-4 w-4" />
            </Button>
        </div>
    )
}
