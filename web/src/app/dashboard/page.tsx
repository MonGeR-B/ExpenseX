import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardsAndCharts } from "@/components/dashboard/CardsAndCharts";
import { RecentTable } from "@/components/dashboard/RecentTable";
import { ExpenseFilters } from "@/components/dashboard/ExpenseFilters";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent transform hover:scale-105 transition-transform cursor-default">
                        Your Wealth Universe
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 font-semibold">
                        Track, Analyze, and Dominate your finances.
                    </p>
                </div>
                <Link href="/categories" className="w-full sm:w-auto">
                    <Button className="gap-2 bg-white text-black hover:bg-slate-200 font-bold rounded-xl border-0">
                        <Settings2 className="h-4 w-4" />
                        Manage Categories
                    </Button>
                </Link>
            </div>

            <CardsAndCharts />

            <div className="space-y-4">
                <ExpenseFilters />
                <RecentTable />
            </div>
        </div>
    );
}
