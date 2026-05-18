'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Card } from "@/components/Card";

export const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label, prefix = '৳' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl border border-slate-800 shadow-xl backdrop-blur-sm text-xs font-mono space-y-1">
        <p className="font-bold text-slate-400 mb-1">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex justify-between gap-4 items-center">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="capitalize">{item.name}:</span>
            </span>
            <span className="font-bold">{prefix}{Number(item.value).toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts({ salesData, activeRange, onRangeChange }) {
  const ranges = [
    { id: 'day', label: 'Per Day' },
    { id: 'month', label: 'Monthly' },
    { id: 'year', label: 'Yearly' },
  ];

  return (
    <div className="space-y-6">
      {/* Range Selector Switcher */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-5 rounded-2xl border border-slate-100/70 shadow-xl shadow-slate-100/50 gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Analytics Overview</h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Filter graphs by daily, monthly, or yearly scopes</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => onRangeChange(r.id)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeRange === r.id
                  ? "bg-medical-blue-600 text-white shadow-lg shadow-medical-blue-900/25"
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales & Purchase Bar Chart */}
        <Card 
          className="shadow-xl shadow-slate-100/50 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
          title={
            activeRange === 'day' 
              ? "Daily Sales & Purchase" 
              : activeRange === 'year' 
                ? "Yearly Sales & Purchase" 
                : "Monthly Sales & Purchase"
          } 
          subtitle={
            activeRange === 'day' 
              ? "Visualizing last 7 days revenue vs expense" 
              : activeRange === 'year' 
                ? "Visualizing last 5 years revenue vs expense" 
                : "Visualizing revenue vs expense over the last 12 months"
          }
        >
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="name" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b', fontWeight: 500 }}
                />
                <YAxis 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `৳${value}`} 
                  tick={{ fill: '#64748b', fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar name="Sales" dataKey="sales" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={activeRange === 'day' ? 36 : 24} />
                <Bar name="Purchase" dataKey="purchase" fill="#10b981" radius={[6, 6, 0, 0]} barSize={activeRange === 'day' ? 36 : 24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Net Profit Trend Line Chart */}
        <Card 
          className="shadow-xl shadow-slate-100/50 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
          title={
            activeRange === 'day' 
              ? "Daily Net Profit Trend" 
              : activeRange === 'year' 
                ? "Yearly Net Profit Trend" 
                : "Monthly Net Profit Trend"
          } 
          subtitle={
            activeRange === 'day' 
              ? "Visualizing actual daily net earnings" 
              : activeRange === 'year' 
                ? "Visualizing actual yearly net earnings" 
                : "Visualizing actual net earnings over the last 12 months"
          }
        >
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="name" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b', fontWeight: 500 }}
                />
                <YAxis 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `৳${value}`} 
                  tick={{ fill: '#64748b', fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  name="Profit"
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: '#10b981' }} 
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
