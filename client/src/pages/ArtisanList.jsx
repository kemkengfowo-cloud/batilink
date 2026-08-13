import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import ArtisanCard from '../components/ArtisanCard';
import Loader from '../components/Loader';
import { VILLES, CATEGORIES } from '../utils/helpers';

export default function ArtisanList() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ ville: '', metier: '' });
  const [search, setSearch] = useState({ ville: '', metier: '' });

  const fetchArtisans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, ...Object.fromEntries(Object.entries(search).filter(([,v])=>v)) });
      const res = await api.get(`/artisans?${params}`);
      setArtisans(res.data.artisans);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchArtisans(); }, [fetchArtisans]);

  const handleSearch = (e) => { e.preventDefault(); setSearch({...filters}); setPage(1); };
  const handleReset = () => { setFilters({ville:'',metier:''}); setSearch({ville:'',metier:''}); setPage(1); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-earth-900">Artisans du Cameroun</h1>
        <p className="text-earth-500 mt-2">{total} artisan{total>1?'s':''} disponible{total>1?'s':''}</p>
      </div>

      {/* Filtres */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-card p-4 mb-8 flex flex-col sm:flex-row gap-3">
        <select value={filters.ville} onChange={e=>setFilters(f=>({...f,ville:e.target.value}))}
          className="flex-1 px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 bg-white">
          <option value="">Toutes les villes</option>
          {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filters.metier} onChange={e=>setFilters(f=>({...f,metier:e.target.value}))}
          className="flex-1 px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 bg-white">
          <option value="">Tous les métiers</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className="px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-brand transition-colors">
          Rechercher
        </button>
        {(search.ville||search.metier) && (
          <button type="button" onClick={handleReset} className="px-4 py-3 border-2 border-earth-200 text-earth-600 rounded-xl font-medium hover:bg-earth-50 transition-colors">
            ✕ Réinitialiser
          </button>
        )}
      </form>

      {loading ? <Loader text="Chargement des artisans..." /> : artisans.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-display font-bold text-earth-700">Aucun artisan trouvé</h3>
          <p className="text-earth-400 mt-2">Essayez d'autres filtres de recherche</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {artisans.map(a => <ArtisanCard key={a._id} artisan={a}/>)}
          </div>
          {/* Pagination */}
          {total > 12 && (
            <div className="flex justify-center gap-2 mt-10">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                className="px-4 py-2 border-2 border-earth-200 rounded-xl disabled:opacity-40 hover:border-brand-300 transition-colors font-medium">← Précédent</button>
              <span className="px-4 py-2 text-earth-600 font-medium">Page {page}</span>
              <button onClick={()=>setPage(p=>p+1)} disabled={artisans.length<12}
                className="px-4 py-2 border-2 border-earth-200 rounded-xl disabled:opacity-40 hover:border-brand-300 transition-colors font-medium">Suivant →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
