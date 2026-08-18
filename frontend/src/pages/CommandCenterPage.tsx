import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import {
  Terminal,
  Zap,
  Play,
  RotateCcw,
  Flame,
  AlertTriangle,
  Clock,
  Package,
  Layers,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CommandCenterPage: React.FC = () => {
  const { runDemoScenario, resetDemoState } = useWarehouse();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isLiveDemoRunning, setIsLiveDemoRunning] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const scenarios = [
    {
      id: 'URGENT_ORDER',
      title: 'Simulate Urgent Order',
      desc: 'Injects Tier-1 order with 1.2h SLA cutoff and allocation conflict.',
      icon: Zap,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'STOCKOUT',
      title: 'Simulate Stockout',
      desc: 'Depletes stock of high-velocity SKU, triggering reorder intelligence.',
      icon: Flame,
      color: 'from-red-600 to-orange-600',
    },
    {
      id: 'DAMAGED_ITEM',
      title: 'Simulate Damaged Item',
      desc: 'Logs QC defect during final packing and auto-routes replacement.',
      icon: AlertTriangle,
      color: 'from-amber-600 to-yellow-600',
    },
    {
      id: 'WAREHOUSE_CONGESTION',
      title: 'Simulate Congestion',
      desc: 'Overloads Packing Station P03 to 18 orders to test worker rebalancing.',
      icon: Layers,
      color: 'from-purple-600 to-indigo-600',
    },
  ];

  const handleScenario = async (id: string) => {
    setActiveScenario(id);
    setFeedbackMessage(`Injecting live scenario: ${id}...`);
    try {
      const res = await runDemoScenario(id);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setFeedbackMessage(res.data?.message || `Scenario ${id} active! Check Live Warehouse 3D and Decisions.`);
    } catch (err: any) {
      setFeedbackMessage(`Error: ${err.message}`);
    }
  };

  // Automated 6-step guided Hackathon Live Demo flow
  const handleStartLiveDemo = async () => {
    setIsLiveDemoRunning(true);
    setDemoStep(1); // 1. DETECT
    setFeedbackMessage('Step 1 [DETECT]: Ingesting urgent customer order with tight SLA window...');
    await runDemoScenario('URGENT_ORDER');

    setTimeout(() => {
      setDemoStep(2); // 2. ANALYZE
      setFeedbackMessage('Step 2 [ANALYZE]: Priority Engine scoring order 96/100; Allocation Engine evaluating multi-warehouse stock...');
    }, 2500);

    setTimeout(() => {
      setDemoStep(3); // 3. RECOMMEND
      setFeedbackMessage('Step 3 [RECOMMEND]: PRIMAL recommends Split Allocation: 7 from WH-A Rack A12 & 3 from WH-B Rack C09 (94% confidence).');
    }, 5000);

    setTimeout(() => {
      setDemoStep(4); // 4. MANAGER DECISION
      setFeedbackMessage('Step 4 [DECISION]: Warehouse Supervisor approves optimal split allocation recommendation...');
    }, 7500);

    setTimeout(async () => {
      setDemoStep(5); // 5. EXECUTE
      setFeedbackMessage('Step 5 [EXECUTE]: Reconciling stock reservations, generating 3D optimized pick route (295m)...');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    }, 10000);

    setTimeout(() => {
      setDemoStep(6); // 6. RESOLVE
      setFeedbackMessage('Step 6 [RESOLVE]: Exception resolved! 3D picker dispatched and order advanced to packing.');
      setIsLiveDemoRunning(false);
    }, 12500);
  };

  const handleReset = async () => {
    setIsResetting(true);
    setFeedbackMessage('Resetting demo database to default clean seed state...');
    try {
      await resetDemoState();
      confetti({ particleCount: 40, spread: 50 });
      setFeedbackMessage('Demo database reset successfully to baseline nominal state.');
      setDemoStep(0);
    } catch (err: any) {
      setFeedbackMessage(`Error: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const demoStepsList = [
    { num: 1, label: 'DETECT', desc: 'Anomaly / Order Ingested' },
    { num: 2, label: 'ANALYZE', desc: 'Multi-Engine Telemetry' },
    { num: 3, label: 'RECOMMEND', desc: 'Deterministic Action' },
    { num: 4, label: 'DECISION', desc: 'Manager Approval' },
    { num: 5, label: 'EXECUTE', desc: 'State & 3D Sync' },
    { num: 6, label: 'RESOLVE', desc: 'SLA Risk Eliminated' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Terminal className="w-6 h-6 text-cyan-400" />
            <span>PRIMAL Command Center — Hackathon Showcase</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate operational bottlenecks, observe automated detection, and trace the full decision lifecycle.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting DB...' : 'Reset Demo Database'}</span>
        </button>
      </div>

      {/* Live Feedback Notification Banner */}
      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-cyan-950/70 border border-cyan-500/60 text-cyan-200 text-xs font-mono shadow-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{feedbackMessage}</span>
          </div>
          <span className="text-[10px] text-slate-400">{new Date().toLocaleTimeString()}</span>
        </div>
      )}

      {/* Featured: Start Live Demo Walkthrough Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-[#0E1B33] to-slate-900 border border-cyan-500/50 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-900/80 text-cyan-300 font-mono text-[11px] font-extrabold border border-cyan-700">
                HACKATHON DEMO FLOW
              </span>
              <span className="text-xs text-slate-300 font-medium">3-Minute Live Automated Walkthrough</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              "EXCEPTION &rarr; INTELLIGENCE &rarr; DECISION &rarr; ACTION &rarr; RESOLUTION"
            </h3>
          </div>

          <button
            onClick={handleStartLiveDemo}
            disabled={isLiveDemoRunning}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-cyan-950 flex items-center gap-2 uppercase tracking-wider"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isLiveDemoRunning ? 'Demo Flow in Progress...' : 'Start Live Demo Flow'}</span>
          </button>
        </div>

        {/* Stepped Progress Visualizer */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {demoStepsList.map((st) => {
            const isActive = demoStep === st.num;
            const isCompleted = demoStep > st.num;

            return (
              <div
                key={st.num}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-950 scale-105'
                    : isCompleted
                    ? 'bg-slate-900/90 border-emerald-800 text-emerald-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center font-bold">
                      {st.num}
                    </span>
                  )}
                  <span className="text-xs font-bold font-mono">{st.label}</span>
                </div>
                <p className="text-[10px] leading-tight opacity-90 truncate">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Scenario Triggers Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider mb-3">
          On-Demand Scenario Injectors
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                className="p-5 rounded-2xl bg-[#0D1424] border border-slate-800 hover:border-cyan-500/40 shadow-xl flex flex-col justify-between transition-all hover:-translate-y-1 group"
              >
                <div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 w-fit mb-3 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {sc.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.desc}</p>
                </div>

                <button
                  onClick={() => handleScenario(sc.id)}
                  className={`w-full mt-4 py-2 rounded-xl bg-gradient-to-r ${sc.color} text-white font-bold text-xs shadow flex items-center justify-center gap-1.5`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate Scenario</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
