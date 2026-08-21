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

  const hasFilter = search.nom || search.ville || search.metier;

  const fetchArtisans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, ...Object.fromEntries(Object.entries(search).filter(([,v]) => v)) });
      const res = await api.get(`/artisans?${params}`);
      setArtisans(res.data.artisans || res.data);
      setTotal(res.data.total || res.data.length);
    } catch { setArtisans([]); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchArtisans(); }, [fetchArtisans]);

  const handleSearch = (e) => { e.preventDefault(); setSearch({...filters}); setPage(1); };
  const handleReset = () => { setFilters({nom:'',ville:'',metier:''}); setSearch({}); setPage(1); };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="py-20 relative overflow-hidden" style={{background:"linear-gradient(135deg, #0a1628 0%, #0d2044 100%)"}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"30px 30px"}}/>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            500+ artisans verifies
          </div>
          <h1 className="text-5xl font-display font-black mb-3">🔨 Artisans du Cameroun</h1>
          <p className="text-blue-200 text-lg mb-8">Trouvez le technicien ideal pour vos travaux</p>
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 max-w-3xl mx-auto shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input type="text" placeholder="Rechercher par nom..."
                value={filters.nom} onChange={e=>setFilters(f=>({...f,nom:e.target.value}))}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 text-sm"/>
              <select value={filters.ville} onChange={e=>setFilters(f=>({...f,ville:e.target.value}))}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 text-sm bg-white">
                <option value="">Toutes les villes</option>
                {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
              <select value={filters.metier} onChange={e=>setFilters(f=>({...f,metier:e.target.value}))}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 text-sm bg-white">
                <option value="">Tous les metiers</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm">
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Stats + Reset */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-gray-900 font-bold text-lg">{total} artisan{total>1?'s':''} disponible{total>1?'s':''}</p>
            {hasFilter && (
              <p className="text-gray-400 text-sm mt-0.5">
                {search.nom && `Nom: "${search.nom}" `}
                {search.ville && `Ville: ${search.ville} `}
                {search.metier && `Metier: ${search.metier}`}
              </p>
            )}
          </div>
          {hasFilter && (
            <button onClick={handleReset} className="px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:border-red-300 hover:text-red-500 transition-colors">
              Effacer les filtres ×
            </button>
          )}
        </div>

        {/* Badges filtres actifs */}
        {hasFilter && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search.nom && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">🔍 {search.nom}</span>}
            {search.ville && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">📍 {search.ville}</span>}
            {search.metier && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">🔨 {search.metier}</span>}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader/></div>
        ) : artisans.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucun artisan trouve</h3>
            <p className="text-gray-400 mb-6">Essayez d autres filtres de recherche</p>
            <button onClick={handleReset} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
              Voir tous les artisans
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {artisans.map(a=><ArtisanCard key={a._id} artisan={a}/>)}
            </div>
            {total > 12 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  className="px-5 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-sm disabled:opacity-40 hover:border-blue-300 transition-colors">
                  ← Precedent
                </button>
                <span className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm">
                  Page {page} / {Math.ceil(total/12)}
                </span>
                <button onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(total/12)}
                  className="px-5 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-sm disabled:opacity-40 hover:border-blue-300 transition-colors">
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
