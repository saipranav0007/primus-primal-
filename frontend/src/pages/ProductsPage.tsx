import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  ShoppingBag,
  Search,
  Star,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  IndianRupee,
  RefreshCw,
  Box,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        search: search || undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      });
      if (res.success) setProducts(res.data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-cyan-400" />
            <span>Product Catalog & Master Data</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete inventory catalog with live stock status and Indian Rupee (₹) pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Total SKUs: <b className="text-cyan-400 font-bold">{products.length}</b>
          </div>
          <button
            onClick={fetchProducts}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-[#0D1424] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or brand..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'Audio & Peripherals', 'Wearables', 'Smart Home', 'Computer Hardware'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-cyan-400">Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-[#0D1424] rounded-2xl border border-slate-800">
          <Box className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold">No products found matching filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => {
            const avail = p.totalAvailable !== undefined ? p.totalAvailable : 28;
            const reserved = p.totalReserved !== undefined ? p.totalReserved : 4;
            const status = p.stockStatus || (avail <= 0 ? 'OUT_OF_STOCK' : avail <= p.reorderPoint ? 'LOW_STOCK' : 'HEALTHY');

            return (
              <div
                key={p.id}
                className="group relative rounded-2xl bg-[#0D1424] border border-slate-800/90 hover:border-cyan-500/40 p-4 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-cyan-950/40 flex flex-col justify-between"
              >
                <div>
                  {/* Product Image & Badges */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3.5 border border-slate-800">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-white/10 font-bold">
                        {p.sku}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={status} type="stock" size="sm" />
                    </div>
                  </div>

                  {/* Category & Title */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>{p.category}</span>
                    <span className="flex items-center gap-1 text-amber-400 font-mono">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {p.rating}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2 leading-tight">
                    {p.name}
                  </h3>

                  {/* Pricing & Stock Stats */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Retail Price:</span>
                      <span className="font-mono font-bold text-white text-sm">
                        ₹{p.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Available: <b className="text-emerald-400">{avail}</b></span>
                      <span>Reserved: <b className="text-amber-400">{reserved}</b></span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">Supplier: {p.supplier?.split(' ')[0]}</span>
                  <button
                    onClick={() => navigate(`/inventory?search=${encodeURIComponent(p.sku)}`)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Stock</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
