// web/components/layout/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    X,
    LayoutGrid,
    ArrowLeftRight,
    PieChart,
    BarChart3,
    Folder,
    Settings,
    ArrowUpRight
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutGrid },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/budgets", label: "Budgets", icon: PieChart },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/categories", label: "Categories", icon: Folder },
    { href: "/settings", label: "Settings", icon: Settings },
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
                "fixed inset-y-0 left-0 z-50 w-52 bg-[#1a1b23] border-r border-[#1a1b23] transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full px-3 py-6 space-y-6">
                    {/* Logo Area */}
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 relative">
                                <img src="/brand/ExpenseX_logo.png" alt="Logo" className="h-full w-full object-contain" />
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-white">
                                Expense<span className="text-[#d2f34c]">X</span>
                            </h1>
                        </div>
                        {/* Close Button Mobile */}
                        <button onClick={onClose} className="md:hidden text-slate-500 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-0.5 flex-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group font-bold text-[13px]",
                                        isActive
                                            ? "bg-[#d2f34c] text-black shadow-lg shadow-[#d2f34c]/20 scale-[1.02]"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon
                                        size={18}
                                        className={cn(
                                            "transition-colors",
                                            isActive ? "text-black" : "text-zinc-500 group-hover:text-white"
                                        )}
                                    />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Cards Area */}
                    <div className="space-y-3">
                        {/* Mobile App Card */}
                        <div className="rounded-[1.5rem] bg-[#d2f34c] p-4 relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1">
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-black/5 rounded-tl-[1.5rem]" />
                            <div className="absolute -top-1 -right-1">
                                <div className="bg-white rounded-full p-3 shadow-sm">
                                    <ArrowUpRight size={14} className="text-black" />
                                </div>
                            </div>
                            <div className="mt-2 relative z-10">
                                <div className="text-black/80 mb-1">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80">
                                        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                    </svg>
                                </div>
                                <h4 className="text-xs font-black text-black leading-tight">
                                    Mobile App<br />Coming soon
                                </h4>
                            </div>
                        </div>

                        {/* Pro Version Card */}
                        <div className="rounded-[1.5rem] bg-[#2a2b36] p-4 relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1 border border-white/5">
                            <div className="absolute bottom-0 right-0 w-12 h-12 bg-white/5 rounded-tl-[1.5rem]" />
                            <div className="absolute -top-1 -right-1">
                                <div className="bg-[#d2f34c] rounded-full p-3 shadow-sm">
                                    <ArrowUpRight size={14} className="text-black" />
                                </div>
                            </div>
                            <div className="mt-2 relative z-10">
                                <div className="text-[#d2f34c] mb-1">
                                    <span className="text-xl">👑</span>
                                </div>
                                <h4 className="text-xs font-black text-white leading-tight">
                                    Pro version<br />Coming soon
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* User Profile / Logout tiny footer could go here if needed, but not in original design */}
                </div>
            </aside>
        </>
    );
}
