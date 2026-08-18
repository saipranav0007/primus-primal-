import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order, Allocation } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  GitMerge,
  Sparkles,
  Check,
  X,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Building2,
  Box,
  Layers,
  ArrowRight,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AllocationPage: React.FC = () => {
  const [unallocatedOrders, setUnallocatedOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [allocationPlan, setAllocationPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.getOrders({ stage: 'CREATED' });
      if (res.success) {
        setUnallocatedOrders(res.data);
        if (res.data.length > 0 && !selectedOrder) {
          evaluateOrder(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching unallocated orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const evaluateOrder = async (order: Order) => {
    setSelectedOrder(order);
    setLoading(true);
    setSuccessMessage(null);
    try {
      const res = await api.evaluateAllocation(order.id);
      if (res.success) {
        setAllocationPlan(res.data.allocationPlan);
      }
    } catch (err) {
      console.error('Error evaluating allocation plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setApproving(true);
    try {
      // First advance or approve allocation
      const res = await api.advanceOrderStage(selectedOrder.id, { targetStage: 'ALLOCATED' });
      if (res.success) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setSuccessMessage(`Allocation plan approved for ${selectedOrder.orderNumber}! Stock reserved & picking task queued.`);
        setTimeout(() => {
          fetchOrders();
        }, 1500);
      }
    } catch (err) {
      console.error('Error approving allocation:', err);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <GitMerge className="w-6 h-6 text-cyan-400" />
            <span>Intelligent Inventory Allocation Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic strategy solver: Full, Split, Cross-Warehouse, Backorder & Priority Reservations.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Orders Queue */}
        <div className="p-5 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
              Awaiting Allocation ({unallocatedOrders.length})
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              FIFO + Priority
            </span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {unallocatedOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">No orders currently pending allocation.</p>
            ) : (
              unallocatedOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const firstItem = order.items?.[0];

                return (
                  <div
                    key={order.id}
                    onClick={() => evaluateOrder(order)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-400 font-bold text-xs">{order.orderNumber}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          order.priorityScore >= 85
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        Priority {order.priorityScore}/100
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200 mt-1">{order.customerName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {firstItem?.product?.name} (Qty: {firstItem?.requestedQty || 1})
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                      <span>Value: ₹{order.orderValue?.toLocaleString('en-IN')}</span>
                      <span>SLA: {new Date(order.slaDeadline).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Allocation Intelligence Decision Workbench */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl space-y-5">
          {loading ? (
            <div className="py-32 text-center">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono text-cyan-400">Computing Multi-Warehouse Allocation Strategies...</p>
            </div>
          ) : !selectedOrder || !allocationPlan ? (
            <div className="py-32 text-center text-slate-500">
              <Layers className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">Select an order from the queue to evaluate allocation strategy.</p>
            </div>
          ) : (
            <>
              {/* Active Order Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 text-base font-extrabold">{selectedOrder.orderNumber}</span>
                    <StatusBadge status={selectedOrder.shippingType} type="sla" size="sm" />
                  </div>
                  <p className="text-xs text-slate-200 font-semibold mt-0.5">{selectedOrder.customerName} • {selectedOrder.customerCity}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Order Value</span>
                  <span className="text-base font-mono font-bold text-white">
                    ₹{selectedOrder.orderValue?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* The PRIMAL Recommendation Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#101A2E] to-[#12213D] border border-cyan-500/50 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono text-xs font-bold uppercase">
                      STRATEGY: {allocationPlan.strategy}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                    {allocationPlan.confidenceScore}% Confidence
                  </span>
                </div>

                {/* Recommendation Details */}
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {allocationPlan.recommendedAction}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{allocationPlan.reason}</p>
                </div>

                {/* Expected Impact Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-900/60 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Expected Operational Impact</span>
                  </div>
                  <p className="text-slate-300">{allocationPlan.expectedImpact}</p>
                </div>

                {/* Multi-Location Split Breakdown */}
                {allocationPlan.allocationsBreakdown && allocationPlan.allocationsBreakdown.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-mono">
                      Allocation Source Breakdown
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {allocationPlan.allocationsBreakdown.map((b: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono text-cyan-400 font-bold">{b.warehouse}</span>
                            <p className="text-slate-300 font-medium">Rack {b.rack} • Bin {b.bin}</p>
                          </div>
                          <span className="font-mono font-extrabold text-emerald-400 text-sm">
                            {b.quantity} Units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{approving ? 'Allocating Inventory...' : 'APPLY RECOMMENDATION'}</span>
                  </button>

                  <button
                    onClick={() => setAllocationPlan((p: any) => ({ ...p, strategy: 'PARTIAL' }))}
                    className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    MODIFY
                  </button>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 hover:bg-red-900/40 text-xs font-semibold"
                  >
                    REJECT
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
