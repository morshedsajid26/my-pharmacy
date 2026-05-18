import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Download, Calendar, Filter, TrendingUp, ArrowUpRight, DollarSign, Loader2 } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useReports } from "../hooks/useReports";

const reportData = [
  { name: 'Mon', sales: 4000, profit: 2400 },
  { name: 'Tue', sales: 3000, profit: 1398 },
  { name: 'Wed', sales: 2000, profit: 9800 },
  { name: 'Thu', sales: 2780, profit: 3908 },
  { name: 'Fri', sales: 1890, profit: 4800 },
  { name: 'Sat', sales: 2390, profit: 3800 },
  { name: 'Sun', sales: 3490, profit: 4300 },
];

export function Reports() {
  const { summary, categorySales, isLoading } = useReports();
  
  if (isLoading) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
        <p className="font-medium animate-pulse">Generating analytical reports...</p>
      </div>
    );
  }

  const stats = summary || {
    monthlySales: 0,
    yearlySales: 0,
    totalTransactions: 0
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Detailed analysis of your pharmacy performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar size={18} />
            <span>Select Date Range</span>
          </Button>
          <Button className="gap-2">
            <Download size={18} />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-medical-blue-600 to-medical-blue-800 text-white border-none">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                 <DollarSign size={24} />
              </div>
              <div>
                 <p className="text-medical-blue-100 text-sm font-medium">Monthly Revenue</p>
                 <h3 className="text-2xl font-bold mt-1">${stats.monthlySales.toLocaleString()}</h3>
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-medical-blue-100 uppercase tracking-wider">
              <TrendingUp size={14} />
              <span>Calculated dynamically</span>
           </div>
        </Card>

        <Card className="bg-gradient-to-br from-medical-green-600 to-medical-green-800 text-white border-none">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                 <ArrowUpRight size={24} />
              </div>
              <div>
                 <p className="text-medical-green-100 text-sm font-medium">Yearly Sales</p>
                 <h3 className="text-2xl font-bold mt-1">${stats.yearlySales.toLocaleString()}</h3>
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-medical-green-100 uppercase tracking-wider">
              <TrendingUp size={14} />
              <span>Real-time projection</span>
           </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                 <Filter size={24} />
              </div>
              <div>
                 <p className="text-slate-400 text-sm font-medium">Total Transactions</p>
                 <h3 className="text-2xl font-bold mt-1">{stats.totalTransactions?.toLocaleString() || 0}</h3>
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <TrendingUp size={14} />
              <span>Lifetime transactions</span>
           </div>
        </Card>
      </div>

      {/* Main Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Revenue Stream" subtitle="Revenue trends for the selected period">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Profit Margin Analysis" subtitle="Comparing daily profit across all categories">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Profit']}
                />
                <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Category Performance Matrix">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {(categorySales || [
              { label: "Tablets", percentage: 45, color: "bg-blue-500" },
              { label: "Capsules", percentage: 30, color: "bg-green-500" },
              { label: "Syrups", percentage: 15, color: "bg-amber-500" },
              { label: "Injections", percentage: 10, color: "bg-purple-500" },
            ]).map(item => (
              <div key={item.label} className="p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
                    <span className="text-sm font-bold text-slate-900">{item.percentage}%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color || 'bg-medical-blue-500'} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.percentage}%` }}></div>
                 </div>
              </div>
            ))}
         </div>
      </Card>
    </div>
  );
}
