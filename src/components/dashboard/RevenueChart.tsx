"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type RevenueChartPoint = {
  month: string;
  revenue: number;
};

function formatRM(value: number) {
  return `RM ${value.toLocaleString()}`;
}

export default function RevenueChart({ data }: { data: RevenueChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          formatter={(value) => [formatRM(Number(value)), "Revenue"]}
          contentStyle={{
            fontSize: 13,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#1d4ed8"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
