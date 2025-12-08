// web/components/dashboard/RecentTable.tsx
"use client";

import { recentExpenses } from "./mock-data";

export function RecentTable() {
    return (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/40">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Recent expenses</h2>
                <button className="text-xs text-slate-400 hover:text-slate-200">
                    View all
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-slate-400 border-b border-slate-800">
                            <th className="py-2 text-left font-normal">Date</th>
                            <th className="py-2 text-left font-normal">Category</th>
                            <th className="py-2 text-left font-normal">Description</th>
                            <th className="py-2 text-right font-normal">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentExpenses.map((exp) => (
                            <tr
                                key={exp.id}
                                className="border-b border-slate-900 last:border-0"
                            >
                                <td className="py-2 text-slate-300">
                                    {exp.date}
                                </td>
                                <td className="py-2 text-slate-200">
                                    {exp.category}
                                </td>
                                <td className="py-2 text-slate-400 text-xs">
                                    {exp.description}
                                </td>
                                <td className="py-2 text-right font-medium text-slate-50">
                                    ₹{exp.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
