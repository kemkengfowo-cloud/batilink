import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { getAvatarUrl, renderStars, VILLES } from '../utils/helpers';

const LOTS = ['Gros œuvre','Finition','Géotechnique','Architecture'];

export default function EntrepriseList() {
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ ville:'', lot:'' });
  const [applied, setApplied] = useState({});
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:12, ...Object.fromEntries(Object.entries(applied).filter(([,v])=>v)) });
      const res = await api.get(`/entreprises?${params}`);
      setEntreprises(res.data.entreprises); setTotal(res.data.total);
    } catch { setEntreprises([]); }
    finally { setLoading(false); }
  }, [page, applied]);

  useEffect(() => { fetch(); }, [fetch]);

  const search = (e) => { e.preventDefault(); setApplied({...filters}); setPage(1); };
  const reset = () => { setFilters({ville:'',lot:''}); setApplied({}); setPage(1); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Entreprises BTP</h1>
          <p className="text-gray-500 mt-2">{total} entreprise{total>1?'s':''} certifiée{total>1?'s':''}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={search} className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 flex flex-col sm:flex-row gap-3 shadow-sm">
          <select value={filters.ville} onChange={e=>setFilters(f=>({...f,ville:e.target.value}))}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
            <option value="">Toutes les villes</option>
            {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filters.lot} onChange={e=>setFilters(f=>({...f,lot:e.target.value}))}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
            <option value="">Tous les lots</option>
            {LOTS.map(l=><option key={l} value={l}>{l}</option>)}
          </select>
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Rechercher</button>
          {(applied.ville||applied.lot) && <button type="button" onClick={reset} className="px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50">✕</button>}
        </form>

        {loading ? <Loader text="Chargement des entreprises..."/> : entreprises.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-display font-bold text-gray-700">Aucune entreprise trouvée</h3>
            <p className="text-gray-400 mt-2">Essayez d'autres filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {entreprises.map(e=>(
              <div key={e._id} className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 flex-shrink-0">
                    {e.nomEntreprise?.[0] || '🏢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-bold text-gray-900 leading-tight">{e.nomEntreprise}</h3>
                      {e.verifie && <span className="flex-shrink-0 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">✓</span>}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">👤 {e.nomResponsable}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-amber-400 text-xs">{renderStars(e.note||4)}</span>
                      <span className="text-xs text-gray-500">📍 {e.ville}</span>
                    </div>
                  </div>
                </div>
                {e.lotsTravauxPropose?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {e.lotsTravauxPropose.slice(0,3).map(l=>(
                      <span key={l} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{l}</span>
                    ))}
                  </div>
                )}
                {e.typePersonnel?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1.5">Personnel disponible à la location :</p>
                    <div className="flex flex-wrap gap-1">
                      {e.typePersonnel.slice(0,4).map(t=>(
                        <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{t}</span>
                      ))}
                      {e.typePersonnel.length > 4 && <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs">+{e.typePersonnel.length-4}</span>}
                    </div>
                  </div>
                )}
                <Link to={`/entreprises/${e._id}`} className="block w-full text-center py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                  Voir le profil
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
