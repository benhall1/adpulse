"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  date: string;
  ctr?: number;
  cpm?: number;
  spend?: number;
  frequency?: number;
  fatigueScore?: number;
}

const COLORS = {
  ctr: "#3b82f6",
  cpm: "#f59e0b",
  spend: "#22c55e",
  frequency: "#a855f7",
  fatigueScore: "#ef4444",
};

const LABELS: Record<string, string> = {
  ctr: "CTR (%)",
  cpm: "CPM ($)",
  spend: "Spend ($)",
  frequency: "Frequency",
  fatigueScore: "Fatigue Score",
};

export function PerformanceChart({
  data,
  lines = ["ctr", "cpm"],
}: {
  data: DataPoint[];
  lines?: (keyof typeof COLORS)[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#a3a3a3", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#262626" }}
        />
        <YAxis
          tick={{ fill: "#a3a3a3", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#262626" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#171717",
            border: "1px solid #262626",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          labelStyle={{ color: "#a3a3a3" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
        />
        {lines.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={LABELS[key] || key}
            stroke={COLORS[key]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
