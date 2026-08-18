import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Zap, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LiveEventBanner: React.FC = () => {
  const { lastLiveEvent } = useWarehouse();
  const [visible, setVisible] = useState(false);
  const [eventData, setEventData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (lastLiveEvent) {
      setEventData(lastLiveEvent);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [lastLiveEvent]);

  if (!visible || !eventData) return null;

  const getEventTitle = (type: string) => {
    switch (type) {
      case 'order.created':
        return 'New Order Ingested';
      case 'order.priority.changed':
        return 'Priority Engine Recalibrated';
      case 'allocation.approved':
        return 'Inventory Allocation Approved';
      case 'picking.started':
        return '3D Picking Task Dispatched';
      case 'packing.rebalanced':
        return 'Workforce Rebalanced';
      case 'exception.created':
        return 'Warehouse Exception Detected';
      case 'exception.resolved':
        return 'Exception Resolved by PRIMAL';
      case 'demo.scenario.started':
        return 'Live Demo Scenario Triggered';
      default:
        return 'Warehouse Operational Event';
    }
  };

  const getNavPath = (type: string) => {
    if (type.includes('order')) return '/orders';
    if (type.includes('allocation')) return '/allocation';
    if (type.includes('picking')) return '/picking-packing';
    if (type.includes('exception')) return '/exceptions';
    return '/';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-xl bg-[#0D1424]/95 border border-cyan-500/40 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 mt-0.5">
          <Zap className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-cyan-300 font-mono uppercase tracking-wide">
              {getEventTitle(eventData.type)}
            </h5>
            <span className="text-[10px] text-slate-500 font-mono">{eventData.timestamp}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
            {eventData.payload?.message ||
              eventData.payload?.details ||
              eventData.payload?.order?.orderNumber ||
              eventData.payload?.exception?.description ||
              `Real-time WebSocket event received: ${eventData.type}`}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs">
            <button
              onClick={() => {
                navigate(getNavPath(eventData.type));
                setVisible(false);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1 group"
            >
              <span>Inspect Event</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={() => setVisible(false)} className="text-slate-500 hover:text-slate-300 text-[11px]">
              Dismiss
            </button>
          </div>
        </div>
        <button onClick={() => setVisible(false)} className="text-slate-500 hover:text-slate-300 p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
