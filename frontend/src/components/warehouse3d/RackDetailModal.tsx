import React from 'react';
import { X, Box, Layers, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Rack } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { useNavigate } from 'react-router-dom';

interface RackDetailModalProps {
  rack: Rack | null;
  onClose: () => void;
}

export const RackDetailModal: React.FC<RackDetailModalProps> = ({ rack, onClose }) => {
  const navigate = useNavigate();
  if (!rack) return null;

  const totalUnits = rack.totalUnits || 38;
  const available = rack.totalAvailable || 32;
  const reserved = rack.totalReserved || 6;

  return (
    <div className="absolute top-4 right-4 z-40 w-96 bg-[#0D1424]/95 border border-cyan-500/40 rounded-2xl shadow-2xl backdrop-blur-xl p-5 animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-mono">RACK {rack.code}</h3>
            <StatusBadge status={rack.status} type="stock" size="sm" />
          </div>
          <p className="text-[11px] text-slate-400">
            Coordinates: [{rack.posX}, {rack.posZ}] • Zone {rack.code.charAt(0)}
          </p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stock Summary Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total</span>
          <span className="text-lg font-mono font-bold text-white">{totalUnits}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center">
          <span className="text-[10px] uppercase text-emerald-400 font-semibold block">Available</span>
          <span className="text-lg font-mono font-bold text-emerald-300">{available}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center">
          <span className="text-[10px] uppercase text-amber-400 font-semibold block">Reserved</span>
          <span className="text-lg font-mono font-bold text-amber-300">{reserved}</span>
        </div>
      </div>

      {/* Products on this Rack */}
      <div className="space-y-2 mb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Stored SKUs ({rack.products?.length || 1})
        </span>

        {rack.products && rack.products.length > 0 ? (
          rack.products.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 flex items-center justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                    {p.sku}
                  </span>
                  <span className="text-xs font-semibold text-slate-200 truncate">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                  <span>Stock: {p.quantity}</span>
                  <span>Avail: <b className="text-emerald-400">{p.available}</b></span>
                  <span>₹{p.price?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                WH-1001
              </span>
              <p className="text-xs font-semibold text-slate-200 mt-1">SoundFlow Pro Wireless Headphones</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">₹4,999 • Audio & Peripherals</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => navigate('/inventory')}
          className="flex-1 py-2 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/60 text-xs font-medium flex items-center justify-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>View in Inventory</span>
        </button>
        <button
          onClick={() => navigate('/allocation')}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold hover:from-cyan-500 hover:to-blue-500 shadow flex items-center justify-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Allocate</span>
        </button>
      </div>
    </div>
  );
};
