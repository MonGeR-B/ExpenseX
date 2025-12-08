"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

const data = [
    { day: "Mon", amount: 40 },
    { day: "Tue", amount: 30 },
    { day: "Wed", amount: 110 },
    { day: "Thu", amount: 85 },
    { day: "Fri", amount: 150 },
    { day: "Sat", amount: 200 },
    { day: "Sun", amount: 90 },
]

export function SpendingChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="font-bold text-muted-foreground">Amount</span>
                                        <span className="font-bold">${payload[0].value}</span>
                                    </div>
                                </div>
                            )
                        }
                        return null
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
