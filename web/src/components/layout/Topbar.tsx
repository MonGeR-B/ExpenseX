// web/components/layout/Topbar.tsx
export function Topbar() {
    return (
        <header className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3 md:px-6">
            <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Dashboard
                </p>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                    Good evening, Baibhab
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <button className="hidden sm:inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
                    This month
                </button>
                <button className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-emerald-400">
                    + Add expense
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950 flex items-center justify-center text-xs font-semibold">
                    B
                </div>
            </div>
        </header>
    );
}
