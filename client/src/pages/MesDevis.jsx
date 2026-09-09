import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const STATUT_CONFIG = {
  envoye:   { label: '📤 Envoyé',    bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  accepte:  { label: '✅ Accepté',   bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  refuse:   { label: '❌ Refusé',    bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200'   },
  counter:  { label: '🔄 Contre-offre', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200'},
  termine:  { label: '🏁 Terminé',   bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200' },
  annule:   { label: '🚫 Annulé',    bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200'   },
};


export default function MesDevis() {
  const { user } = useAuth();
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');

  useEffect(() => {
    api.get('/devis/mes-devis')
      .then(r => setDevis(r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'tous' ? devis : devis.filter(d => d.statut === filter);
  const isArtisan = user?.role === 'artisan';

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
              <p className="text-blue-300 text-sm font-semibold mb-1 uppercase tracking-wider">
                {isArtisan ? 'Espace artisan' : 'Espace client'}
              </p>
              <h1 className="text-3xl font-black text-white mb-2">📄 Mes Devis</h1>
              <p className="text-slate-400">{devis.length} devis au total</p>
            </div>
            {isArtisan && (
              <Link to="/dashboard" className="btn-byh-gradient px-6 py-3 text-white font-bold rounded-2xl">
                ← Dashboard
              </Link>
            )}
          </div>

          {/* Filtres */}
          <div className="flex gap-2 flex-wrap mt-6">
            {['tous', 'envoye', 'accepte', 'refuse', 'termine'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'glass text-blue-200 hover:bg-white/20'
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
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-display font-black text-slate-700 mb-2">Aucun devis</h3>
            <p className="text-slate-400">
              {isArtisan ? 'Vous n\'avez pas encore envoyé de devis' : 'Vous n\'avez pas encore reçu de devis'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(d => {
              const config = STATUT_CONFIG[d.statut] || STATUT_CONFIG.envoye;
              return (
                <div key={d._id} className="card-premium p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
                          {config.label}
                        </span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                          💰 {formatBudget(d.total)}
                        </span>
                        {d.modePaiement && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                            {d.modePaiement === 'jalons' ? '📊 Par jalons' : d.modePaiement === 'acompte' ? '💳 Acompte' : '💵 Total'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-black text-slate-900 text-lg mb-1">{d.titre}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap mt-2">
                        {isArtisan ? (
                          <span>👤 Client : {d.client?.name}</span>
                        ) : (
                          <span>🔨 Artisan : {d.artisan?.name}</span>
                        )}
                        {d.createdAt && <span>📅 {formatDate(d.createdAt)}</span>}
                        {d.delaiExecution && <span>⏱️ {d.delaiExecution}</span>}
                      </div>
                      {/* Commission info */}
                      {d.montantCommission > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">🔨 Main d'œuvre</span>
                            <span className="font-bold text-slate-700">{formatBudget(d.montantMainOeuvre || d.total)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-slate-500">Commission B.Y.H (8%)</span>
                            <span className="font-bold text-red-500">-{formatBudget(d.montantCommission)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-blue-200">
                            <span className="font-bold text-slate-700">Artisan reçoit</span>
                            <span className="font-black text-green-600">{formatBudget(d.montantArtisan)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Link to={`/devis/${d._id}`}
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
