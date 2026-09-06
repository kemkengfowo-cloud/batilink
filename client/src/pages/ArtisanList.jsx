import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ArtisanCard from '../components/ArtisanCard';
import Loader from '../components/Loader';
import { VILLES, CATEGORIES } from '../utils/helpers';

export default function ArtisanList() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ nom:'', ville:'', metier:'' });
  const [search, setSearch] = useState({});

  const fetchArtisans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, ...search });
      const res = await api.get(`/artisans?${params}`);
      setArtisans(res.data.artisans || []);
      setTotal(res.data.total || 0);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchArtisans(); }, [fetchArtisans]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch({ ...filters });
  };

  const clearFilters = () => {
    setFilters({ nom:'', ville:'', metier:'' });
    setSearch({});
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header dégradé */}
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-indigo-500/10"/>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
              <span className="text-blue-200 text-sm font-semibold">🔨 {total} artisans vérifiés B.Y.H</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
              Trouvez votre artisan<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                de confiance
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Tous nos artisans sont vérifiés et notés par la communauté B.Y.H au Cameroun
            </p>
          </div>

          {/* Formulaire de recherche */}
          <form onSubmit={handleSearch} className="glass rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Nom de l'artisan..."
                  value={filters.nom}
                  onChange={e => setFilters(f => ({...f, nom: e.target.value}))}
                  className="w-full pl-9 pr-4 py-3 bg-white/90 rounded-xl border border-white/20 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
                <select
                  value={filters.ville}
                  onChange={e => setFilters(f => ({...f, ville: e.target.value}))}
                  className="w-full pl-9 pr-4 py-3 bg-white/90 rounded-xl border border-white/20 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none">
                  <option value="">Toutes les villes</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔧</span>
                <select
                  value={filters.metier}
                  onChange={e => setFilters(f => ({...f, metier: e.target.value}))}
                  className="w-full pl-9 pr-4 py-3 bg-white/90 rounded-xl border border-white/20 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none">
                  <option value="">Tous les métiers</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit"
                className="btn-byh-gradient flex-1 py-3 text-white font-bold rounded-xl text-sm">
                🔍 Rechercher
              </button>
              {(search.nom || search.ville || search.metier) && (
                <button type="button" onClick={clearFilters}
                  className="px-4 py-3 glass text-white font-semibold rounded-xl text-sm hover:bg-white/20 transition-all">
                  ✕ Effacer
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Liste artisans */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20"><Loader/></div>
        ) : artisans.length === 0 ? (
          <div className="card-premium p-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-display font-black text-slate-700 mb-2">Aucun artisan trouvé</h3>
            <p className="text-slate-400 mb-6">Essayez d'autres critères de recherche</p>
            <button onClick={clearFilters}
              className="btn-byh-gradient px-6 py-3 text-white font-bold rounded-xl">
              Voir tous les artisans
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 font-semibold">
                <span className="text-blue-600 font-black">{total}</span> artisan{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
              </p>
              <div className="badge-premium">{artisans.length} affichés</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisans.map(a => <ArtisanCard key={a._id} artisan={a}/>)}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center gap-3 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl disabled:opacity-40 hover:border-blue-300 transition-all text-sm">
                  ← Précédent
                </button>
                <div className="flex items-center px-5 py-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <span className="text-blue-700 font-black text-sm">Page {page} / {Math.ceil(total/12)}</span>
                </div>
                <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/12)}
                  className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl disabled:opacity-40 hover:border-blue-300 transition-all text-sm">
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
