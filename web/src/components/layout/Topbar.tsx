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
        <header className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3 md:px-6">
            <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Dashboard
                </p>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                    Good evening, {user?.email?.split('@')[0] || 'User'}
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <button className="hidden sm:inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
                    This month
                </button>
                <AddExpenseDialog>
                    <button className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-emerald-400">
                        + Add expense
                    </button>
                </AddExpenseDialog>
                <div className="flex items-center gap-2 pl-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950 flex items-center justify-center text-xs font-semibold uppercase">
                        {user?.email?.[0] || 'U'}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
