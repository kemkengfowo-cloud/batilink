import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';
import { useToast } from '../components/Toast';

export default function MesProjets() {
  const [projects, setProjects] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects/my')
      .then(res => setProjects(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const deleteProject = async (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  if (loading) return <Loader/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Mes projets</h1>
              <p className="text-gray-500 mt-1">{projects.length} projet{projects.length>1?'s':''} publie{projects.length>1?'s':''}</p>
            </div>
            <Link to="/create-project"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              + Nouveau projet
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucun projet publie</h3>
            <p className="text-gray-400 mb-6">Publiez votre premier projet pour recevoir des devis</p>
            <Link to="/create-project" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
              Publier un projet
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(p => (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.statut==='ouvert'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>
                        {p.statut==='ouvert'?'● Ouvert':'○ '+p.statut}
                      </span>
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{p.categorie}</span>
                    </div>
                    <h3 className="font-display font-bold text-gray-900 text-lg">{p.titre}</h3>
                    <p className="text-gray-500 text-sm mt-1">📍 {p.localisation} · 📅 {formatDate(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display font-black text-blue-600">{formatBudget(p.budget)}</p>
                    {p.vues > 0 && <p className="text-xs text-gray-400 mt-1">{p.vues} vue{p.vues>1?'s':''}</p>}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link to={`/projects/${p._id}`}
                    className="flex-1 py-2 text-center border-2 border-blue-200 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50">
                    Voir le projet
                  </Link>
                  <Link to="/devis"
                    className="flex-1 py-2 text-center border-2 border-green-200 text-green-600 rounded-xl font-semibold text-sm hover:bg-green-50">
                    Voir les devis
                  </Link>
                  <button onClick={() => deleteProject(p._id)}
                    className="px-4 py-2 border-2 border-red-200 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
