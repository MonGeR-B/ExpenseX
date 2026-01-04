import { AppShell } from "@/components/layout/AppShell"
import { TransactionsList } from "@/components/dashboard/TransactionsList"

export default function TransactionsPage() {
    return (
        <AppShell>
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Transactions</h1>
                    <p className="text-slate-400 font-medium">All your spending history in one place.</p>
                </div>

                <div className="relative pt-6">

                    {/* The Card */}
                    <div className="relative overflow-hidden md:rounded-[2.5rem] bg-transparent md:bg-black/20 md:backdrop-blur-xl border-none md:border md:border-white/20 p-0 md:p-8 md:shadow-2xl">
                        <TransactionsList />
                    </div>
                </div>
            </div>
        </AppShell>
    )
}
