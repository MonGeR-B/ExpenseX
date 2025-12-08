// web/components/layout/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "#", label: "Expenses" },
    { href: "#", label: "Analytics" },
    { href: "#", label: "Settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex md:flex-col md:w-60 border-r border-slate-800 bg-[radial-gradient(circle_at_top_left,#020617,#020617)]">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-400 to-violet-500 flex items-center justify-center text-slate-950 font-bold">
                    ₹
                </div>
                <div>
                    <div className="text-sm font-semibold tracking-tight">ExpenseX</div>
                    <div className="text-xs text-slate-400">Personal finance</div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-xl px-3 py-2 text-sm transition",
                                active
                                    ? "bg-emerald-500 text-slate-950"
                                    : "text-slate-300 hover:bg-slate-900"
                            )}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500">
                v0.1 · Personal build
            </div>
        </aside>
    );
}
