import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PickingTask, PackingStation } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  PackageCheck,
  TrendingDown,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Users,
  Sparkles,
  RefreshCw,
  Box,
  Timer,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PickingPackingPage: React.FC = () => {
  const [tasks, setTasks] = useState<PickingTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<PickingTask | null>(null);
  const [stations, setStations] = useState<PackingStation[]>([]);
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rebalancing, setRebalancing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, stationsRes] = await Promise.all([
        api.getPickingTasks(),
        api.getPackingStations(),
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.data);
        if (tasksRes.data.length > 0 && !selectedTask) {
          setSelectedTask(tasksRes.data[0]);
        }
      }
      if (stationsRes.success) {
        setStations(stationsRes.data);
        setBottlenecks(stationsRes.bottlenecks || []);
      }
    } catch (err) {
      console.error('Error fetching picking/packing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReallocateWorker = async (source: string, target: string) => {
    setRebalancing(true);
    try {
      const res = await api.reallocateWorker(source, target);
      if (res.success) {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        fetchData();
      }
    } catch (err) {
      console.error('Error reallocating worker:', err);
    } finally {
      setRebalancing(false);
    }
  };

  const handleProgressTask = async () => {
    if (!selectedTask) return;
    try {
      const res = await api.progressPickingTask(selectedTask.id);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error progressing task:', err);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <PackageCheck className="w-6 h-6 text-cyan-400" />
            <span>Picking Route Optimization & Packing Stations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Traveling Salesman 3D Route Solver and Real-Time Packing Queue Load Balancer.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* SECTION 1: PICKING OPTIMIZATION ENGINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span>Picking Optimization Engine (TSP Route Solver)</span>
          </h3>
          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
            Target Distance Reduction: ~31%
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Tasks List */}
          <div className="p-5 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl space-y-3">
            <span className="text-xs font-bold text-slate-400 font-mono uppercase">
              Active Pick Waves ({tasks.length})
            </span>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedTask?.id === task.id
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{task.order?.orderNumber}</span>
                    <StatusBadge status={task.status} type="order" size="sm" />
                  </div>
                  <p className="text-xs text-slate-200 font-semibold mt-1">Picker: {task.pickerName || 'Aarav Sharma'}</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-slate-400">
                    <span>Distance: <b className="text-white">{task.optimizedDistanceM}m</b></span>
                    <span className="text-emerald-400 font-bold">-{task.savingsPercent}% saved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Comparison Workbench */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl space-y-5">
            {selectedTask ? (
              <>
                {/* Distance Benchmark Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Baseline Route</span>
                    <span className="text-xl font-mono font-bold text-slate-400 line-through">
                      {selectedTask.baselineDistanceM}m
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Naive FIFO path</span>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60">
                    <span className="text-[10px] text-cyan-400 uppercase font-mono block">Optimized Route</span>
                    <span className="text-2xl font-mono font-extrabold text-cyan-300">
                      {selectedTask.optimizedDistanceM}m
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono block mt-0.5">3D TSP S-Shape Solver</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                    <span className="text-[10px] text-emerald-400 uppercase font-mono block">Distance Savings</span>
                    <span className="text-2xl font-mono font-extrabold text-emerald-300">
                      {Math.round(selectedTask.baselineDistanceM - selectedTask.optimizedDistanceM)}m ({selectedTask.savingsPercent}%)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Est. Time Saved: 3.4 min</span>
                  </div>
                </div>

                {/* Waypoints Sequence Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 uppercase font-mono">
                      Optimized Waypoint Sequence
                    </span>
                    <span className="text-[11px] text-cyan-400 font-mono">
                      Step {selectedTask.currentStep} of {selectedTask.totalSteps} Completed
                    </span>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {selectedTask.routeData?.optimizedWaypoints ? (
                      selectedTask.routeData.optimizedWaypoints.map((wp: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            idx + 1 <= selectedTask.currentStep
                              ? 'bg-slate-900/40 border-slate-800/50 text-slate-500'
                              : 'bg-slate-900 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-[10px] flex items-center justify-center font-bold">
                              {wp.step}
                            </span>
                            <div>
                              <span className="font-mono text-cyan-400 font-bold">{wp.rackCode}</span>
                              <span className="text-slate-400 ml-2">({wp.binCode})</span>
                              <p className="text-slate-300 font-medium">{wp.productName}</p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-white">{wp.quantity} Units</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 py-4 text-center">Standard optimized waypoints loaded.</p>
                    )}
                  </div>
                </div>

                {/* Step Progression Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Picker: <b>{selectedTask.pickerName || 'Aarav Sharma'}</b></span>
                  <button
                    onClick={handleProgressTask}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Advance Pick Step ({selectedTask.currentStep}/{selectedTask.totalSteps})</span>
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500 py-12 text-center">Select a picking task to inspect optimized route.</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: PACKING STATIONS & BOTTLENECK BALANCING */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Packing Stations & Queue Load Balancer</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Baseline cycle: 5.2 min / parcel</span>
        </div>

        {/* Packing Station Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stations.map((st) => {
            const isOverloaded = st.status === 'OVERLOADED' || st.queueDepth >= 10;

            return (
              <div
                key={st.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isOverloaded
                    ? 'bg-gradient-to-b from-red-950/40 via-slate-900 to-slate-900 border-red-800/80 shadow-xl shadow-red-950/40 animate-pulse'
                    : 'bg-[#0D1424] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-cyan-400 font-bold text-sm">{st.stationCode}</span>
                  <StatusBadge status={st.status} type="station" size="sm" />
                </div>

                <p className="text-xs font-semibold text-slate-200">{st.workerName}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Order: {st.currentOrderNum || 'None'}</p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Queue Depth:</span>
                    <span className={`font-bold ${isOverloaded ? 'text-red-400 text-sm' : 'text-white'}`}>
                      {st.queueDepth}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Avg Cycle:</span>
                    <span className="text-slate-300">{st.avgPackingTimeMin}m</span>
                  </div>
                </div>

                {/* Worker Rebalance Button for congested station */}
                {isOverloaded && (
                  <button
                    onClick={() => handleReallocateWorker('P01', st.stationCode)}
                    disabled={rebalancing}
                    className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-[11px] shadow flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Rebalance Worker</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
