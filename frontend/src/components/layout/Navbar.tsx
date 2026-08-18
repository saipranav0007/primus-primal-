import React, { useState } from 'react';
import {
  Search,
  Bell,
  Building2,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { NotificationDrawer } from './NotificationDrawer';
import { GlobalSearchModal } from './GlobalSearchModal';

export const Navbar: React.FC = () => {
  const { dashboard, activeWarehouseId, setActiveWarehouseId, unreadNotificationCount, isConnected, runDemoScenario } = useWarehouse();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const status = dashboard?.warehouseStatus || 'OPERATIONAL';

  const handleQuickDemo = async () => {
    setDemoLoading(true);
    try {
      await runDemoScenario('URGENT_ORDER');
    } finally {
      setTimeout(() => setDemoLoading(false), 1000);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Global Search Trigger */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs transition-all duration-200 group shadow-inner"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span>Search SKUs, orders, racks, exceptions...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded shadow">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions & Status Badges */}
        <div className="flex items-center gap-3.5">
          {/* Dynamic Warehouse Status Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide ${
              status === 'OPERATIONAL'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50 shadow-sm shadow-emerald-950'
                : status === 'WARNING'
                ? 'bg-amber-950/40 text-amber-400 border-amber-800/50 shadow-sm shadow-amber-950'
                : 'bg-red-950/40 text-red-400 border-red-800/50 shadow-sm shadow-red-950 animate-pulse'
            }`}
          >
            {status === 'OPERATIONAL' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : status === 'WARNING' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Flame className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className="font-mono uppercase text-[11px]">{status}</span>
          </div>

          {/* WebSocket Hub Connectivity */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400"
            title={isConnected ? 'Real-time WebSocket connection active' : 'Connecting to real-time hub...'}
          >
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
            <span className="hidden md:inline">{isConnected ? 'LIVE SYNC' : 'OFFLINE'}</span>
          </div>

          {/* Warehouse Selector */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setActiveWarehouseId('wh-a')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeWarehouseId === 'wh-a'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>WH-A (BLR)</span>
            </button>
            <button
              onClick={() => setActiveWarehouseId('wh-b')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeWarehouseId === 'wh-b'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>WH-B (HYD)</span>
            </button>
          </div>

          {/* Quick Demo Trigger */}
          <button
            onClick={handleQuickDemo}
            disabled={demoLoading}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 text-xs font-medium transition-all active:scale-95 shadow-sm"
          >
            <Zap className={`w-3.5 h-3.5 text-cyan-400 ${demoLoading ? 'animate-spin' : ''}`} />
            <span>{demoLoading ? 'Simulating...' : 'Simulate Urgent Order'}</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[10px] font-mono font-bold text-slate-950 flex items-center justify-center animate-bounce">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs border border-cyan-400/40 shadow">
              VM
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">Vikram Malhotra</p>
              <p className="text-[10px] text-slate-400">Operations Manager</p>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
