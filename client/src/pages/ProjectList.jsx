import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import { CATEGORIES, VILLES } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function ProjectList() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ categorie:'', localisation:'', budgetMin:'', budgetMax:'' });
  const [applied, setApplied] = useState({});

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:10, ...Object.fromEntries(Object.entries(applied).filter(([,v])=>v)) });
      const res = await api.get(`/projects?${params}`);
      setProjects(res.data.projects || res.data);
      setTotal(res.data.total || res.data.length);
    } catch { setProjects([]); }
    finally { setLoading(false); }
  }, [page, applied]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const search = (e) => { e.preventDefault(); setApplied({...filters}); setPage(1); };
  const reset = () => { setFilters({categorie:'',localisation:'',budgetMin:'',budgetMax:''}); setApplied({}); setPage(1); };
  const hasFilter = Object.values(applied).some(v => v);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="py-16 relative overflow-hidden" style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                {total} projet{total>1?'s':''} ouvert{total>1?'s':''}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black mb-3">📋 Projets BTP</h1>
              <p className="text-blue-200 text-lg">Trouvez des chantiers correspondant a votre expertise</p>
            </div>
            {user?.role === 'client' && (
              <Link to="/create-project" className="flex-shrink-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:scale-105">
                ➕ Publier un projet
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={search} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select value={filters.categorie} onChange={e=>setFilters(f=>({...f,categorie:e.target.value}))}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white text-sm">
              <option value="">Toutes catégories</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.localisation} onChange={e=>setFilters(f=>({...f,localisation:e.target.value}))}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white text-sm">
              <option value="">Toutes villes</option>
              {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
            </select>
            <input type="number" value={filters.budgetMin} onChange={e=>setFilters(f=>({...f,budgetMin:e.target.value}))}
              placeholder="Budget min (FCFA)"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"/>
            <input type="number" value={filters.budgetMax} onChange={e=>setFilters(f=>({...f,budgetMax:e.target.value}))}
              placeholder="Budget max (FCFA)"
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"/>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm">
                Filtrer
              </button>
              {hasFilter && (
                <button type="button" onClick={reset} className="px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 text-sm">
                  ✕
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Résultats */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader text="Chargement des projets..."/></div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-400 mb-6">Essayez d'autres filtres de recherche</p>
            <button onClick={reset} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
              Voir tous les projets
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {projects.map(p => <ProjectCard key={p._id} project={p}/>)}
            </div>
            {total > 10 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  className="px-5 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-sm disabled:opacity-40 hover:border-blue-300">
                  ← Précédent
                </button>
                <span className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm">
                  Page {page} / {Math.ceil(total/10)}
                </span>
                <button onClick={()=>setPage(p=>p+1)} disabled={projects.length<10}
                  className="px-5 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-sm disabled:opacity-40 hover:border-blue-300">
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
