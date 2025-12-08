// web/components/layout/AppShell.tsx
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <div className="flex">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Topbar />
                    <main className="flex-1 px-4 py-4 md:px-6 md:py-6 bg-[radial-gradient(circle_at_top_left,#020617,#020617_55%,#000)]">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
