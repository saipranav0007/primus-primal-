import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  ShoppingCart,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  X,
  Sparkles,
  Sliders,
  RefreshCw,
  UserCheck,
  Building,
  FileText,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [overrideScore, setOverrideScore] = useState<number>(90);
  const [overrideReason, setOverrideReason] = useState('Tier-1 VIP Enterprise SLA requirement');
  const [advancing, setAdvancing] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({
        stage: stageFilter !== 'ALL' ? stageFilter : undefined,
        search: search || undefined,
      });
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [stageFilter]);

  const handleAdvanceStage = async () => {
    if (!selectedOrder) return;
    setAdvancing(true);
    try {
      const res = await api.advanceOrderStage(selectedOrder.id);
      if (res.success) {
        setSelectedOrder(res.data);
        fetchOrders();
      }
    } catch (err) {
      console.error('Error advancing order stage:', err);
    } finally {
      setAdvancing(false);
    }
  };

  const handleOverridePriority = async () => {
    if (!selectedOrder) return;
    try {
      const res = await api.prioritizeOrder(selectedOrder.id, {
        overrideScore,
        overrideReason,
      });
      if (res.success) {
        setSelectedOrder(res.data);
        fetchOrders();
      }
    } catch (err) {
      console.error('Error overriding priority:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-cyan-400" />
            <span>Order Pipeline & SLA Prioritization</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic 0–100 Priority Scoring, real-time SLA countdowns, and automated wave progression.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            placeholder="Search by Order ID, customer, or city..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'CREATED', 'PRIORITIZED', 'ALLOCATED', 'PICKING', 'PACKING', 'QC', 'READY', 'DISPATCHED'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  stageFilter === st
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#0D1424] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-4">Order ID & Customer</th>
                <th className="py-3 px-4">Items / SKU</th>
                <th className="py-3 px-4 text-right">Value (₹)</th>
                <th className="py-3 px-4 text-center">Priority Score</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4">SLA Risk</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const firstItem = o.items?.[0];
                  const hoursRemaining = (new Date(o.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60);

                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-cyan-400 font-bold block">{o.orderNumber}</span>
                        <p className="text-slate-200 font-semibold mt-0.5">{o.customerName}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{o.customerCity}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-200 font-medium truncate max-w-xs">{firstItem?.product?.name || 'Assorted Tech SKUs'}</p>
                        <span className="text-[10px] font-mono text-slate-400">Qty: {firstItem?.requestedQty || 1} units</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        ₹{o.orderValue?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
                            o.priorityScore >= 85
                              ? 'bg-red-950/70 text-red-300 border-red-800 shadow-sm shadow-red-950'
                              : o.priorityScore >= 70
                              ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          {o.priorityScore}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={o.stage} type="order" size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {hoursRemaining > 0 ? (
                          <span className={hoursRemaining <= 2 ? 'text-amber-400 font-bold' : ''}>
                            {hoursRemaining.toFixed(1)}h left
                          </span>
                        ) : (
                          <span className="text-red-400 font-bold">BREACHED</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={o.slaRisk} type="sla" size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(o);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/60 text-xs font-medium"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Priority Scorecard Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-[#0D1424] border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 text-base font-extrabold">{selectedOrder.orderNumber}</span>
                      <StatusBadge status={selectedOrder.stage} type="order" size="sm" />
                      <StatusBadge status={selectedOrder.slaRisk} type="sla" size="sm" />
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{selectedOrder.customerName}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedOrder.customerCity} • Shipping: {selectedOrder.shippingType}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Priority Scorecard Box: "WHY THIS PRIORITY?" */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-[#101A2E] border border-cyan-800/40 mb-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                      WHY THIS PRIORITY?
                    </span>
                    <span className="text-sm font-mono font-extrabold text-cyan-300">
                      Score: {selectedOrder.priorityScore}/100
                    </span>
                  </div>

                  <div className="space-y-2 mt-3 text-xs">
                    {selectedOrder.priorityExplanationParsed?.factors ? (
                      selectedOrder.priorityExplanationParsed.factors.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                          <div>
                            <span className="font-semibold text-slate-200">{f.name}</span>
                            <p className="text-[10px] text-slate-400">{f.reason}</p>
                          </div>
                          <span className="font-mono font-bold text-cyan-400">+{f.impact}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-1 text-[11px] text-slate-400">
                        <p>Critical SLA Window: <b className="text-cyan-400">+35</b></p>
                        <p>Express Shipping Slot: <b className="text-cyan-400">+25</b></p>
                        <p>Tier-1 Customer Order: <b className="text-cyan-400">+15</b></p>
                        <p>Order Age Dwell: <b className="text-cyan-400">+14</b></p>
                      </div>
                    )}
                  </div>

                  {/* Manager Override Section */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block mb-1">
                      Manager Priority Override
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={overrideScore}
                        onChange={(e) => setOverrideScore(Number(e.target.value))}
                        className="flex-1 accent-cyan-400"
                      />
                      <span className="font-mono font-bold text-cyan-400 text-xs w-10">{overrideScore}</span>
                      <button
                        onClick={handleOverridePriority}
                        className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold hover:bg-cyan-900"
                      >
                        Override
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-2 mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Ordered SKUs ({selectedOrder.items?.length || 1})
                  </span>
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-cyan-400 font-semibold">{item.product?.sku}</span>
                        <p className="text-slate-200 font-bold mt-0.5">{item.product?.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Qty: {item.requestedQty} × ₹{item.unitPrice?.toLocaleString('en-IN')}</p>
                      </div>
                      <span className="font-mono font-bold text-white">
                        ₹{(item.requestedQty * item.unitPrice)?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advance Stage Action Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <button
                  onClick={handleAdvanceStage}
                  disabled={advancing || selectedOrder.stage === 'DISPATCHED'}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{advancing ? 'Processing...' : `Advance Stage to Next Step`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
