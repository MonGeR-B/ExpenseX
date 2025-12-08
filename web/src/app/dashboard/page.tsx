// web/app/dashboard/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { CardsAndCharts } from "@/components/dashboard/CardsAndCharts";
import { RecentTable } from "@/components/dashboard/RecentTable";

export default function DashboardPage() {
    return (
        <AppShell>
            <div className="space-y-6">
                <CardsAndCharts />
                <RecentTable />
            </div>
        </AppShell>
    );
}
