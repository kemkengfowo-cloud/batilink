import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatDate, formatBudget } from '../utils/helpers';

const STATUT_CONFIG = {
  en_attente:      { label: '⏳ En attente',      bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  confirmee:       { label: '✅ Confirmée',        bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  effectuee:       { label: '🏁 Effectuée',        bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  rapport_soumis:  { label: '📄 Rapport soumis',   bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200'},
  annulee:         { label: '❌ Annulée',           bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200'   },
};

const navigate = useNavigate();

export default function MesVisites() {
  const [visites, setVisites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');

  useEffect(() => {
    api.get('/visites/mes-visites')
      .then(r => setVisites(r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'tous' ? visites : visites.filter(v => v.statut === filter);

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
              <p className="text-blue-300 text-sm font-semibold mb-1 uppercase tracking-wider">Évaluations</p>
              <h1 className="text-3xl font-black text-white mb-2">🏠 Mes Visites</h1>
              <p className="text-slate-400">{visites.length} visite{visites.length > 1 ? 's' : ''}</p>
            </div>
            <Link to="/demander-visite"
              className="btn-byh-gradient px-6 py-3 text-white font-bold rounded-2xl">
              + Demander une visite
            </Link>
          </div>
          {/* Filtres */}
          <div className="flex gap-2 flex-wrap mt-6">
            {['tous', 'en_attente', 'confirmee', 'effectuee', 'rapport_soumis'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f ? 'bg-white text-blue-700 shadow-md' : 'glass text-blue-200 hover:bg-white/20'
                }`}>
                {f === 'tous' ? 'Toutes' : STATUT_CONFIG[f]?.label || f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {filtered.length === 0 ? (
          <div className="card-premium p-16 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-display font-black text-slate-700 mb-2">Aucune visite</h3>
            <p className="text-slate-400 mb-6">Demandez une visite d'évaluation de votre site</p>
            <Link to="/demander-visite"
              className="btn-byh-gradient px-8 py-3 text-white font-bold rounded-2xl inline-block">
              Demander une visite →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(v => {
              const config = STATUT_CONFIG[v.statut] || STATUT_CONFIG.en_attente;
              return (
                <div key={v._id} className="card-premium p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
                          {config.label}
                        </span>
                        {v.typeVisite && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                            {v.typeVisite}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-black text-slate-900 text-lg mb-1">
                        {v.adresse || v.ville || 'Visite d\'évaluation'}
                      </h3>
                      {v.description && (
                        <p className="text-slate-500 text-sm line-clamp-2 mb-3">{v.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        {v.dateVisite && <span>📅 {formatDate(v.dateVisite)}</span>}
                        {v.artisan?.name && <span>🔨 {v.artisan.name}</span>}
                        {v.montantEstime && <span>💰 {formatBudget(v.montantEstime)}</span>}
                      </div>

                      {/* Rapport */}
                      {v.rapport && (
                        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                          <p className="text-indigo-700 font-bold text-sm mb-2">📄 Rapport de visite</p>
                          <p className="text-indigo-600 text-sm line-clamp-3">{v.rapport}</p>
                          {v.montantEstime && (
                            <p className="text-green-600 font-black text-sm mt-2">
                              Estimation : {formatBudget(v.montantEstime)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <Link to={`/visites/${v._id}`}
                      className="flex-shrink-0 px-5 py-2.5 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all">
                      Voir →
                    </Link>
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
