"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useCategoriesStore } from "@/store/categories";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, RefreshCw, Pencil } from "lucide-react";

import { getCategoryStats } from "@/lib/api";
import { CategoryPoint } from "@/lib/types";

export default function CategoriesPage() {
    const { categories, fetchCategories, addCategory, deleteCategory, seedDefaults, isLoading } = useCategoriesStore();
    const [stats, setStats] = useState<CategoryPoint[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", color: "#3b82f6", icon: "💰" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
        // Fetch stats for current month
        getCategoryStats().then(data => setStats(data.categories));
    }, [fetchCategories]);

    const handleAdd = async () => {
        if (!newItem.name) return;
        setIsSubmitting(true);
        try {
            await addCategory(newItem.name, newItem.color, newItem.icon);
            setIsAddOpen(false);
            setNewItem({ name: "", color: "#3b82f6", icon: "💰" });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure? This cannot be undone.")) {
            await deleteCategory(id);
        }
    };

    const getSpending = (catId: number) => {
        const point = stats.find(s => s.category_id === catId);
        return point ? point.total_amount : 0;
    }

    // Edit State
    const { updateCategory } = useCategoriesStore();
    const [isEditOpen, setIsEditOpen] = useState(false);
    // Explicitly type the state to allow null or a Category object
    const [editingCategory, setEditingCategory] = useState<{ id: number, name: string, color: string, icon: string } | null>(null);

    const handleUpdate = async () => {
        if (!editingCategory || !editingCategory.name) return;
        setIsSubmitting(true);
        try {
            await updateCategory(editingCategory.id, editingCategory.name, editingCategory.color, editingCategory.icon);
            setIsEditOpen(false);
            setEditingCategory(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppShell>
            <div className="space-y-8 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Categories
                        </h1>
                        <p className="text-slate-400">
                            Manage where your money goes.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {categories.length === 0 && (
                            <Button variant="outline" onClick={() => seedDefaults()} disabled={isLoading} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Load Defaults
                            </Button>
                        )}
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white shadow-lg border-0 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-white border-slate-100 text-slate-900 shadow-2xl rounded-[2rem] p-6 lg:p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-slate-900">New Category</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 mt-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Name</Label>
                                        <Input
                                            value={newItem.name}
                                            onChange={(e) =>
                                                setNewItem({ ...newItem, name: e.target.value })
                                            }
                                            placeholder="e.g. Groceries"
                                            className="bg-slate-50 border-slate-200 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 font-medium"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Color</Label>
                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    type="color"
                                                    value={newItem.color}
                                                    onChange={(e) =>
                                                        setNewItem({ ...newItem, color: e.target.value })
                                                    }
                                                    className="w-14 h-11 p-1 bg-slate-50 border-slate-200 rounded-xl cursor-pointer"
                                                />
                                                <span className="text-sm font-bold text-slate-500 uppercase">{newItem.color}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Icon (Emoji)</Label>
                                            <Input
                                                value={newItem.icon}
                                                onChange={(e) =>
                                                    setNewItem({ ...newItem, icon: e.target.value })
                                                }
                                                className="bg-slate-50 border-slate-200 text-slate-900 text-center text-xl h-11 rounded-xl"
                                                maxLength={2}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleAdd}
                                        disabled={isSubmitting}
                                        className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all"
                                    >
                                        {isSubmitting ? "Saving..." : "Create Category"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pt-6">
                    {categories.map((cat, index) => {
                        const spent = getSpending(cat.id);
                        const hasSpent = spent > 0;

                        // Glassmorphic Themes
                        const themes = [
                            { name: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-100', accent: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
                            { name: 'pink', bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-100', accent: 'bg-pink-500', shadow: 'shadow-pink-500/20' },
                            { name: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-100', accent: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
                            { name: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-100', accent: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
                        ];
                        const t = themes[index % themes.length];

                        return (
                            <div key={cat.id} className="relative group">
                                {/* Pinned Top */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                    <div className="h-6 w-6 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-gradient-to-br from-white/20 to-white/5 ring-1 ring-white/20 backdrop-blur-xl"></div>
                                </div>

                                <div className={`relative overflow-hidden rounded-[2.5rem] ${t.bg} border ${t.border} p-6 shadow-2xl backdrop-blur-xl transition-transform hover:-translate-y-1 hover:shadow-emerald-500/10 h-full`}>
                                    <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent opacity-50`}></div>

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div
                                            className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-white/10 border border-white/10 backdrop-blur-md"
                                            style={{ color: cat.color, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                                        >
                                            {cat.icon}
                                        </div>
                                        <div className="flex items-center bg-black/20 rounded-xl border border-white/10 shadow-sm backdrop-blur-md">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingCategory(cat);
                                                    setIsEditOpen(true);
                                                }}
                                                className="h-9 w-9 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-l-xl rounded-r-none"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <div className="w-[1px] h-4 bg-white/10"></div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(cat.id)}
                                                className="h-9 w-9 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-r-xl rounded-l-none"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-xl font-black text-white mb-2 drop-shadow-sm">{cat.name}</h3>
                                        {hasSpent ? (
                                            <div className="p-3 rounded-2xl bg-black/20 border border-white/10 shadow-inner">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Spent this month</p>
                                                <span className="text-2xl font-black text-white">
                                                    ₹{spent.toLocaleString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 border-dashed">
                                                <p className="text-sm text-slate-500 font-medium text-center">No transactions yet</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Color Tag */}
                                    <div className="mt-4 flex items-center gap-2 relative z-10">
                                        <div className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: cat.color, color: cat.color }} />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-80">{cat.color}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border-slate-100 text-slate-900 shadow-2xl rounded-[2rem] p-6 lg:p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900">Edit Category</DialogTitle>
                    </DialogHeader>
                    {editingCategory && (
                        <div className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Name</Label>
                                <Input
                                    value={editingCategory.name}
                                    onChange={(e) =>
                                        setEditingCategory({ ...editingCategory, name: e.target.value })
                                    }
                                    placeholder="e.g. Groceries"
                                    className="bg-slate-50 border-slate-200 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Color</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="color"
                                            value={editingCategory.color}
                                            onChange={(e) =>
                                                setEditingCategory({ ...editingCategory, color: e.target.value })
                                            }
                                            className="w-14 h-11 p-1 bg-slate-50 border-slate-200 rounded-xl cursor-pointer"
                                        />
                                        <span className="text-sm font-bold text-slate-500 uppercase">{editingCategory.color}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Icon (Emoji)</Label>
                                    <Input
                                        value={editingCategory.icon}
                                        onChange={(e) =>
                                            setEditingCategory({ ...editingCategory, icon: e.target.value })
                                        }
                                        className="bg-slate-50 border-slate-200 text-slate-900 text-center text-xl h-11 rounded-xl"
                                        maxLength={2}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleUpdate}
                                disabled={isSubmitting}
                                className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all"
                            >
                                {isSubmitting ? "Saving..." : "Update Category"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppShell >
    );
}
