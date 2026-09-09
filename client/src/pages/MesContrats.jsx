import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';

const STATUT_CONFIG = {
  brouillon:  { label: '📝 Brouillon',  bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200' },
  envoye:     { label: '📤 Envoyé',     bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  signe:      { label: '✅ Signé',      bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  en_cours:   { label: '🔨 En cours',   bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  termine:    { label: '🏁 Terminé',    bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200'},
  resilie:    { label: '❌ Résilié',    bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200'   },
};

const navigate = useNavigate();

export default function MesContrats() {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');

  useEffect(() => {
    api.get('/contrats/mes-contrats')
      .then(r => setContrats(r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'tous' ? contrats : contrats.filter(c => c.statut === filter);

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
              <h1 className="text-3xl font-black text-white mb-2">📑 Mes Contrats</h1>
              <p className="text-slate-400">{contrats.length} contrat{contrats.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          {/* Filtres */}
          <div className="flex gap-2 flex-wrap mt-6">
            {['tous', 'envoye', 'signe', 'en_cours', 'termine'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f ? 'bg-white text-blue-700 shadow-md' : 'glass text-blue-200 hover:bg-white/20'
                }`}>
                {f === 'tous' ? 'Tous' : STATUT_CONFIG[f]?.label || f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {filtered.length === 0 ? (
          <div className="card-premium p-16 text-center">
            <div className="text-6xl mb-4">📑</div>
            <h3 className="text-xl font-display font-black text-slate-700 mb-2">Aucun contrat</h3>
            <p className="text-slate-400">Vos contrats apparaîtront ici après acceptation d'un devis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(c => {
              const config = STATUT_CONFIG[c.statut] || STATUT_CONFIG.envoye;
              return (
                <div key={c._id} className="card-premium p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
                          {config.label}
                        </span>
                        {c.montantTotal && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                            💰 {formatBudget(c.montantTotal)}
                          </span>
                        )}
                        {c.numeroContrat && (
                          <span className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                            #{c.numeroContrat}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-black text-slate-900 text-lg mb-2">
                        {c.titre || 'Contrat de travaux'}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        {c.client?.name && <span>👤 {c.client.name}</span>}
                        {c.artisan?.name && <span>🔨 {c.artisan.name}</span>}
                        {c.dateDebut && <span>📅 Début : {formatDate(c.dateDebut)}</span>}
                        {c.dateFin && <span>🏁 Fin : {formatDate(c.dateFin)}</span>}
                      </div>
                    </div>
                    <Link to={`/contrats/${c._id}`}
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
