// web/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">ExpenseX</h1>
        <p className="text-slate-400">
          Go to your dashboard (static v1).
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
