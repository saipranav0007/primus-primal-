import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Layers,
  Activity,
  Boxes,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics(period);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#8B5CF6', '#06B6D4', '#10B981'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Period Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Warehouse Analytics & Throughput Intelligence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical fulfillment performance, pick velocities, and capacity density.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['today', '7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase font-mono transition-all ${
                period === p
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p === 'today' ? 'Today' : p}
            </button>
          ))}
          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white ml-1"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="py-32 text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-cyan-400">Aggregating warehouse operational data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Fulfillment Trend & Hourly Pick Velocity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fulfillment Rate Chart */}
            <div className="p-5 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Daily Orders vs Fulfillment (94% Baseline)</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-400">Avg 94.2%</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.fulfillmentTrends}>
                    <defs>
                      <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="fulfillGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '10px' }}
                    />
                    <Area type="monotone" dataKey="totalOrders" stroke="#06B6D4" fill="url(#orderGrad)" name="Total Orders" />
                    <Area type="monotone" dataKey="fulfilled" stroke="#10B981" fill="url(#fulfillGrad)" name="Fulfilled" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hourly Picking Velocity */}
            <div className="p-5 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Hourly Pick Velocity vs Target</span>
                </h3>
                <span className="text-[11px] font-mono text-cyan-400">Target: 110/hr</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourlyVelocity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '10px' }}
                    />
                    <Bar dataKey="units" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Actual Units Picked" />
                    <Bar dataKey="target" fill="#334155" radius={[4, 4, 0, 0]} name="Target Baseline" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Exception Breakdown & Top Moving Products */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Exceptions Donut Chart */}
            <div className="p-5 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white font-mono">Exception Distribution by Type</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.exceptionBreakdown}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {data.exceptionBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                {data.exceptionBreakdown.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate">{item.name} ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top High Velocity Products */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white font-mono">Top High-Velocity Dispatched SKUs</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.topProducts?.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-cyan-400 font-bold w-6 text-center">{idx + 1}</span>
                      <div>
                        <p className="text-slate-200 font-bold">{p.name}</p>
                        <span className="text-[10px] font-mono text-slate-400">{p.sku} • {p.category}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-white font-bold block">{p.unitsDispatched} units</span>
                      <span className="text-emerald-400 text-[11px]">₹{p.revenueInr?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
