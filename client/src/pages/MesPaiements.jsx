import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const STATUT_CONFIG = {
  initie:     { label: '🔄 Initié',    bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200' },
  en_attente: { label: '⏳ En attente',bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  confirme:   { label: '✅ Confirmé',  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  echoue:     { label: '❌ Échoué',    bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200'   },
  rembourse:  { label: '↩️ Remboursé', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
};

const navigate = useNavigate();

export default function MesPaiements() {
  const { user } = useAuth();
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    api.get('/paiements/mes-paiements')
      .then(r => setPaiements(r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const liberer = async (id) => {
    if (!window.confirm('Libérer le paiement à l\'artisan via MeSomb ?')) return;
    setProcessing(id);
    try {
      const res = await api.post(`/mesomb/liberer/${id}`);
      alert(res.data.message);
      const r = await api.get('/paiements/mes-paiements');
      setPaiements(r.data || []);
    } catch(e) { alert(e.response?.data?.message || 'Erreur'); }
    finally { setProcessing(null); }
  };

  const totalConfirme = paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + (p.montant || 0), 0);

  if (loading) return <div className="flex justify-center py-20"><Loader/></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-blue-300 text-sm font-semibold mb-1 uppercase tracking-wider">Finances</p>
          <h1 className="text-3xl font-black text-white mb-2">💳 Mes Paiements</h1>
          <p className="text-slate-400">{paiements.length} transaction{paiements.length > 1 ? 's' : ''}</p>
          {totalConfirme > 0 && (
            <div className="mt-4 glass rounded-2xl px-6 py-4 inline-flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-blue-200 text-xs font-semibold">Total confirmé</p>
                <p className="text-white font-black text-xl">{formatBudget(totalConfirme)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {paiements.length === 0 ? (
          <div className="card-premium p-16 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-display font-black text-slate-700 mb-2">Aucun paiement</h3>
            <p className="text-slate-400">Vos paiements apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paiements.map(p => {
              const config = STATUT_CONFIG[p.statut] || STATUT_CONFIG.initie;
              const isClient = user?.role === 'client';
              return (
                <div key={p._id} className="card-premium p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
                          {config.label}
                        </span>
                        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                          {p.reference?.slice(-10)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {p.operateur === 'orange_money' ? '🟠 Orange Money' : '🟡 MTN MoMo'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Total payé</p>
                          <p className="font-black text-slate-900">{formatBudget(p.montant)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Commission (8%)</p>
                          <p className="font-bold text-red-500">-{formatBudget(p.commission)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">{isClient ? 'Artisan reçoit' : 'Vous recevez'}</p>
                          <p className="font-black text-green-600">{formatBudget(p.montantArtisan)}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">{formatDate(p.createdAt)}</p>
                    </div>
                  </div>

                  {/* Bouton libérer */}
                  {isClient && p.statut === 'confirme' && (
                    p.disbursementStatut === 'effectue' ? (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                        <p className="text-green-700 font-bold text-sm">💸 Artisan payé via MeSomb</p>
                      </div>
                    ) : (
                      <button onClick={() => liberer(p._id)} disabled={processing === p._id}
                        className="mt-4 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-all">
                        {processing === p._id ? '...' : '💸 Libérer le paiement à l\'artisan'}
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
