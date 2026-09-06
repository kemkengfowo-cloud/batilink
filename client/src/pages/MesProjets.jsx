import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';
import { useToast } from '../components/Toast';

const STATUT_CONFIG = {
  actif:     { label: '✅ Actif',     bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  termine:   { label: '🏁 Terminé',  bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200' },
  en_pause:  { label: '⏸️ En pause', bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  annule:    { label: '❌ Annulé',   bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200'   },
};

export default function MesProjets() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/projects/my')
      .then(r => setProjects(r.data || []))
      .catch(() => toast.error('Erreur chargement projets'))
      .finally(() => setLoading(false));
  }, []);

  const supprimerProjet = async (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(p => p.filter(x => x._id !== id));
      toast.success('Projet supprimé');
    } catch { toast.error('Erreur suppression'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader/></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-indigo-500/10"/>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-300 text-sm font-semibold mb-1 uppercase tracking-wider">Espace client</p>
              <h1 className="text-3xl font-black text-white mb-2">📋 Mes Projets</h1>
              <p className="text-slate-400">{projects.length} projet{projects.length > 1 ? 's' : ''} en cours</p>
            </div>
            <Link to="/create-project" className="btn-byh-gradient px-6 py-3 text-white font-bold rounded-2xl">
              + Nouveau projet
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {projects.length === 0 ? (
          <div className="card-premium p-16 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-display font-black text-slate-700 mb-2">Aucun projet</h3>
            <p className="text-slate-400 mb-6">Publiez votre premier projet pour trouver un artisan</p>
            <Link to="/create-project" className="btn-byh-gradient px-8 py-3 text-white font-bold rounded-2xl inline-block">
              Publier un projet →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(p => {
              const config = STATUT_CONFIG[p.statut] || STATUT_CONFIG.actif;
              return (
                <div key={p._id} className="card-premium p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
                          {config.label}
                        </span>
                        {p.budget && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                            💰 {formatBudget(p.budget)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-black text-slate-900 text-lg mb-1">{p.titre}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-3">{p.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        {p.ville && <span>📍 {p.ville}</span>}
                        {p.createdAt && <span>📅 {formatDate(p.createdAt)}</span>}
                        {p.categorie && <span>🔧 {p.categorie}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/projects/${p._id}`}
                        className="px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all">
                        Voir →
                      </Link>
                      <button onClick={() => supprimerProjet(p._id)}
                        className="px-4 py-2 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-all">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
