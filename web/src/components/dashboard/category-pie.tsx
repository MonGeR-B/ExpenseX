"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
    { name: "Food", value: 400, color: "#ef4444" }, // Red
    { name: "Transport", value: 300, color: "#3b82f6" }, // Blue
    { name: "Entertainment", value: 300, color: "#10b981" }, // Emerald
    { name: "Utilities", value: 200, color: "#f59e0b" }, // Amber
]

export function CategoryPie() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    )
}
