"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useFormatCurrency } from "@/context/StoreConfigContext"

export function Overview({ data }: { data: any[] }) {
    const formatCurrency = useFormatCurrency();

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    stroke="#E5E7EB"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6B7280" }}
                    dy={10}
                />
                <YAxis
                    stroke="#E5E7EB"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fill: "#6B7280" }}
                    width={80}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                    itemStyle={{ color: "#111827", fontSize: "12px" }}
                    labelStyle={{ color: "#6B7280", fontSize: "11px", marginBottom: "4px" }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}


