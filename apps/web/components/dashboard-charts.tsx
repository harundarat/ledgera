"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatCompactCurrency,
  formatCurrency,
  type CashFlowPoint,
  type TransactionMixPoint,
} from "@/lib/ledger";

const mixColors = [
  "var(--chart-primary)",
  "var(--chart-secondary)",
  "var(--chart-tertiary)",
];

export function CashFlowChart({
  data,
}: Readonly<{ data: CashFlowPoint[] }>) {
  return (
    <div
      aria-label="Cash flow chart comparing money in and money out"
      className="h-64 w-full"
      role="img"
    >
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ bottom: 0, left: -12, right: 4, top: 12 }}
        >
          <CartesianGrid
            stroke="var(--chart-grid)"
            strokeDasharray="0"
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="label"
            fontSize={11}
            stroke="var(--muted)"
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            fontSize={11}
            stroke="var(--muted)"
            tickFormatter={(value) => formatCompactCurrency(Number(value))}
            tickLine={false}
            width={72}
          />
          <Tooltip
            contentStyle={{
              background: "var(--overlay)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "var(--overlay-shadow)",
              color: "var(--overlay-foreground)",
            }}
            cursor={{ fill: "var(--default)", opacity: 0.5 }}
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              name === "inflow" ? "Money in" : "Money out",
            ]}
            labelStyle={{ color: "var(--muted)" }}
          />
          <Bar
            dataKey="inflow"
            fill="var(--chart-primary)"
            isAnimationActive={false}
            maxBarSize={28}
            radius={[8, 8, 2, 2]}
          />
          <Bar
            dataKey="outflow"
            fill="var(--chart-secondary)"
            isAnimationActive={false}
            maxBarSize={28}
            radius={[8, 8, 2, 2]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TransactionMixChart({
  data,
}: Readonly<{ data: TransactionMixPoint[] }>) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: mixColors[index],
  }));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_9rem] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_8.5rem]">
      <div
        aria-label={`Transaction mix chart with ${total} transactions`}
        className="relative h-56 min-w-0"
        role="img"
      >
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius="58%"
              isAnimationActive={false}
              nameKey="label"
              outerRadius="82%"
              paddingAngle={3}
              stroke="var(--surface)"
              strokeWidth={3}
            />
            <Tooltip
              contentStyle={{
                background: "var(--overlay)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                boxShadow: "var(--overlay-shadow)",
                color: "var(--overlay-foreground)",
              }}
              formatter={(value) => [`${value} transactions`, "Activity"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">{total}</span>
          <span className="text-xs text-muted">transactions</span>
        </div>
      </div>

      <ul className="space-y-3" aria-label="Transaction mix legend">
        {chartData.map((item) => (
          <li
            key={item.type}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="flex items-center gap-2 text-muted">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ background: item.fill }}
              />
              {item.label}
            </span>
            <span className="font-semibold tabular-nums">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
