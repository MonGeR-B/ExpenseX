// web/components/layout/AppShell.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-transparent text-white font-sans">
            <div className="flex">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col min-h-screen relative">
                    <Topbar onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 px-6 py-8 relative z-10 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
