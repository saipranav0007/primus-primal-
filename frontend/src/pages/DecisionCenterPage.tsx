import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DecisionCard } from '../types';
import {
  Sparkles,
  Zap,
  Check,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Cpu,
  BrainCircuit,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DecisionCenterPage: React.FC = () => {
  const [decisions, setDecisions] = useState<DecisionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingIdx, setExecutingIdx] = useState<number | null>(null);
  const [executedIds, setExecutedIds] = useState<Set<number>>(new Set());

  const fetchDecisions = async () => {
    setLoading(true);
    try {
      const res = await api.getDecisions();
      if (res.success) setDecisions(res.data);
    } catch (err) {
      console.error('Error fetching decision recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  const handleExecute = async (decision: DecisionCard, index: number) => {
    setExecutingIdx(index);
    try {
      const res = await api.executeDecision(decision.actionPayload);
      if (res.success) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setExecutedIds((prev) => new Set(prev).add(index));
        setTimeout(() => {
          fetchDecisions();
        }, 1200);
      }
    } catch (err) {
      console.error('Error executing decision:', err);
    } finally {
      setExecutingIdx(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span>AI Decision Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic operations intelligence continuously answering: <b>"WHAT SHOULD THE WAREHOUSE DO NEXT?"</b>
          </p>
        </div>

        <button
          onClick={fetchDecisions}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Re-Evaluate</span>
        </button>
      </div>

      {/* Decision Cards List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-cyan-400">Synthesizing multi-engine warehouse telemetry...</p>
        </div>
      ) : decisions.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-[#0D1424] rounded-2xl border border-slate-800">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
          <p className="text-sm font-semibold text-slate-300">All warehouse subsystems operating in equilibrium.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {decisions.map((d, idx) => {
            const isExecuted = executedIds.has(idx) || d.status === 'EXECUTED';
            const isExecuting = executingIdx === idx;

            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isExecuted
                    ? 'bg-slate-900/40 border-emerald-800/60 shadow-lg shadow-emerald-950/20'
                    : 'bg-gradient-to-br from-slate-900 via-[#0D1629] to-[#111F38] border-cyan-500/40 shadow-2xl shadow-cyan-950/30'
                }`}
              >
                <div className="space-y-4">
                  {/* Category & Confidence */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold uppercase">
                      {d.category?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-800">
                      {d.confidenceScore}% Confidence
                    </span>
                  </div>

                  {/* Problem Identified */}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-red-400 font-bold tracking-wider block mb-1">
                      Problem Identified
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">{d.problem}</h3>
                  </div>

                  {/* Telemetry Considered */}
                  {d.dataConsidered && Object.keys(d.dataConsidered).length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs">
                      <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1.5">
                        Telemetry Considered
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                        {Object.entries(d.dataConsidered).map(([k, v], i) => (
                          <div key={i} className="truncate">
                            <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                            <b className="text-white">{String(v)}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Decision */}
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-700/60 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block">
                      Recommended Decision
                    </span>
                    <p className="text-sm font-extrabold text-white leading-snug">{d.decision}</p>
                    <p className="text-xs text-slate-300 pt-1 leading-relaxed">{d.reason}</p>
                  </div>

                  {/* Expected Impact */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300">
                    <span className="font-bold">Expected Impact:</span> {d.expectedImpact}
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Status: {isExecuted ? 'EXECUTED' : 'PENDING APPROVAL'}</span>

                  {isExecuted ? (
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Decision Executed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExecute(d, idx)}
                      disabled={isExecuting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{isExecuting ? 'Executing Decision...' : 'Apply Decision'}</span>
                    </button>
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
