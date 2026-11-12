"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card } from "@/components/Card";

export const COLORS = [
  "#0d5c46",
  "#64748b",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#0284c7",
];

const CustomTooltip = ({ active, payload, label, prefix = "৳" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800 shadow-lg text-xs font-mono space-y-1.5">
        <p className="font-semibold text-slate-400 border-b border-slate-800 pb-1">
          {label}
        </p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex justify-between gap-5 items-center">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span
                className="w-2 h-2 rounded-xs"
                style={{ backgroundColor: item.color }}
              />
              <span className="capitalize font-sans">{item.name}:</span>
            </span>
            <span className="font-bold text-white">
              {prefix}
              {Number(item.value).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts({ salesData, activeRange, onRangeChange }) {
  const ranges = [
    { id: "day", label: "Daily" },
    { id: "month", label: "Monthly" },
    { id: "year", label: "Yearly" },
  ];

  return (
    <div className="space-y-4">
      {/* Range Selector Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white px-5 py-4 rounded-xl border border-slate-200/85 gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Financial Performance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare revenue, inventory procurement, and net profit margins
          </p>
        </div>
        <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/70 p-1 rounded-lg self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => onRangeChange(r.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeRange === r.id
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales & Purchase Bar Chart */}
        <Card
          title={
            activeRange === "day"
              ? "Daily Sales vs. Purchase"
              : activeRange === "year"
                ? "Yearly Sales vs. Purchase"
                : "Monthly Sales vs. Purchase"
          }
          subtitle={
            activeRange === "day"
              ? "Last 7 days gross sales compared to purchase outlay"
              : activeRange === "year"
                ? "5-year revenue vs. procurement comparison"
                : "12-month revenue vs. procurement comparison"
          }
        >
          <div className="h-80 w-full min-w-0 min-h-[320px] mt-2">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={320}
            >
              <BarChart
                data={salesData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontWeight: 500 }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `৳${value}`}
                  tick={{ fill: "#64748b", fontWeight: 500 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar
                  name="Sales"
                  dataKey="sales"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                  barSize={activeRange === "day" ? 30 : 20}
                />
                <Bar
                  name="Purchase"
                  dataKey="purchase"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  barSize={activeRange === "day" ? 30 : 20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Net Profit Trend Line Chart */}
        <Card
          title={
            activeRange === "day"
              ? "Daily Net Profit Trend"
              : activeRange === "year"
                ? "Yearly Net Profit Trend"
                : "Monthly Net Profit Trend"
          }
          subtitle={
            activeRange === "day"
              ? "Realized daily net earnings"
              : activeRange === "year"
                ? "Realized annual net earnings"
                : "Realized net earnings over the past 12 months"
          }
        >
          <div className="h-80 w-full min-w-0 min-h-[320px] mt-2">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={320}
            >
              <LineChart
                data={salesData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontWeight: 500 }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `৳${value}`}
                  tick={{ fill: "#64748b", fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  name="Profit"
                  type="monotone"
                  dataKey="profit"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{
                    r: 3.5,
                    stroke: "#fff",
                    strokeWidth: 2,
                    fill: "#0d9488",
                  }}
                  activeDot={{
                    r: 5,
                    stroke: "#0d9488",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
