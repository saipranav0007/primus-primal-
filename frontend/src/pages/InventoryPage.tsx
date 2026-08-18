import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Inventory } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Plus,
  RefreshCw,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingDown,
  X,
  History,
  Truck,
  Sparkles,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Supplier replenishment restock');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.getInventory({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      });
      if (res.success) setInventories(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleAdjustStock = async () => {
    if (!selectedInventory) return;
    try {
      const updated = await api.updateInventory(selectedInventory.id, {
        quantity: selectedInventory.quantity + Number(adjustQty),
        reason: adjustReason,
      });
      if (updated.success) {
        setAdjustModalOpen(false);
        fetchInventory();
        setSelectedInventory(null);
      }
    } catch (err) {
      console.error('Error adjusting inventory:', err);
    }
  };

  const totalValue = inventories.reduce((sum, inv) => sum + (inv.stockValue || inv.quantity * (inv.product?.price || 0)), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Inventory Operations & Valuation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-zone storage bin tracking, reservations, and predictive reorder insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Stock Value</span>
            <span className="text-lg font-mono font-bold text-cyan-300">
              ₹{(totalValue / 100000).toFixed(2)} Lakhs
            </span>
          </div>
          <button
            onClick={fetchInventory}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, product name, rack, or bin..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </form>

        {/* Status and Category Filter Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="HEALTHY">Healthy</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="OVERSTOCK">Overstock</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Audio & Peripherals">Audio & Peripherals</option>
            <option value="Wearables">Wearables</option>
            <option value="Smart Home">Smart Home</option>
            <option value="Computer Hardware">Computer Hardware</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-[#0D1424] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-4">SKU & Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Total Stock</th>
                <th className="py-3 px-4 text-right">Reserved</th>
                <th className="py-3 px-4 text-right">Available</th>
                <th className="py-3 px-4">Location (Rack / Bin)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Stock Value (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading inventory records...
                  </td>
                </tr>
              ) : inventories.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No inventory records match current filter criteria.
                  </td>
                </tr>
              ) : (
                inventories.map((inv) => {
                  const rackCode = inv.location?.rack?.code || 'A01';
                  const binCode = inv.location?.binCode || `${rackCode}-L1-B1`;
                  const value = inv.stockValue || inv.quantity * (inv.product?.price || 0);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-900/50 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={inv.product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-slate-700 bg-slate-950"
                          />
                          <div>
                            <span className="font-mono text-cyan-400 font-semibold">{inv.product?.sku}</span>
                            <p className="text-slate-200 font-medium truncate max-w-xs">{inv.product?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{inv.product?.category}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">{inv.quantity}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-amber-400">{inv.reserved}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">{inv.available}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {binCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={inv.status} type="stock" size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                        ₹{value.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedInventory(inv)}
                          className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                          title="Inspect Inventory Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

      {/* Detail & Reorder Prediction Drawer */}
      {selectedInventory && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedInventory(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-[#0D1424] border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 text-sm font-bold">
                        {selectedInventory.product?.sku}
                      </span>
                      <StatusBadge status={selectedInventory.status} type="stock" size="sm" />
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{selectedInventory.product?.name}</h3>
                    <p className="text-xs text-slate-400">{selectedInventory.product?.category}</p>
                  </div>
                  <button
                    onClick={() => setSelectedInventory(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Stock Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold block">TOTAL STOCK</span>
                    <span className="text-xl font-mono font-bold text-white">{selectedInventory.quantity}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center">
                    <span className="text-[10px] text-emerald-400 font-semibold block">AVAILABLE</span>
                    <span className="text-xl font-mono font-bold text-emerald-300">{selectedInventory.available}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center">
                    <span className="text-[10px] text-amber-400 font-semibold block">RESERVED</span>
                    <span className="text-xl font-mono font-bold text-amber-300">{selectedInventory.reserved}</span>
                  </div>
                </div>

                {/* Predictive Reorder Engine Intelligence Card */}
                {selectedInventory.reorderPrediction && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-[#101A2E] border border-cyan-800/40 mb-4 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                        PRIMAL REORDER ENGINE
                      </span>
                      <span className="text-xs font-mono font-semibold text-emerald-400">
                        {selectedInventory.reorderPrediction.daysRemaining} Days Left
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {selectedInventory.reorderPrediction.recommendationReason}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                      <div>Daily Demand: <b className="text-white">{selectedInventory.reorderPrediction.avgDailyDemand} units/day</b></div>
                      <div>Lead Time: <b className="text-white">{selectedInventory.reorderPrediction.supplierLeadTimeDays} days</b></div>
                      <div>Reorder Point: <b className="text-white">{selectedInventory.reorderPrediction.reorderPoint} units</b></div>
                      <div>Suggested PO: <b className="text-cyan-400">{selectedInventory.reorderPrediction.recommendedReorderQty} units</b></div>
                    </div>
                  </div>
                )}

                {/* Location Details */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-4 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-300">Storage Location Information</p>
                  <p className="text-slate-400 font-mono">
                    Bin Code: <b>{selectedInventory.location?.binCode || 'A01-L1-B1'}</b>
                  </p>
                  <p className="text-slate-400 font-mono">
                    Rack: <b>{selectedInventory.location?.rack?.code || 'A01'}</b> • Warehouse:{' '}
                    <b>{selectedInventory.warehouse?.code || 'WH-A (Bengaluru)'}</b>
                  </p>
                  <p className="text-slate-400 font-mono">
                    Batch: <b>{selectedInventory.batchNumber || 'BATCH-202401'}</b>
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => {
                    setAdjustQty(25);
                    setAdjustModalOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Restock / Adjust Qty</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModalOpen && selectedInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setAdjustModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0D1424] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl z-10">
            <h3 className="text-base font-bold text-white mb-1">Restock / Adjust Inventory</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedInventory.product?.name} ({selectedInventory.product?.sku})</p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Quantity Adjustment (+/-)</label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Reason / Movement Type</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold shadow"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
