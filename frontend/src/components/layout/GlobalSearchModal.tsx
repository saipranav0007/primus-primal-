import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Box, ShoppingCart, Layers, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ products: [], orders: [], inventory: [], exceptions: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ products: [], orders: [], inventory: [], exceptions: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], orders: [], inventory: [], exceptions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query);
        if (res.success) setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  const totalHits =
    (results.products?.length || 0) +
    (results.orders?.length || 0) +
    (results.inventory?.length || 0) +
    (results.exceptions?.length || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0D1424] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/60">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKUs, products, orders, bins, exceptions..."
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-0"
          />
          {loading && <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />}
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <p>Type keywords to search across warehouse database records.</p>
              <div className="flex justify-center gap-2 mt-3 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">WH-1001</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">ORD-1048</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">A01-L1-B1</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Headphones</span>
              </div>
            </div>
          ) : totalHits === 0 && !loading ? (
            <div className="py-8 text-center text-xs text-slate-400">No warehouse entities matching "{query}"</div>
          ) : (
            <>
              {/* Products Hits */}
              {results.products?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-cyan-400" /> Products ({results.products.length})
                  </div>
                  <div className="space-y-1">
                    {results.products.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(`/products`)}
                        className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/30 flex items-center justify-between cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                            {p.sku}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.category} • ₹{p.price?.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Hits */}
              {results.orders?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-400" /> Orders ({results.orders.length})
                  </div>
                  <div className="space-y-1">
                    {results.orders.map((o: any) => (
                      <div
                        key={o.id}
                        onClick={() => handleSelect(`/orders`)}
                        className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/30 flex items-center justify-between cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                            {o.orderNumber}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-300">{o.customerName}</p>
                            <p className="text-[10px] text-slate-400">{o.customerCity} • Stage: {o.stage} • Priority: {o.priorityScore}/100</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exceptions Hits */}
              {results.exceptions?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Exceptions ({results.exceptions.length})
                  </div>
                  <div className="space-y-1">
                    {results.exceptions.map((e: any) => (
                      <div
                        key={e.id}
                        onClick={() => handleSelect(`/exceptions`)}
                        className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/30 flex items-center justify-between cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/40">
                            {e.exceptionNumber}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-red-300">{e.type}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-md">{e.description}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with <b>Tab</b>, select with <b>Enter</b></span>
          <span>Press <b>Esc</b> to exit</span>
        </div>
      </div>
    </div>
  );
};
