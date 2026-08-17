import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import { CATEGORIES, VILLES } from '../utils/helpers';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ categorie: '', localisation: '', budgetMin: '', budgetMax: '' });
  const [applied, setApplied] = useState({});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...Object.fromEntries(Object.entries(applied).filter(([,v])=>v)) });
      const res = await api.get(`/projects?${params}`);
      setProjects(res.data.projects); setTotal(res.data.total);
    } finally { setLoading(false); }
  }, [page, applied]);

  useEffect(() => { fetch(); }, [fetch]);

  const search = (e) => { e.preventDefault(); setApplied({...filters}); setPage(1); };
  const reset = () => { setFilters({categorie:'',localisation:''}); setApplied({}); setPage(1); };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-earth-900">Projets publiés</h1>
        <p className="text-earth-500 mt-1">{total} projet{total>1?'s':''} ouvert{total>1?'s':''}</p>
      </div>

      <form onSubmit={search} className="bg-white rounded-2xl shadow-card p-4 mb-8 flex flex-col sm:flex-row gap-3">
        <select value={filters.categorie} onChange={e=>setFilters(f=>({...f,categorie:e.target.value}))}
          className="flex-1 px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 bg-white">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.localisation} onChange={e=>setFilters(f=>({...f,localisation:e.target.value}))}
          className="flex-1 px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 bg-white">
          <option value="">Toutes villes</option>
          {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
        <input type="number" value={filters.budgetMin} onChange={e=>setFilters(f=>({...f,budgetMin:e.target.value}))} placeholder="Budget min (FCFA)" className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"/>
        <input type="number" value={filters.budgetMax} onChange={e=>setFilters(f=>({...f,budgetMax:e.target.value}))} placeholder="Budget max (FCFA)" className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"/>
        </select>
        <button type="submit" className="px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-brand transition-colors">Filtrer</button>
        {(applied.categorie||applied.localisation) && <button type="button" onClick={reset} className="px-4 py-3 border-2 border-earth-200 text-earth-600 rounded-xl font-medium hover:bg-earth-50">✕</button>}
      </form>

      {loading ? <Loader text="Chargement des projets..." /> : projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-display font-bold text-earth-700">Aucun projet trouvé</h3>
          <p className="text-earth-400 mt-2">Essayez d'autres filtres</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {projects.map(p => <ProjectCard key={p._id} project={p}/>)}
          </div>
          {total > 10 && (
            <div className="flex justify-center gap-2 mt-10">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-4 py-2 border-2 border-earth-200 rounded-xl disabled:opacity-40 hover:border-brand-300 font-medium">← Précédent</button>
              <span className="px-4 py-2 text-earth-600 font-medium">Page {page}</span>
              <button onClick={()=>setPage(p=>p+1)} disabled={projects.length<10} className="px-4 py-2 border-2 border-earth-200 rounded-xl disabled:opacity-40 hover:border-brand-300 font-medium">Suivant →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
