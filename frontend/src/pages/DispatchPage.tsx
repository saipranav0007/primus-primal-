import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shipment } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Navigation,
  RefreshCw,
  Send,
  Building,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DispatchPage: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await api.getShipments({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        carrier: carrierFilter !== 'ALL' ? carrierFilter : undefined,
      });
      if (res.success) setShipments(res.data);
    } catch (err) {
      console.error('Error loading shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter, carrierFilter]);

  const handleDispatch = async (shipment: Shipment) => {
    setDispatchingId(shipment.id);
    try {
      const res = await api.updateShipment(shipment.id, { status: 'DISPATCHED' });
      if (res.success) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        fetchShipments();
      }
    } catch (err) {
      console.error('Error dispatching shipment:', err);
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-cyan-400" />
            <span>Carrier Dispatch & Outbound Logistics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Carrier handovers, tracking numbers (Delhivery, BlueDart, DTDC), and delivery timeframes.
          </p>
        </div>

        <button
          onClick={fetchShipments}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800 flex flex-wrap items-center gap-3 shadow-lg">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Dispatch Statuses</option>
          <option value="READY">Ready for Handover</option>
          <option value="DISPATCHING">Dispatching</option>
          <option value="DISPATCHED">Dispatched</option>
          <option value="DELAYED">Delayed</option>
          <option value="DELIVERED">Delivered</option>
        </select>

        <select
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Carriers</option>
          <option value="DELHIVERY">Delhivery Surface & Express</option>
          <option value="BLUEDART">BlueDart Aviation</option>
          <option value="DTDC">DTDC Air Cargo</option>
        </select>
      </div>

      {/* Shipments List */}
      <div className="rounded-2xl bg-[#0D1424] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-4">Tracking Number</th>
                <th className="py-3 px-4">Order ID & Customer</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dispatch Time</th>
                <th className="py-3 px-4">Estimated Delivery</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading dispatch registry...
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No shipments found matching filter criteria.
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">{s.trackingNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-300 font-bold">{s.order?.orderNumber}</span>
                      <p className="text-slate-400 font-medium text-[11px]">{s.order?.customerName}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
                        {s.carrier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">{s.destinationCity}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} type="order" size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {s.dispatchTime ? new Date(s.dispatchTime).toLocaleTimeString() : 'Pending Staging'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString('en-IN') : 'TBD'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.status === 'READY' ? (
                        <button
                          onClick={() => handleDispatch(s)}
                          disabled={dispatchingId === s.id}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-[11px] shadow flex items-center gap-1 mx-auto"
                        >
                          <Send className="w-3 h-3" />
                          <span>{dispatchingId === s.id ? 'Dispatching...' : 'Dispatch'}</span>
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-mono text-xs flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Handed Over</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
