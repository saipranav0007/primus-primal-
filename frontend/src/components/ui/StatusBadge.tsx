import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'stock' | 'order' | 'sla' | 'station' | 'exception';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'stock', size = 'sm' }) => {
  const normalized = (status || '').toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (type === 'stock') {
    switch (normalized) {
      case 'HEALTHY':
        colorClasses = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
        break;
      case 'LOW_STOCK':
      case 'LOW':
        colorClasses = 'bg-amber-950/60 text-amber-300 border-amber-800/60';
        break;
      case 'CRITICAL':
        colorClasses = 'bg-orange-950/60 text-orange-300 border-orange-800/60';
        break;
      case 'OUT_OF_STOCK':
        colorClasses = 'bg-red-950/60 text-red-300 border-red-800/60 font-semibold';
        break;
      case 'OVERSTOCK':
        colorClasses = 'bg-blue-950/60 text-blue-300 border-blue-800/60';
        break;
    }
  } else if (type === 'order') {
    switch (normalized) {
      case 'CREATED':
        colorClasses = 'bg-slate-900 text-slate-300 border-slate-700';
        break;
      case 'PRIORITIZED':
        colorClasses = 'bg-sky-950/60 text-sky-300 border-sky-800/60';
        break;
      case 'ALLOCATED':
        colorClasses = 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60';
        break;
      case 'PICKING':
        colorClasses = 'bg-yellow-950/60 text-yellow-300 border-yellow-800/60';
        break;
      case 'PACKING':
        colorClasses = 'bg-orange-950/60 text-orange-300 border-orange-800/60';
        break;
      case 'QC':
        colorClasses = 'bg-pink-950/60 text-pink-300 border-pink-800/60';
        break;
      case 'READY':
        colorClasses = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
        break;
      case 'DISPATCHED':
        colorClasses = 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60';
        break;
    }
  } else if (type === 'sla') {
    switch (normalized) {
      case 'LOW':
        colorClasses = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
        break;
      case 'MEDIUM':
        colorClasses = 'bg-amber-950/60 text-amber-300 border-amber-800/60';
        break;
      case 'HIGH':
        colorClasses = 'bg-red-950/60 text-red-300 border-red-800/60 animate-pulse';
        break;
      case 'BREACHED':
        colorClasses = 'bg-rose-950 text-rose-200 border-rose-700 font-bold animate-pulse';
        break;
    }
  } else if (type === 'exception') {
    switch (normalized) {
      case 'OPEN':
        colorClasses = 'bg-amber-950/60 text-amber-300 border-amber-800/60';
        break;
      case 'ACTION_REQUIRED':
        colorClasses = 'bg-red-950/70 text-red-300 border-red-800/80 font-semibold animate-pulse';
        break;
      case 'INVESTIGATING':
        colorClasses = 'bg-blue-950/60 text-blue-300 border-blue-800/60';
        break;
      case 'RESOLVED':
        colorClasses = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
        break;
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider rounded-md border ${colorClasses} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{status?.replace(/_/g, ' ')}</span>
    </span>
  );
};
