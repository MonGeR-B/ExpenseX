// web/components/layout/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/budgets", label: "Budgets" },
    { href: "/transactions", label: "Transactions" },
    { href: "/reports", label: "Reports" },
    { href: "/categories", label: "Categories" },
    { href: "/settings", label: "Settings" },
];



export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-white/5 transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative">
                            <img src="/brand/ExpenseX_logo.png" alt="ExpenseX" className="object-contain h-full w-full" />
                        </div>
                        <div>
                            <div className="text-base font-bold text-white tracking-tight">ExpenseX</div>
                            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Workspace</div>
                        </div>
                    </div>
                    {/* Close Button Mobile */}
                    <button onClick={onClose} className="md:hidden text-slate-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200",
                                    active
                                        ? "bg-white text-black shadow-lg shadow-white/10"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4">
                    <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-black p-5 border border-white/10 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-4xl">👑</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Pro Plan</h4>
                            <p className="text-xs font-medium text-slate-500 mb-4">Get advanced analytics feature</p>
                            <button className="w-full rounded-xl bg-white py-2.5 text-xs font-bold text-black shadow-lg shadow-white/5 hover:bg-slate-200 transition-all">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
