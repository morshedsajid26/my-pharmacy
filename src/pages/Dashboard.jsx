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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  Package, 
  AlertTriangle, 
  XCircle,
  Loader2
} from "lucide-react";
import { Card } from "../components/Card";
import { useReports } from "../hooks/useReports";

const salesData = [
  { name: 'Jan', sales: 4000, purchase: 2400 },
  { name: 'Feb', sales: 3000, purchase: 1398 },
  { name: 'Mar', sales: 2000, purchase: 9800 },
  { name: 'Apr', sales: 2780, purchase: 3908 },
  { name: 'May', sales: 1890, purchase: 4800 },
  { name: 'Jun', sales: 2390, purchase: 3800 },
];

const categoryData = [
  { name: 'Tablet', value: 400 },
  { name: 'Capsule', value: 300 },
  { name: 'Syrup', value: 300 },
  { name: 'Injection', value: 200 },
];

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

const SummaryCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, isCurrency = true }) => (
  <Card className="hover:translate-y-[-4px] transition-transform duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">
          {isCurrency ? `$${value?.toLocaleString() || 0}` : value?.toLocaleString() || 0}
        </h3>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendValue}% from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </Card>
);

export function Dashboard() {
  const { summary, isLoading } = useReports();

  if (isLoading) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
        <p className="font-medium animate-pulse">Loading dashboard statistics...</p>
      </div>
    );
  }

  // Fallback if data is not yet available
  const stats = summary || {
    todaySales: 0,
    todayPurchase: 0,
    monthlySales: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    stockOutCount: 0
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Today Total Sales" 
          value={stats.todaySales} 
          icon={ShoppingCart} 
          trend="up" 
          trendValue="12"
          colorClass="bg-medical-blue-500"
        />
        <SummaryCard 
          title="Today Purchase" 
          value={stats.todayPurchase} 
          icon={Truck} 
          trend="down" 
          trendValue="5"
          colorClass="bg-medical-green-500"
        />
        <SummaryCard 
          title="Monthly Sales" 
          value={stats.monthlySales} 
          icon={BarChart3} 
          trend="up" 
          trendValue="8"
          colorClass="bg-amber-500"
        />
        <SummaryCard 
          title="Total Stock Value" 
          value={stats.totalStockValue} 
          icon={Package} 
          colorClass="bg-indigo-500"
        />
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-full">
              <AlertTriangle className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Low Stock Medicines</p>
              <p className="text-2xl font-bold text-slate-900">{stats.lowStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-full">
              <XCircle className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Stock Out Medicines</p>
              <p className="text-2xl font-bold text-slate-900">{stats.stockOutCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Monthly Sales & Purchase" subtitle="Visualizing revenue vs expense">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="purchase" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Daily Sales Trend" subtitle="Sales performance over the last 7 days">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Category Wise Sales" subtitle="Sales distribution by medicine category">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-slate-500 font-medium">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
