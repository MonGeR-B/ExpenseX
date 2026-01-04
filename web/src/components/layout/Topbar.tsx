"use client";

import { useAuthStore } from "@/store/auth";
import { LogOut, LayoutGrid, ArrowLeftRight, PieChart, BarChart3, Folder, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutGrid },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/budgets", label: "Budgets", icon: PieChart },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/categories", label: "Categories", icon: Folder },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Topbar() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#111111]/80 backdrop-blur-md px-4 py-3 md:px-8 sticky top-0 z-50 shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-8 relative">
                    <img src="/brand/ExpenseX_logo.png" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <h1 className="text-xl font-black tracking-tight text-white hidden sm:block uppercase">
                    Expense<span className="text-[#d2f34c]">X</span>
                </h1>
            </div>

            {/* Navigation (Center) - Desktop */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-xs font-bold",
                                isActive
                                    ? "bg-[#d2f34c] text-black shadow-lg shadow-[#d2f34c]/20"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={16} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>



            {/* User Profile / Logout */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="h-9 w-9 rounded-xl bg-[#222] border border-white/10 p-[2px] shadow-sm flex items-center justify-center">
                        <span className="text-xs font-black uppercase text-white">
                            {user?.username?.[0] || user?.email?.[0] || 'U'}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    title="Logout"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
