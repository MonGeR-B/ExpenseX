"use client";

import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full bg-transparent text-white font-sans flex flex-col">
            <Topbar />
            <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 relative z-10 overflow-y-auto overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
