"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CardsAndCharts } from "@/components/dashboard/CardsAndCharts";
import { RecentTable } from "@/components/dashboard/RecentTable";
import { ExpenseFilters } from "@/components/dashboard/ExpenseFilters";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

import { addMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

function StreakCalendar() {
    const [streakData, setStreakData] = useState<{ dates: string[], current_streak: number }>({ dates: [], current_streak: 0 });
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [month, setMonth] = useState<Date>(new Date()); // Control the view month manually

    useEffect(() => {
        api.get("/stats/streak").then(res => setStreakData(res.data)).catch(console.error);
    }, []);

    // Helper to check if a day has an expense
    const hasExpense = (day: Date | undefined) => {
        if (!day) return false;
        try {
            const dateString = day.toISOString().split('T')[0];
            return streakData.dates.includes(dateString);
        } catch (e) {
            return false;
        }
    };

    const handlePrevMonth = () => setMonth(prev => addMonths(prev, -1));
    const handleNextMonth = () => setMonth(prev => addMonths(prev, 1));

    return (
        <Card className="rounded-[1.5rem] bg-white/20 backdrop-blur-md border border-white/20 shadow-xl w-full max-w-[280px] flex flex-col overflow-hidden group font-sans">
            <CardContent className="h-full w-full p-4 flex flex-col">

                {/* Custom Header Row: Streak -> Month -> Nav */}
                <div className="flex items-center justify-start gap-2 w-full mb-2">
                    {/* 1. Streak Badge */}
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
                        <span className="text-sm">🔥</span>
                        <span className="text-xs font-black text-rose-500">{streakData.current_streak}</span>
                    </div>

                    {/* 2. Month Name */}
                    <span className="text-base font-black text-slate-800 tracking-tight">
                        {format(month, "MMMM yyyy")}
                    </span>

                    {/* 3. Navigation Arrows */}
                    <div className="flex items-center gap-0.5 ml-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-slate-400 hover:text-slate-900"
                            onClick={handlePrevMonth}
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-slate-400 hover:text-slate-900"
                            onClick={handleNextMonth}
                        >
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                <Calendar
                    mode="single"
                    month={month}
                    onMonthChange={setMonth}
                    selected={date}
                    onSelect={setDate}
                    className="w-full p-0"
                    formatters={{ formatCaption: () => "" }}
                    styles={{
                        caption: { display: "none" },
                        caption_label: { display: "none" }
                    }}
                    classNames={{
                        months: "w-full h-full flex flex-col",
                        month: "w-full h-full flex flex-col",
                        caption: "hidden", // Hide default header
                        caption_label: "hidden", // Hide label specifically
                        nav: "hidden",    // Hide default nav
                        table: "w-full border-collapse",
                        // Week Header: CSS Grid for perfect alignment
                        head_row: "grid grid-cols-7 w-full mb-1 bg-slate-50/50 rounded-full py-0.5",
                        head_cell: "text-slate-400 font-bold text-[0.65rem] uppercase tracking-widest text-center flex items-center justify-center",
                        // Date Rows: CSS Grid to match Header
                        row: "grid grid-cols-7 w-full mt-0",
                        cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20 h-8 flex items-center justify-center",
                        day: cn(
                            "h-7 w-7 p-0 font-medium text-slate-700 hover:bg-zinc-100 rounded-full transition-all text-xs"
                        ),
                        day_selected: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20",
                        day_today: "text-slate-900 font-black",
                    }}
                    modifiers={{ hasExpense: (date: Date) => hasExpense(date) }}
                    components={{
                        Day: ({ date, displayMonth, ...props }: any) => {
                            // In react-day-picker v9, the prop might be 'date' or part of a 'day' object.
                            // We attempt to resolve the actual Date object.
                            const actualDate = date || props.day?.date || props.day;

                            // If we still don't have a valid date, do not render.
                            if (!actualDate || typeof actualDate.getDate !== 'function') return <td className="p-0"></td>;

                            // Sanitize props: remove 'day' and 'modifiers' if they exist in props and shouldn't be passed to button
                            const { day: _day, modifiers: _modifiers, ...buttonProps } = props;

                            const isStreakDay = hasExpense(actualDate);
                            const isSelected = props["aria-selected"] === true;

                            return (
                                <td className="p-0 text-center text-sm focus-within:relative focus-within:z-20">
                                    <button
                                        {...buttonProps}
                                        type="button"
                                        className={cn(
                                            "h-7 w-7 p-0 font-semibold flex items-center justify-center relative rounded-full transition-all group/day focus:outline-none ring-0 outline-none text-xs",
                                            props.className,
                                            // Grey circle background for expense days (as requested)
                                            isStreakDay && !isSelected && "bg-slate-200 text-slate-900 font-bold hover:bg-slate-300",
                                            // Selected state overrides everything
                                            isSelected && "bg-slate-900 text-white scale-105",
                                        )}
                                    >
                                        <span className="relative z-10">{actualDate.getDate()}</span>
                                    </button>
                                </td>
                            )
                        }
                    }}
                />
            </CardContent>
        </Card>
    );
}

import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { DistributionCard } from "@/components/dashboard/DistributionCard";
import ImmersiveReveal from "@/components/ui/ImmersiveReveal";

// ... existing imports ...

import { useAuthStore } from "@/store/auth";
import { AddExpenseDialog } from "@/components/dashboard/AddExpenseDialog";

// ... existing imports ...

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch Redis Data (Summary Stats) to trigger "Loading" phase
        // The child components will likely fetch again but it will be a Cache HIT.
        api.get("/stats/summary")
            .then(() => {
                // Add a tiny buffer for smoothness so it doesn't flash too fast if Redis is instant
                setTimeout(() => setIsLoading(false), 600);
            })
            .catch((err) => {
                console.error("Dashboard pre-fetch failed", err);
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="space-y-4 -m-4 p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8 min-h-full relative">


            <ImmersiveReveal isLoading={isLoading} />

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-100 drop-shadow-sm">
                        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{user?.username || 'User'}</span> 👋
                    </h1>
                    <p className="text-slate-100 font-bold mt-1 text-sm md:text-base">
                        Here's your financial overview.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/categories">
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-black transition-colors bg-white/30 hover:bg-white/50 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/40 shadow-sm">
                            <Settings2 className="h-4 w-4" />
                            Manage Categories
                        </button>
                    </Link>

                    <AddExpenseDialog>
                        <button className="group relative inline-flex items-center justify-center rounded-2xl bg-[#111] px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition-all shadow-xl shadow-black/10">
                            <span className="mr-2 text-base text-[#d2f34c] font-black">+</span> Add Expense
                        </button>
                    </AddExpenseDialog>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-4">
                {/* Left Column (Main Content) - Expands to fill space */}
                <div className="flex-1 min-w-0 space-y-4">
                    <CardsAndCharts />
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="w-full xl:w-[60%]">
                            <AnalyticsChart />
                        </div>
                        <div className="w-full xl:w-[40%]">
                            <RecentTable />
                        </div>
                    </div>
                </div>

                {/* Right Column (Side Widgets) - Fixed Width */}
                <div className="w-full xl:w-auto flex-none flex flex-col items-center xl:items-end gap-4 pr-1">
                    <div className="w-full max-w-[280px]">
                        <StreakCalendar />
                    </div>
                    <div className="w-full max-w-[280px]">
                        <DistributionCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
