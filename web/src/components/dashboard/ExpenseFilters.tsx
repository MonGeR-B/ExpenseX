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
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3 items-center bg-[#111] p-2 md:p-3 rounded-2xl border border-white/5 w-full">
            <Input
                type="date"
                value={filters.from_date || ""}
                onChange={(e) => setFilters({ from_date: e.target.value || undefined })}
                className="w-full md:w-auto h-9 md:h-10 bg-white/5 border-white/10 text-slate-200 text-xs rounded-xl focus:ring-white/10"
                placeholder="From"
            />
            <div className="flex items-center gap-2 md:contents">
                <span className="text-slate-500 text-xs font-bold md:hidden">To</span>
                <Input
                    type="date"
                    value={filters.to_date || ""}
                    onChange={(e) => setFilters({ to_date: e.target.value || undefined })}
                    className="w-full md:w-auto h-9 md:h-10 bg-white/5 border-white/10 text-slate-200 text-xs rounded-xl focus:ring-white/10"
                    placeholder="To"
                />
            </div>

            <div className="col-span-2 md:col-span-1 md:w-auto">
                <Select
                    value={filters.category_id?.toString() || "all"}
                    onValueChange={(val) => setFilters({ category_id: val === "all" ? undefined : parseInt(val) })}
                >
                    <SelectTrigger className="w-full md:w-[140px] h-9 md:h-10 bg-white text-black font-bold border-0 text-xs rounded-xl hover:bg-slate-200 transition-colors">
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
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ from_date: undefined, to_date: undefined, category_id: undefined })}
                className="hidden md:flex h-8 w-8 p-0 text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 rounded-lg"
                title="Reset Filters"
            >
                <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Mobile Reset Button - Full Width */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ from_date: undefined, to_date: undefined, category_id: undefined })}
                className="md:hidden col-span-2 h-9 border-white/10 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl text-xs gap-2"
            >
                <RotateCcw className="h-3 w-3" /> Reset Filters
            </Button>
        </div>
    )
}
