import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'cyan' | 'emerald' | 'amber' | 'crimson' | 'purple' | 'blue';
  prefix?: string;
  suffix?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  color = 'cyan',
  prefix,
  suffix,
  onClick,
}) => {
  const colorMap = {
    cyan: {
      bg: 'from-cyan-950/30 to-blue-950/20',
      border: 'border-cyan-800/40 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-950/60 border-cyan-800/60 text-cyan-400',
      glow: 'shadow-cyan-950/30',
      text: 'text-cyan-400',
    },
    emerald: {
      bg: 'from-emerald-950/30 to-teal-950/20',
      border: 'border-emerald-800/40 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400',
      glow: 'shadow-emerald-950/30',
      text: 'text-emerald-400',
    },
    amber: {
      bg: 'from-amber-950/30 to-orange-950/20',
      border: 'border-amber-800/40 hover:border-amber-500/50',
      iconBg: 'bg-amber-950/60 border-amber-800/60 text-amber-400',
      glow: 'shadow-amber-950/30',
      text: 'text-amber-400',
    },
    crimson: {
      bg: 'from-red-950/30 to-pink-950/20',
      border: 'border-red-800/40 hover:border-red-500/50',
      iconBg: 'bg-red-950/60 border-red-800/60 text-red-400',
      glow: 'shadow-red-950/30',
      text: 'text-red-400',
    },
    purple: {
      bg: 'from-purple-950/30 to-indigo-950/20',
      border: 'border-purple-800/40 hover:border-purple-500/50',
      iconBg: 'bg-purple-950/60 border-purple-800/60 text-purple-400',
      glow: 'shadow-purple-950/30',
      text: 'text-purple-400',
    },
    blue: {
      bg: 'from-blue-950/30 to-sky-950/20',
      border: 'border-blue-800/40 hover:border-blue-500/50',
      iconBg: 'bg-blue-950/60 border-blue-800/60 text-blue-400',
      glow: 'shadow-blue-950/30',
      text: 'text-blue-400',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl bg-gradient-to-br ${scheme.bg} bg-[#0E1526]/80 backdrop-blur-md border ${scheme.border} ${
        onClick ? 'cursor-pointer' : ''
      } transition-all duration-200 hover:-translate-y-0.5 shadow-lg ${scheme.glow} group`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</span>
        <div className={`p-2 rounded-lg border ${scheme.iconBg} transition-transform group-hover:scale-110`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        {prefix && <span className="text-sm font-semibold text-slate-400">{prefix}</span>}
        <span className="text-2xl font-bold font-mono tracking-tight text-white">{value}</span>
        {suffix && <span className="text-xs text-slate-400 ml-1">{suffix}</span>}
      </div>

      {(subtitle || change) && (
        <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {change && (
            <span
              className={`flex items-center gap-1 font-mono font-medium ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
