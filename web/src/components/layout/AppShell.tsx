// web/components/layout/AppShell.tsx
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-transparent text-white font-sans">
            <div className="flex">
                <Sidebar />
                <div className="flex-1 flex flex-col min-h-screen relative">
                    <Topbar />
                    <main className="flex-1 px-6 py-8 relative z-10 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
