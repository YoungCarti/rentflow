"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { occupancyChart } from "@/lib/data";

export default function OccupancyLineChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={occupancyChart} margin={{ top: 8, right: 4, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[60, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, "Occupancy Rate"]}
          contentStyle={{
            fontSize: 13,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        />
        <ReferenceLine
          y={80}
          stroke="#86efac"
          strokeDasharray="4 4"
          label={{
            value: "Target 80%",
            fill: "#16a34a",
            fontSize: 11,
            position: "insideTopRight",
          }}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
