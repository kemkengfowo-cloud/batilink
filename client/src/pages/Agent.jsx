import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatBudget, formatDate, getAvatarUrl } from '../utils/helpers';

const TABS = [
  { id: 'stats',      label: '📊 Tableau de bord', icon: '📊' },
  { id: 'artisans',   label: '🔨 Artisans',         icon: '🔨' },
  { id: 'entreprises',label: '🏢 Entreprises',       icon: '🏢' },
  { id: 'paiements',  label: '💳 Paiements',         icon: '💳' },
  { id: 'litiges',    label: '⚖️ Litiges',           icon: '⚖️' },
  { id: 'visites',    label: '🏠 Visites',           icon: '🏠' },
];

export default function Agent() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [litiges, setLitiges] = useState([]);
  const [visites, setVisites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/agent/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const routes = {
      artisans:    '/agent/artisans-a-valider',
      entreprises: '/agent/entreprises-a-valider',
      paiements:   '/agent/paiements',
      litiges:     '/agent/litiges',
      visites:     '/agent/visites',
    };
    if (routes[tab]) {
      api.get(routes[tab])
        .then(r => {
          if (tab === 'artisans') setArtisans(r.data || []);
          if (tab === 'entreprises') setEntreprises(r.data || []);
          if (tab === 'paiements') setPaiements(r.data || []);
          if (tab === 'litiges') setLitiges(r.data || []);
          if (tab === 'visites') setVisites(r.data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [tab]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const validerArtisan = async (id) => {
    setProcessing(id);
    try {
      const res = await api.put(`/agent/artisans/${id}/valider`);
      setArtisans(a => a.filter(x => x._id !== id));
      showMsg(res.data.message);
      api.get('/agent/stats').then(r => setStats(r.data));
    } catch(e) { showMsg(e.response?.data?.message || 'Erreur'); }
    finally { setProcessing(null); }
  };

  const rejeterArtisan = async (id) => {
    const raison = window.prompt('Raison du rejet :');
    if (!raison) return;
    setProcessing(id);
    try {
      await api.put(`/agent/artisans/${id}/rejeter`, { raison });
      setArtisans(a => a.filter(x => x._id !== id));
      showMsg('Artisan notifié du rejet.');
    } catch(e) { showMsg(e.response?.data?.message || 'Erreur'); }
    finally { setProcessing(null); }
  };

  const validerEntreprise = async (id) => {
    setProcessing(id);
    try {
      const res = await api.put(`/agent/entreprises/${id}/valider`);
      setEntreprises(e => e.filter(x => x._id !== id));
      showMsg(res.data.message);
      api.get('/agent/stats').then(r => setStats(r.data));
    } catch(e) { showMsg(e.response?.data?.message || 'Erreur'); }
    finally { setProcessing(null); }
  };

  const confirmerPaiement = async (id) => {
    const transactionId = window.prompt('ID de transaction (optionnel) :');
    setProcessing(id);
    try {
      const res = await api.put(`/agent/paiements/${id}/confirmer`, { transactionId: transactionId || '' });
      setPaiements(p => p.filter(x => x._id !== id));
      showMsg(res.data.message);
      api.get('/agent/stats').then(r => setStats(r.data));
    } catch(e) { showMsg(e.response?.data?.message || 'Erreur'); }
    finally { setProcessing(null); }
  };

  const resoudreLitige = async (id, statut) => {
    const decision = window.prompt('Décision (expliquez la résolution) :');
    if (!decision) return;
    const montantPlaignant = parseInt(window.prompt('Montant vers plaignant (FCFA, 0 si aucun) :') || '0');
    const montantAccuse = parseInt(window.prompt('Montant vers accusé (FCFA, 0 si aucun) :') || '0');
    setProcessing(id);
    try {
      const res = await api.put(`/agent/litiges/${id}/resoudre`, { statut, decisionAdmin: decision, montantPlaignant, montantAccuse });
      setLitiges(l => l.filter(x => x._id !== id));
      showMsg(res.data.message);
      api.get('/agent/stats').then(r => setStats(r.data));
    } catch(e) { showMsg(e.response?.data?.message || 'Erreur'); }
    finally { setProcessing(null); }
  };

  const confirmerVisite = async (id) => {
    setProcessing(id);
    try {
      const res = await api.put(`/agent/visites/${id}/confirmer`);
      setVisites(v => v.filter(x => x._id !== id));
      showMsg(res.data.message);
      api.get('/agent/stats').then(r => setStats(r.data));
    } catch(e) { showMsg(e.response?.data?.message || 'Erreur'); }
    finally { setProcessing(null); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-indigo-500/10"/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="badge-premium mb-2">AGENT B.Y.H</div>
              <h1 className="text-3xl font-black text-white">🛡️ Panel Agent</h1>
              <p className="text-slate-400 mt-1">Validation et modération des contenus B.Y.H</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  tab === t.id ? 'bg-white text-blue-700 shadow-md' : 'glass text-blue-200 hover:bg-white/20'
                }`}>
                {t.label}
                {t.id === 'artisans' && stats?.artisansEnAttente > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.artisansEnAttente}
                  </span>
                )}
                {t.id === 'paiements' && stats?.paiementsEnAttente > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.paiementsEnAttente}
                  </span>
                )}
                {t.id === 'litiges' && stats?.litigesOuverts > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.litigesOuverts}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message feedback */}
      {msg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-bold text-sm">
            ✅ {msg}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* STATS */}
        {tab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Artisans à valider',    value: stats.artisansEnAttente,    icon: '🔨', color: 'border-blue-200 bg-blue-50 text-blue-700' },
                { label: 'Entreprises à valider', value: stats.entreprisesEnAttente, icon: '🏢', color: 'border-violet-200 bg-violet-50 text-violet-700' },
                { label: 'Paiements en attente',  value: stats.paiementsEnAttente,   icon: '💳', color: 'border-orange-200 bg-orange-50 text-orange-700' },
                { label: 'Litiges ouverts',       value: stats.litigesOuverts,       icon: '⚖️', color: 'border-red-200 bg-red-50 text-red-700' },
                { label: 'Visites en attente',    value: stats.visitesEnAttente,     icon: '🏠', color: 'border-amber-200 bg-amber-50 text-amber-700' },
                { label: 'Total artisans',        value: stats.totalArtisans,        icon: '⭐', color: 'border-green-200 bg-green-50 text-green-700' },
                { label: 'Total clients',         value: stats.totalClients,         icon: '👤', color: 'border-slate-200 bg-slate-50 text-slate-700' },
              ].map((s, i) => (
                <div key={i} className={`card-premium p-5 border-2 ${s.color}`}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-black mb-1">{s.value}</div>
                  <div className="text-xs font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card-premium p-6">
              <h3 className="font-display font-black text-slate-900 mb-4">🎯 Actions prioritaires</h3>
              <div className="space-y-3">
                {stats.artisansEnAttente > 0 && (
                  <button onClick={() => setTab('artisans')}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl hover:bg-blue-100 transition-all">
                    <span className="font-bold text-blue-700">🔨 {stats.artisansEnAttente} artisan(s) en attente de validation</span>
                    <span className="text-blue-500 font-bold">→</span>
                  </button>
                )}
                {stats.paiementsEnAttente > 0 && (
                  <button onClick={() => setTab('paiements')}
                    className="w-full flex items-center justify-between p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl hover:bg-orange-100 transition-all">
                    <span className="font-bold text-orange-700">💳 {stats.paiementsEnAttente} paiement(s) à confirmer</span>
                    <span className="text-orange-500 font-bold">→</span>
                  </button>
                )}
                {stats.litigesOuverts > 0 && (
                  <button onClick={() => setTab('litiges')}
                    className="w-full flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-2xl hover:bg-red-100 transition-all">
                    <span className="font-bold text-red-700">⚖️ {stats.litigesOuverts} litige(s) ouvert(s)</span>
                    <span className="text-red-500 font-bold">→</span>
                  </button>
                )}
                {stats.artisansEnAttente === 0 && stats.paiementsEnAttente === 0 && stats.litigesOuverts === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-5xl mb-3">🎉</div>
                    <p className="text-green-600 font-bold">Tout est à jour ! Aucune action requise.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ARTISANS */}
        {tab === 'artisans' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-black text-slate-900">
              🔨 Artisans à valider ({artisans.length})
            </h2>
            {loading ? <p className="text-slate-400">Chargement...</p> :
             artisans.length === 0 ? (
              <div className="card-premium p-16 text-center">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-green-600 font-bold">Aucun artisan en attente !</p>
              </div>
            ) : artisans.map(a => (
              <div key={a._id} className="card-premium p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <img src={getAvatarUrl(a.user?.avatar, a.user?.name)} alt=""
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100"/>
                    <div>
                      <h3 className="font-display font-black text-slate-900">{a.user?.name}</h3>
                      <p className="text-blue-600 font-bold text-sm">{a.metier}</p>
                      <div className="flex gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                        <span>📧 {a.user?.email}</span>
                        <span>📱 {a.user?.phone}</span>
                        <span>📍 {a.ville}</span>
                        {a.experience && <span>🏆 {a.experience} ans</span>}
                      </div>
                      {a.description && <p className="text-slate-500 text-sm mt-2 line-clamp-2">{a.description}</p>}
                      <p className="text-slate-300 text-xs mt-1">Inscrit le {formatDate(a.user?.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => validerArtisan(a._id)} disabled={processing === a._id}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-all">
                      {processing === a._id ? '...' : '✅ Valider'}
                    </button>
                    <button onClick={() => rejeterArtisan(a._id)} disabled={processing === a._id}
                      className="px-5 py-2.5 bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 font-bold rounded-xl text-sm disabled:opacity-50 transition-all">
                      ❌ Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ENTREPRISES */}
        {tab === 'entreprises' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-black text-slate-900">
              🏢 Entreprises à valider ({entreprises.length})
            </h2>
            {loading ? <p className="text-slate-400">Chargement...</p> :
             entreprises.length === 0 ? (
              <div className="card-premium p-16 text-center">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-green-600 font-bold">Aucune entreprise en attente !</p>
              </div>
            ) : entreprises.map(e => (
              <div key={e._id} className="card-premium p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-display font-black text-slate-900">{e.nomEntreprise || e.user?.name}</h3>
                    <p className="text-violet-600 font-bold text-sm">Entreprise BTP</p>
                    <div className="flex gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span>📧 {e.user?.email}</span>
                      <span>📱 {e.user?.phone}</span>
                      <span>📍 {e.ville}</span>
                      {e.rccm && <span>📋 RCCM: {e.rccm}</span>}
                    </div>
                    {e.description && <p className="text-slate-500 text-sm mt-2 line-clamp-2">{e.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => validerEntreprise(e._id)} disabled={processing === e._id}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-all">
                      {processing === e._id ? '...' : '✅ Valider'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAIEMENTS */}
        {tab === 'paiements' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-black text-slate-900">
              💳 Paiements à confirmer ({paiements.length})
            </h2>
            {loading ? <p className="text-slate-400">Chargement...</p> :
             paiements.length === 0 ? (
              <div className="card-premium p-16 text-center">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-green-600 font-bold">Aucun paiement en attente !</p>
              </div>
            ) : paiements.map(p => (
              <div key={p._id} className="card-premium p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="badge-premium">{p.operateur === 'orange_money' ? '🟠 Orange Money' : '🟡 MTN MoMo'}</span>
                      <span className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                        {p.reference}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-xl mb-3">
                      <div>
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="font-black text-slate-900">{formatBudget(p.montant)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Commission</p>
                        <p className="font-bold text-red-500">-{formatBudget(p.commission)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Artisan reçoit</p>
                        <p className="font-black text-green-600">{formatBudget(p.montantArtisan)}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>👤 Client: {p.client?.name}</span>
                      <span>🔨 Artisan: {p.artisan?.name}</span>
                      <span>📅 {formatDate(p.createdAt)}</span>
                    </div>
                    {p.telephone && <p className="text-xs text-slate-400 mt-1">📱 Numéro payeur: {p.telephone}</p>}
                  </div>
                  <button onClick={() => confirmerPaiement(p._id)} disabled={processing === p._id}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-all">
                    {processing === p._id ? '...' : '✅ Confirmer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LITIGES */}
        {tab === 'litiges' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-black text-slate-900">
              ⚖️ Litiges à traiter ({litiges.length})
            </h2>
            {loading ? <p className="text-slate-400">Chargement...</p> :
             litiges.length === 0 ? (
              <div className="card-premium p-16 text-center">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-green-600 font-bold">Aucun litige en cours !</p>
              </div>
            ) : litiges.map(l => (
              <div key={l._id} className="card-premium p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold">
                        {l.statut === 'ouvert' ? '🔴 Ouvert' : l.statut === 'en_attente_reponse' ? '⏳ Attente réponse' : '🔍 En examen'}
                      </span>
                      {l.urgent && <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-bold">🚨 Urgent</span>}
                      {l.montantEnJeu > 0 && <span className="text-xs font-bold text-blue-600">💰 {formatBudget(l.montantEnJeu)} en jeu</span>}
                    </div>
                    <h3 className="font-display font-black text-slate-900">{l.motif}</h3>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{l.description}</p>
                    <div className="flex gap-4 text-xs text-slate-400 mt-2">
                      <span>👤 Plaignant: {l.plaignant?.name}</span>
                      <span>👤 Accusé: {l.accuse?.name}</span>
                      <span>📅 {formatDate(l.createdAt)}</span>
                    </div>
                    {l.reponseAccuse && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 mb-1">Réponse de l'accusé :</p>
                        <p className="text-sm text-slate-600">{l.reponseAccuse}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => resoudreLitige(l._id, 'resolu_plaignant')} disabled={processing === l._id}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs disabled:opacity-50">
                    ✅ Faveur plaignant
                  </button>
                  <button onClick={() => resoudreLitige(l._id, 'resolu_accuse')} disabled={processing === l._id}
                    className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl text-xs disabled:opacity-50">
                    ✅ Faveur accusé
                  </button>
                  <button onClick={() => resoudreLitige(l._id, 'resolu_partage')} disabled={processing === l._id}
                    className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl text-xs disabled:opacity-50">
                    ⚖️ Partage
                  </button>
                  <button onClick={() => resoudreLitige(l._id, 'classe')} disabled={processing === l._id}
                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs disabled:opacity-50">
                    📁 Classer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISITES */}
        {tab === 'visites' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-black text-slate-900">
              🏠 Visites à confirmer ({visites.length})
            </h2>
            {loading ? <p className="text-slate-400">Chargement...</p> :
             visites.length === 0 ? (
              <div className="card-premium p-16 text-center">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-green-600 font-bold">Aucune visite en attente !</p>
              </div>
            ) : visites.map(v => (
              <div key={v._id} className="card-premium p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-display font-black text-slate-900">{v.adresse || v.ville || 'Visite'}</h3>
                    {v.description && <p className="text-slate-500 text-sm mt-1">{v.description}</p>}
                    <div className="flex gap-4 text-xs text-slate-400 mt-2">
                      <span>👤 Client: {v.client?.name}</span>
                      {v.artisan && <span>🔨 Artisan: {v.artisan?.name}</span>}
                      {v.dateVisite && <span>📅 {formatDate(v.dateVisite)}</span>}
                    </div>
                  </div>
                  <button onClick={() => confirmerVisite(v._id)} disabled={processing === v._id}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-all">
                    {processing === v._id ? '...' : '✅ Confirmer'}
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
