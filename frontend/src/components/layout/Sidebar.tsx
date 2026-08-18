import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Layers,
  ShoppingBag,
  ShoppingCart,
  GitMerge,
  PackageCheck,
  AlertTriangle,
  Truck,
  BarChart3,
  Sparkles,
  Terminal,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { dashboard, activeExceptions } = useWarehouse();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/live-warehouse', label: 'Live Warehouse', icon: Box, badge: '3D', badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { to: '/inventory', label: 'Inventory', icon: Layers, badge: dashboard?.kpis?.lowStock ? `${dashboard.kpis.lowStock} Low` : undefined, badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { to: '/products', label: 'Products', icon: ShoppingBag },
    { to: '/orders', label: 'Orders', icon: ShoppingCart, badge: dashboard?.kpis?.activeOrders ? `${dashboard.kpis.activeOrders}` : undefined, badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { to: '/allocation', label: 'Allocation Engine', icon: GitMerge, badge: 'AI', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { to: '/picking-packing', label: 'Picking & Packing', icon: PackageCheck },
    {
      to: '/exceptions',
      label: 'Exceptions',
      icon: AlertTriangle,
      badge: activeExceptions.length > 0 ? `${activeExceptions.length}` : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
    },
    { to: '/dispatch', label: 'Dispatch', icon: Truck },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/decision-center', label: 'AI Decision Center', icon: Sparkles, badge: 'Active', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { to: '/command-center', label: 'Command Center', icon: Terminal, highlight: true },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19]/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-wider text-xl text-white">PRIMAL</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">OPS</span>
          </div>
          <p className="text-[10px] text-slate-400 tracking-tight">Intelligent Warehouse Operations</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Warehouse Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group ${
                  item.highlight
                    ? isActive
                      ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/60 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/50'
                      : 'bg-cyan-950/30 text-cyan-400 border border-cyan-900/40 hover:bg-cyan-900/40 hover:border-cyan-500/30'
                    : isActive
                    ? 'bg-slate-800/80 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${item.highlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] text-slate-300 font-mono">CORE ONLINE</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/80">v1.0.0</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 truncate">See. Decide. Fulfill.</p>
      </div>
    </aside>
  );
};
