"use client";

import { LayoutGrid, ArrowLeftRight, PieChart, BarChart3, Folder, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutGrid },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/budgets", label: "Budgets", icon: PieChart },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/categories", label: "Categories", icon: Folder },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 bottom-safe bg-[#111]/80 backdrop-blur-xl border-t border-white/10 pb-4 pt-2">
            <div className="flex justify-around items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[3.5rem]",
                                isActive
                                    ? "text-[#d2f34c]"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <div className={cn(
                                "transition-transform duration-200",
                                isActive && "transform -translate-y-1"
                            )}>
                                <item.icon size={20} absoluteStrokeWidth strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#d2f34c] shadow-[0_0_8px_#d2f34c]" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-wide transition-opacity",
                                isActive ? "opacity-100" : "opacity-0 scale-0 h-0"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
