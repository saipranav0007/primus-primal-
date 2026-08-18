import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Warehouse3D } from '../components/warehouse3d/Warehouse3D';
import { RackDetailModal } from '../components/warehouse3d/RackDetailModal';
import { Rack } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Box,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  Sliders,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const LiveWarehousePage: React.FC = () => {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [highlightedRackCode, setHighlightedRackCode] = useState<string>('A01');
  const [loading, setLoading] = useState<boolean>(true);

  // Load 3D spatial layout from backend
  useEffect(() => {
    const fetchSpatial = async () => {
      try {
        const res = await api.getWarehouseSpatial();
        if (res.success && res.data.zones) {
          const allRacks: Rack[] = [];
          res.data.zones.forEach((z: any) => {
            if (z.racks) {
              z.racks.forEach((r: any) => allRacks.push(r));
            }
          });
          setRacks(allRacks);
        }
      } catch (err) {
        console.error('Error loading 3D layout:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpatial();
  }, []);

  // Continuous 3D simulation loop
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        const next = prev + 0.006;
        if (next > 1) {
          // Cycle highlighted racks as picker moves
          const rackSequence = ['A01', 'B02', 'C03', 'A01'];
          const idx = Math.floor((next * 4) % rackSequence.length);
          setHighlightedRackCode(rackSequence[idx]);
          return 0;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const filteredRacks =
    selectedZone === 'ALL' ? racks : racks.filter((r) => r.code.startsWith(selectedZone));

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-4 max-w-[1600px] mx-auto">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Interactive 3D Digital Twin</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Spatial inventory map synced with backend storage locations & picker navigation.
            </p>
          </div>
        </div>

        {/* Simulation Controls & Zone Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Zone Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {['ALL', 'A', 'B', 'C', 'D'].map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedZone === z
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {z === 'ALL' ? 'All Zones' : `Zone ${z}`}
              </button>
            ))}
          </div>

          {/* Simulation Toggle Buttons */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isSimulating
                ? 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause Simulation' : 'Start Simulation'}</span>
          </button>

          <button
            onClick={() => {
              setSimulationProgress(0);
              setIsSimulating(true);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="flex-1 relative min-h-[500px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-[#080C14] rounded-2xl border border-slate-800">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-cyan-400">Rendering 3D Warehouse Mesh...</p>
            </div>
          </div>
        ) : (
          <Warehouse3D
            racks={filteredRacks}
            selectedRack={selectedRack}
            onSelectRack={(r) => setSelectedRack(r)}
            isSimulating={isSimulating}
            simulationProgress={simulationProgress}
            highlightedRackCode={highlightedRackCode}
          />
        )}

        {/* Selected Rack Side Inspector */}
        <RackDetailModal rack={selectedRack} onClose={() => setSelectedRack(null)} />

        {/* 3D Color Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-30 p-3 rounded-xl bg-[#0D1424]/90 border border-slate-800/90 shadow-xl backdrop-blur-md text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block mb-2">
            Rack Health Legend
          </span>
          <div className="flex flex-wrap gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Healthy (20+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">Low Stock (6-19)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-slate-300">Critical (&le;5)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-300">Out of Stock (0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-semibold">Active Pick</span>
            </div>
          </div>
        </div>

        {/* Active Picker Navigation HUD */}
        <div className="absolute top-4 left-4 z-30 p-3 rounded-xl bg-[#0D1424]/90 border border-slate-800/90 shadow-xl backdrop-blur-md text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold text-cyan-300 font-mono">ACTIVE PICK WAVE 14</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Assigned Picker: <b>Aarav Sharma</b>
          </p>
          <p className="text-[11px] text-slate-400">
            Route Progress: <b>{Math.round(simulationProgress * 100)}%</b> • Current Target: <b>Rack {highlightedRackCode}</b>
          </p>
        </div>
      </div>
    </div>
  );
};
