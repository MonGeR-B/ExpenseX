"use client"

import { AppShell } from "@/components/layout/AppShell"
import { CardsAndCharts } from "@/components/dashboard/CardsAndCharts"

export default function ReportsPage() {
    return (
        <AppShell>
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Analytics</h1>
                    <p className="text-slate-400 font-medium">Deep dive into where your money goes.</p>
                </div>

                {/* We just render the Charts component directly as it already has its own cards. 
                    However, we might want to wrap it or let it span full width.
                    Since CardsAndCharts has a grid of cards, we'll leave it as is but wrap it if needed.
                    Actually, let's wrap it in a 'Reports' container card to match the requested style, or just let the internal cards shine.
                    The user said "redesign ./reports", so let's wrap the whole thing in a "Dashboard" style pin-board feel.
                */}

                <div className="relative pt-6">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-50 border-2 border-indigo-200 p-8 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-indigo-900">Financial Insights</h2>
                            <p className="text-indigo-700/60 font-semibold">Your complete financial health report.</p>
                        </div>
                        <CardsAndCharts />
                    </div>
                </div>
            </div>
        </AppShell>
    )
}
