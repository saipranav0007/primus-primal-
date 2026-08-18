import React from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { KPICard } from '../components/ui/KPICard';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  IndianRupee,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  TrendingUp,
  Zap,
  Timer,
  Layers,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Activity,
  Boxes,
  Truck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OverviewPage: React.FC = () => {
  const { dashboard, loading, runDemoScenario, resetDemoState } = useWarehouse();
  const navigate = useNavigate();

  if (loading || !dashboard) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-mono text-cyan-400">Loading PRIMAL Command Center...</p>
        </div>
      </div>
    );
  }

  const { kpis, warehouseStatus, statusMessage, pipelineStages, bottlenecks, recentActivities } = dashboard;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Hero Banner: Dynamic Warehouse Status */}
      <div
        className={`p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${
          warehouseStatus === 'OPERATIONAL'
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/90 border-emerald-800/40 shadow-xl shadow-emerald-950/20'
            : warehouseStatus === 'WARNING'
            ? 'bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900/90 border-amber-800/40 shadow-xl shadow-amber-950/20'
            : 'bg-gradient-to-r from-red-950/50 via-slate-900/80 to-slate-900/90 border-red-800/50 shadow-xl shadow-red-950/30'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={`p-3.5 rounded-2xl border ${
                warehouseStatus === 'OPERATIONAL'
                  ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                  : warehouseStatus === 'WARNING'
                  ? 'bg-amber-950 border-amber-800 text-amber-400'
                  : 'bg-red-950 border-red-800 text-red-400 animate-pulse'
              }`}
            >
              {warehouseStatus === 'OPERATIONAL' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : warehouseStatus === 'WARNING' ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <Flame className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  WAREHOUSE STATUS
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-full border ${
                    warehouseStatus === 'OPERATIONAL'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : warehouseStatus === 'WARNING'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-red-950 text-red-300 border-red-700'
                  }`}
                >
                  {warehouseStatus}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">{statusMessage}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated dynamically across active SLA windows, packing queues, and inventory health.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              onClick={() => navigate('/command-center')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-950 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Live Demo Flow</span>
            </button>
            <button
              onClick={() => navigate('/decision-center')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-600 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Decisions</span>
            </button>
          </div>
        </div>
      </div>

      {/* 12 Enterprise KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Core Warehouse Metrics
          </h3>
          <span className="text-[11px] text-slate-400">Live telemetry updated in real-time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Inventory Value"
            value={`₹${((kpis.totalInventoryValue || 0) / 100000).toFixed(2)}L`}
            subtitle="Current warehouse asset base"
            icon={IndianRupee}
            color="cyan"
            change="+4.8%"
            isPositive={true}
            onClick={() => navigate('/inventory')}
          />
          <KPICard
            title="Total Active SKUs"
            value={kpis.totalSKUs}
            subtitle="Catalog across 4 categories"
            icon={Package}
            color="blue"
            onClick={() => navigate('/products')}
          />
          <KPICard
            title="Orders Today"
            value={kpis.ordersToday}
            subtitle={`${kpis.activeOrders} in fulfillment pipeline`}
            icon={ShoppingCart}
            color="purple"
            change="+18%"
            isPositive={true}
            onClick={() => navigate('/orders')}
          />
          <KPICard
            title="Fulfillment Rate"
            value={`${kpis.fulfillmentRate}%`}
            subtitle="Target baseline: 95%"
            icon={TrendingUp}
            color="emerald"
            isPositive={kpis.fulfillmentRate >= 90}
            change={kpis.fulfillmentRate >= 90 ? '+2.4%' : '-1.8%'}
            onClick={() => navigate('/analytics')}
          />
          <KPICard
            title="Pending Orders"
            value={kpis.pendingOrders}
            subtitle="Awaiting allocation & pick"
            icon={Clock}
            color="amber"
            onClick={() => navigate('/orders')}
          />
          <KPICard
            title="Ready For Dispatch"
            value={kpis.readyForDispatch}
            subtitle="QC passed & staged at dock"
            icon={Truck}
            color="emerald"
            onClick={() => navigate('/dispatch')}
          />
          <KPICard
            title="Low / Critical Stock"
            value={`${kpis.lowStock + kpis.criticalStock}`}
            subtitle={`${kpis.criticalStock} critical risk items`}
            icon={AlertTriangle}
            color="amber"
            onClick={() => navigate('/inventory')}
          />
          <KPICard
            title="Out of Stock SKUs"
            value={kpis.outOfStock}
            subtitle="Immediate supplier PO required"
            icon={Flame}
            color="crimson"
            onClick={() => navigate('/inventory')}
          />
          <KPICard
            title="Avg Pick Time"
            value={`${kpis.avgPickTimeMin}m`}
            subtitle="Optimized 31% via TSP path"
            icon={Timer}
            color="cyan"
            isPositive={true}
            change="-31% dist"
            onClick={() => navigate('/picking-packing')}
          />
          <KPICard
            title="Warehouse Utilization"
            value={`${kpis.warehouseUtilization}%`}
            subtitle="Nominal storage capacity"
            icon={Boxes}
            color="blue"
            onClick={() => navigate('/live-warehouse')}
          />
          <KPICard
            title="Active Exceptions"
            value={kpis.activeExceptions}
            subtitle={`${kpis.criticalExceptions} critical severity`}
            icon={ShieldAlert}
            color={kpis.activeExceptions > 0 ? 'crimson' : 'emerald'}
            onClick={() => navigate('/exceptions')}
          />
          <KPICard
            title="Dispatched Parcels"
            value={kpis.dispatchedOrders}
            subtitle="Carrier handovers today"
            icon={CheckCircle2}
            color="emerald"
            onClick={() => navigate('/dispatch')}
          />
        </div>
      </div>

      {/* Live Order Pipeline Stepper */}
      <div className="p-5 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Live Order Fulfillment Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400">Continuous end-to-end stage progression</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {pipelineStages.map((stage, idx) => (
            <div
              key={stage.stage}
              onClick={() => navigate(`/orders?stage=${stage.stage}`)}
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-0.5 text-center group shadow"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  Step {idx + 1}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">{stage.label}</p>
              <span className="text-xl font-mono font-bold text-white mt-1 block">{stage.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottlenecks Alert & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Bottleneck / Priority Action Card */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0E1628] to-[#121D33] border border-cyan-800/40 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                RECOMMENDED ACTION
              </span>
              <span className="text-xs text-emerald-400 font-mono font-semibold">94% Confidence</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5">
              {bottlenecks && bottlenecks.length > 0
                ? bottlenecks[0].description
                : 'Urgent Order SLA Risk for ORD-1048'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {bottlenecks && bottlenecks.length > 0
                ? bottlenecks[0].recommendation
                : 'Split allocate 7 units from WH-A Rack A12 and source remaining 3 units from WH-B Rack C09.'}
            </p>
            <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p><b>Impact:</b> 72% reduction in SLA breach penalty.</p>
              <p><b>Strategy:</b> Multi-warehouse cross-docking wave.</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={() => navigate('/decision-center')}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Recommendation</span>
            </button>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Warehouse Activity Stream</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Auto-synced via Socket.IO</span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <div>
                      <p className="text-slate-200 font-medium">{act.details}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{act.action}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No recent activity logs.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
