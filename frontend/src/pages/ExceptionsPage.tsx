import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Exception } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Flame,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Check,
  X,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ExceptionsPage: React.FC = () => {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedException, setSelectedException] = useState<Exception | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolutionSuccess, setResolutionSuccess] = useState<string | null>(null);

  const fetchExceptions = async () => {
    setLoading(true);
    try {
      const res = await api.getExceptions({
        severity: severityFilter !== 'ALL' ? severityFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
      });
      if (res.success) setExceptions(res.data);
    } catch (err) {
      console.error('Error fetching exceptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, [severityFilter, statusFilter, typeFilter]);

  const handleResolve = async (exc: Exception) => {
    setResolving(true);
    try {
      const res = await api.resolveException(exc.id, `Resolved via PRIMAL Intelligence: ${exc.primalRecommendation}`);
      if (res.success) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setResolutionSuccess(`Exception ${exc.exceptionNumber} resolved successfully! Operational state reconciled.`);
        setTimeout(() => {
          setResolutionSuccess(null);
          fetchExceptions();
          setSelectedException(null);
        }, 1500);
      }
    } catch (err) {
      console.error('Error resolving exception:', err);
    } finally {
      setResolving(false);
    }
  };

  const openCount = exceptions.filter((e) => e.status !== 'RESOLVED').length;
  const criticalCount = exceptions.filter((e) => (e.severity === 'CRITICAL' || e.severity === 'HIGH') && e.status !== 'RESOLVED').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <span>Warehouse Exception & Incident Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            <b>EXCEPTION &rarr; INTELLIGENCE &rarr; DECISION &rarr; ACTION &rarr; RESOLUTION</b>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-300">
            Critical Alerts: <b className="font-bold">{criticalCount}</b>
          </div>
          <button
            onClick={fetchExceptions}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Resolution Toast */}
      {resolutionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{resolutionSuccess}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800 flex flex-wrap items-center gap-3 shadow-lg">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical Severity</option>
          <option value="HIGH">High Severity</option>
          <option value="MEDIUM">Medium Severity</option>
          <option value="LOW">Low Severity</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="ACTION_REQUIRED">Action Required</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All 10+ Exception Types</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="ALLOCATION_CONFLICT">Allocation Conflict</option>
          <option value="DAMAGED_ITEM">Damaged SKU</option>
          <option value="SLA_RISK">SLA Risk</option>
          <option value="WAREHOUSE_CONGESTION">Warehouse Congestion</option>
          <option value="PICKING_DELAY">Picking Delay</option>
          <option value="WRONG_SKU">Wrong SKU Mismatch</option>
        </select>
      </div>

      {/* Exceptions Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-cyan-400">Loading incident registry...</p>
        </div>
      ) : exceptions.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-[#0D1424] rounded-2xl border border-slate-800">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
          <p className="text-sm font-semibold text-slate-300">All exceptions resolved!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exceptions.map((exc) => {
            const isCritical = exc.severity === 'CRITICAL';
            const isResolved = exc.status === 'RESOLVED';

            return (
              <div
                key={exc.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isResolved
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-75'
                    : isCritical
                    ? 'bg-gradient-to-br from-red-950/30 via-slate-900 to-slate-900 border-red-800/80 shadow-xl shadow-red-950/20'
                    : 'bg-[#0D1424] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold text-xs">{exc.exceptionNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
                        {exc.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={exc.severity} type="sla" size="sm" />
                      <StatusBadge status={exc.status} type="exception" size="sm" />
                    </div>
                  </div>

                  {/* Problem Description */}
                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">{exc.description}</h3>

                  {/* Impact Box */}
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-3 text-xs">
                    <span className="text-[10px] text-red-400 font-mono uppercase font-bold block mb-0.5">
                      Operational Impact
                    </span>
                    <p className="text-slate-300">{exc.impact}</p>
                  </div>

                  {/* PRIMAL Recommendation */}
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/50 mb-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>PRIMAL Recommendation</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {exc.confidenceScore}% Confidence
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium leading-relaxed">{exc.primalRecommendation}</p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(exc.createdAt).toLocaleTimeString()}
                  </span>

                  {!isResolved ? (
                    <button
                      onClick={() => handleResolve(exc)}
                      disabled={resolving}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{resolving ? 'Resolving...' : 'Accept & Resolve'}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
