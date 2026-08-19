import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import { formatBudget, formatDate, VILLES } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const TYPE_PERSONNEL = ['Coffreur','Manœuvre','Ferrailleur','Dalleur','Maçon','Électricien','Plombier','Peintre','Carreleur','Menuisier','Soudeur'];

export default function MissionList() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ typePersonnel:'', localisation:'' });
  const [applied, setApplied] = useState({});
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:10, ...Object.fromEntries(Object.entries(applied).filter(([,v])=>v)) });
      const res = await api.get(`/missions?${params}`);
      setMissions(res.data.missions); setTotal(res.data.total);
    } catch { setMissions([]); }
    finally { setLoading(false); }
  }, [page, applied]);

  useEffect(() => { fetch(); }, [fetch]);

  const search = (e) => { e.preventDefault(); setApplied({...filters}); setPage(1); };
  const reset = () => { setFilters({typePersonnel:'',localisation:''}); setApplied({}); setPage(1); };

  const handleCandidater = async (missionId) => {
    try {
      await api.post(`/missions/${missionId}/candidater`);
      alert('Candidature envoyée !');
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Missions de location</h1>
          <p className="text-gray-500 mt-2">{total} mission{total>1?'s':''} disponible{total>1?'s':''}</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={search} className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 flex flex-col sm:flex-row gap-3 shadow-sm">
          <select value={filters.typePersonnel} onChange={e=>setFilters(f=>({...f,typePersonnel:e.target.value}))}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
            <option value="">Tous les profils</option>
            {TYPE_PERSONNEL.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.localisation} onChange={e=>setFilters(f=>({...f,localisation:e.target.value}))}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
            <option value="">Toutes les villes</option>
            {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
          </select>
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Filtrer</button>
          {(applied.typePersonnel||applied.localisation) && <button type="button" onClick={reset} className="px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50">✕</button>}
        </form>

        {loading ? <Loader text="Chargement des missions..."/> : missions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">👷</div>
            <h3 className="text-xl font-display font-bold text-gray-700">Aucune mission disponible</h3>
            <p className="text-gray-400 mt-2">Essayez d'autres filtres</p>
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map(m=>(
              <div key={m._id} className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {m.typePersonnel?.map(t=>(
                        <span key={t} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">{t}</span>
                      ))}
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-bold">● Ouverte</span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-gray-900 mb-2">{m.titre}</h3>
                    <p className="text-gray-500 line-clamp-2 mb-4">{m.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span>📍 {m.localisation}</span>
                      <span>⏱ {m.duree}</span>
                      <span>👥 {m.nombrePersonnes} personne{m.nombrePersonnes>1?'s':''}</span>
                      <span>📅 {formatDate(m.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-display font-bold text-blue-600">{formatBudget(m.remuneration)}</p>
                    <p className="text-gray-400 text-xs">par {m.duree}</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <Link to={`/missions/${m._id}`} className="px-5 py-2.5 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors text-center">Voir détails</Link>
                      {user?.role === 'artisan' && (
                        <button onClick={()=>handleCandidater(m._id)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">Postuler</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {total > 10 && (
              <div className="flex justify-center gap-2 mt-6">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-40 hover:border-blue-300 font-medium text-sm">← Précédent</button>
                <span className="px-4 py-2 text-gray-600 font-medium text-sm">Page {page}</span>
                <button onClick={()=>setPage(p=>p+1)} disabled={missions.length<10} className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-40 hover:border-blue-300 font-medium text-sm">Suivant →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
