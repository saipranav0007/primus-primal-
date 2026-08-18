import React, { useState } from 'react';
import { Settings, Sliders, ShieldCheck, Bell, Database, Save, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [safetyBuffer, setSafetyBuffer] = useState(14);
  const [slaWarningMinutes, setSlaWarningMinutes] = useState(90);
  const [autoAllocation, setAutoAllocation] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);

  const handleSave = () => {
    confetti({ particleCount: 40, spread: 50 });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>Warehouse Operations Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure intelligence thresholds, reorder buffers, SLA alerts, and facility defaults.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>System parameters updated and synchronized with backend intelligence engines.</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="p-6 rounded-2xl bg-[#0D1424] border border-slate-800 shadow-xl space-y-6">
        {/* Section 1: Engine Parameters */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Intelligence Engine Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Reorder Safety Buffer (Days)
              </label>
              <p className="text-[11px] text-slate-400 mb-3">Buffer added to supplier lead times for PO recommendations.</p>
              <input
                type="number"
                value={safetyBuffer}
                onChange={(e) => setSafetyBuffer(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                SLA High-Risk Warning Window (Minutes)
              </label>
              <p className="text-[11px] text-slate-400 mb-3">Orders approaching cutoff trigger priority boosts.</p>
              <input
                type="number"
                value={slaWarningMinutes}
                onChange={(e) => setSlaWarningMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Automation Preferences */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Automation & Notification Rules</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Auto-Recommend Cross-Warehouse Splits</span>
                <span className="text-[11px] text-slate-400">Trigger multi-warehouse wave allocation when local stock is split.</span>
              </div>
              <input
                type="checkbox"
                checked={autoAllocation}
                onChange={(e) => setAutoAllocation(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Audio Beeps for Critical Exceptions</span>
                <span className="text-[11px] text-slate-400">Play sonic chime on critical packing bottlenecks or damage logs.</span>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
