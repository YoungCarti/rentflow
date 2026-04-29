"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ReportChartPoint } from "@/lib/reports";

type RevenueBarChartProps = {
  data: ReportChartPoint[];
};

export default function RevenueBarChart({ data }: RevenueBarChartProps) {
  const avg =
    data.length === 0
      ? 0
      : Math.round(data.reduce((sum, item) => sum + item.revenue, 0) / data.length);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `RM ${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          formatter={(value) => [`RM ${Number(value).toLocaleString()}`, "Revenue"]}
          contentStyle={{
            fontSize: 13,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        />
        <ReferenceLine
          y={avg}
          stroke="#94a3b8"
          strokeDasharray="4 4"
          label={{
            value: `Avg RM ${(avg / 1000).toFixed(1)}k`,
            fill: "#94a3b8",
            fontSize: 11,
            position: "insideTopRight",
          }}
        />
        <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={index === data.length - 1 ? "#1d4ed8" : "#bfdbfe"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
