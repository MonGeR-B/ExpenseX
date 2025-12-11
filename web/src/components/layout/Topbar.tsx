"use client";

import { useAuthStore } from "@/store/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddExpenseDialog } from "@/components/dashboard/AddExpenseDialog";

export function Topbar() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <header className="flex items-center justify-between gap-4 border-b border-white/5 bg-[#111111] px-4 py-3 md:px-6 sticky top-0 z-50">
            <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    Overview
                </p>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    Hello, {user?.email?.split('@')[0] || 'User'} 👋
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-400 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    System Active
                </div>

                <AddExpenseDialog>
                    <button className="group relative inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-slate-200 transition-all">
                        <span className="mr-2 text-lg text-black font-black">+</span> Add Expense
                    </button>
                </AddExpenseDialog>

                <div className="flex items-center gap-4 pl-4 border-l border-white/10 ml-2">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="h-10 w-10 rounded-xl bg-[#222] border border-white/10 p-[2px] shadow-sm flex items-center justify-center">
                            <span className="text-xs font-black uppercase text-white">
                                {user?.email?.[0] || 'U'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-2.5 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
