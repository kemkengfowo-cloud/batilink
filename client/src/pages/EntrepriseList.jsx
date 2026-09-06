import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { getAvatarUrl } from '../utils/helpers';
import { VILLES } from '../utils/helpers';

export default function EntrepriseList() {
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ nom:'', ville:'' });
  const [search, setSearch] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(search);
    api.get(`/entreprises?${params}`)
      .then(r => setEntreprises(r.data?.entreprises || r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch({...filters});
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-indigo-500/10"/>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
              <span className="text-blue-200 text-sm font-semibold">🏢 {entreprises.length} entreprises BTP au Cameroun</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
              Entreprises BTP<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                certifiées B.Y.H
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Sociétés de construction vérifiées pour vos grands projets au Cameroun
            </p>
          </div>

          {/* Recherche */}
          <form onSubmit={handleSearch} className="glass rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input type="text" placeholder="Nom de l'entreprise..."
                  value={filters.nom} onChange={e => setFilters(f => ({...f, nom: e.target.value}))}
                  className="w-full pl-9 pr-4 py-3 bg-white/90 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
                <select value={filters.ville} onChange={e => setFilters(f => ({...f, ville: e.target.value}))}
                  className="w-full pl-9 pr-4 py-3 bg-white/90 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none">
                  <option value="">Toutes les villes</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-byh-gradient w-full py-3 text-white font-bold rounded-xl text-sm">
              🔍 Rechercher
            </button>
          </form>
        </div>
      </div>

      {/* Liste */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20"><Loader/></div>
        ) : entreprises.length === 0 ? (
          <div className="card-premium p-16 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-display font-black text-slate-700 mb-2">Aucune entreprise trouvée</h3>
            <p className="text-slate-400">Essayez d'autres critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entreprises.map(e => (
              <div key={e._id} className="card-premium overflow-hidden group">
                <div className="h-2 bg-blue-purple"/>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {e.user?.avatar ? (
                        <img src={getAvatarUrl(e.user.avatar, e.nomEntreprise)} alt="" className="w-full h-full object-cover"/>
                      ) : (
                        <span className="text-2xl">🏢</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-black text-slate-900 leading-tight">
                        {e.nomEntreprise || e.user?.name}
                      </h3>
                      <p className="text-indigo-600 font-bold text-sm mt-0.5">Entreprise BTP</p>
                      {e.ville && <p className="text-slate-400 text-xs mt-1">📍 {e.ville}</p>}
                    </div>
                  </div>

                  {e.description && (
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">{e.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {e.specialites?.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <Link to={`/entreprises/${e._id}`}
                      className="flex-1 text-center py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-200 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all">
                      Voir profil →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
