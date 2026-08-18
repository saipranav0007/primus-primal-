import React, { useState } from 'react';
import { ShieldAlert, Zap, Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('vikram.m@primalops.in');
  const [password, setPassword] = useState('primal2026');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cyber Accents */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0D1424]/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 border border-cyan-400/40 mx-auto">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-white">PRIMAL</h1>
            <p className="text-xs font-semibold text-cyan-400 tracking-wide mt-0.5">
              Intelligent Warehouse Operations
            </p>
            <p className="text-[11px] text-slate-400 font-mono italic mt-1">See. Decide. Fulfill.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Operator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 transition-all uppercase tracking-wider mt-2"
          >
            <Zap className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'ENTER DEMO COMMAND CENTER'}</span>
          </button>
        </form>

        {/* Demo Fast-Track Info */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block">
            Hackathon Demo Mode
          </span>
          <p className="text-[11px] text-slate-400">
            Pre-configured with full operational access for <b>Vikram Malhotra (Operations Manager)</b>.
          </p>
        </div>
      </div>
    </div>
  );
};
