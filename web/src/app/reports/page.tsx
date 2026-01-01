import { AppShell } from "@/components/layout/AppShell"
import { ReportsCards } from "@/components/dashboard/ReportsCards"
import { ReportsAnalyticsChart } from "@/components/dashboard/ReportsAnalyticsChart"
import { ReportsDistributionChart } from "@/components/dashboard/ReportsDistributionChart"

export default function ReportsPage() {
    return (
        <AppShell>
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Reports & Analytics</h1>
                    <p className="text-slate-400 font-medium">Deep dive into your financial health.</p>
                </div>

                <div className="relative pt-2 space-y-8">
                    {/* Restored Pinned Cards */}
                    <ReportsCards />

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 h-[500px]">
                            <ReportsAnalyticsChart />
                        </div>
                        <div className="lg:col-span-1 min-h-[500px]">
                            <ReportsDistributionChart />
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    )
}
