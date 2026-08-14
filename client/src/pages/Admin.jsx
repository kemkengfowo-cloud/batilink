import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, getAvatarUrl } from '../utils/helpers';

const BADGE_CONFIG = {
  verifie:  { label:'Vérifié', icon:'✓', color:'bg-blue-500 text-white', desc:'Identité vérifiée par Batilink' },
  complet:  { label:'Complet', icon:'★', color:'bg-green-500 text-white', desc:'Profil 100% complété' },
  topRated: { label:'Top', icon:'⭐', color:'bg-amber-500 text-white', desc:'Note > 4.5 avec 5+ avis' },
  premium:  { label:'Premium', icon:'👑', color:'bg-purple-600 text-white', desc:'Partenaire premium' },
};

function BadgeToggle({ badges={}, onToggle, type }) {
  const cfg = BADGE_CONFIG[type];
  const active = badges?.[type];
  return (
    <button onClick={() => onToggle(type, !active)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${active ? `${cfg.color} border-transparent shadow-sm` : 'bg-gray-100 text-gray-400 border-gray-200 hover:border-gray-300'}`}
      title={cfg.desc}>
      {cfg.icon} {cfg.label}
    </button>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [broadcast, setBroadcast] = useState({ contenu:'', roleFilter:'' });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, a, e, sig] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/artisans'),
        api.get('/admin/entreprises'),
        api.get('/admin/signalements'),
      ]);
      if (s.status==='fulfilled') setStats(s.value.data);
      if (u.status==='fulfilled') setUsers(u.value.data.users || []);
      if (a.status==='fulfilled') setArtisans(a.value.data.artisans || []);
      if (e.status==='fulfilled') setEntreprises(e.value.data.entreprises || []);
      if (sig.status==='fulfilled') setSignalements(sig.value.data || []);
    } finally { setLoading(false); }
  };

  const verifyArtisan = async (id, verifie) => {
    await api.put(`/admin/artisans/${id}/verify`, { verifie });
    setArtisans(prev => prev.map(a => a._id===id ? {...a, verifie} : a));
  };

  const verifyEntreprise = async (id, verifie) => {
    await api.put(`/admin/entreprises/${id}/verify`, { verifie });
    setEntreprises(prev => prev.map(e => e._id===id ? {...e, verifie} : e));
  };

  const toggleBadgeArtisan = async (artisanId, badgeType, value) => {
    await api.put(`/admin/badges/artisan/${artisanId}`, { [badgeType]: value });
    setArtisans(prev => prev.map(a => a._id===artisanId ? {...a, badges:{...a.badges, [badgeType]:value}} : a));
  };

  const toggleBadgeEntreprise = async (entrepriseId, badgeType, value) => {
    await api.put(`/admin/badges/entreprise/${entrepriseId}`, { [badgeType]: value });
    setEntreprises(prev => prev.map(e => e._id===entrepriseId ? {...e, badges:{...e.badges, [badgeType]:value}} : e));
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(prev => prev.filter(u => u._id!==id));
  };

  const traiterSignalement = async (id, statut) => {
    await api.put(`/admin/signalements/${id}`, { statut });
    setSignalements(prev => prev.map(s => s._id===id ? {...s, statut} : s));
  };

  const sendBroadcast = async () => {
    if (!broadcast.contenu.trim()) return;
    setSending(true);
    try {
      const res = await api.post('/admin/broadcast', broadcast);
      setBroadcastMsg(`Message envoye a ${res.data.count} utilisateur(s)`);
      setBroadcast({ contenu:'', roleFilter:'' });
      setTimeout(() => setBroadcastMsg(''), 4000);
    } catch { setBroadcastMsg('Erreur lors de l envoi'); }
    finally { setSending(false); }
  };

  const TABS = [
    { id:'stats', label:'Tableau de bord', icon:'📊', badge:null },
    { id:'users', label:'Utilisateurs', icon:'👥', badge:users.length },
    { id:'artisans', label:'Artisans', icon:'🔨', badge:artisans.filter(a=>!a.verifie).length||null },
    { id:'entreprises', label:'Entreprises', icon:'🏢', badge:entreprises.filter(e=>!e.verifie).length||null },
    { id:'signalements', label:'Signalements', icon:'🚨', badge:signalements.filter(s=>s.statut==='en_attente').length||null },
    { id:'messagerie', label:'Messagerie', icon:'📢', badge:null },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement du panel admin...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Panel Administration</h1>
              <p className="text-blue-300 text-sm mt-1">Batilink — Gestion de la plateforme</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">A</div>
              <div>
                <p className="text-white text-sm font-semibold">Admin Batilink</p>
                <p className="text-blue-300 text-xs">Super administrateur</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={`relative flex-shrink-0 px-4 py-2.5 text-sm font-semibold transition-all rounded-t-lg ${tab===t.id?'bg-white text-blue-700':'text-blue-200 hover:text-white hover:bg-white/10'}`}>
                {t.icon} {t.label}
                {t.badge > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{t.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* STATS */}
        {tab==='stats' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:'Clients', value:stats.clients, icon:'🏠', color:'border-blue-200 bg-blue-50 text-blue-700' },
                { label:'Artisans', value:stats.artisans, icon:'🔨', color:'border-green-200 bg-green-50 text-green-700' },
                { label:'Entreprises', value:stats.entreprises, icon:'🏢', color:'border-purple-200 bg-purple-50 text-purple-700' },
                { label:'Signalements', value:stats.signalements, icon:'🚨', color:'border-red-200 bg-red-50 text-red-700' },
              ].map(s=>(
                <div key={s.label} className={`bg-white rounded-2xl p-5 border-2 ${s.color}`}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <p className="text-3xl font-display font-black">{s.value}</p>
                  <p className="text-sm font-semibold mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-display font-bold text-gray-900 mb-4">Activite plateforme</h3>
                <div className="space-y-3">
                  {[
                    { label:'Nouveaux (7j)', value:stats.newUsers7j, color:'bg-blue-500' },
                    { label:'Nouveaux (30j)', value:stats.newUsers30j, color:'bg-blue-400' },
                    { label:'Projets ouverts', value:stats.projectsOuverts, color:'bg-green-500' },
                    { label:'Missions ouvertes', value:stats.missionsOuvertes, color:'bg-purple-500' },
                  ].map(i=>(
                    <div key={i.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{i.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${i.color} rounded-full`} style={{width:`${Math.min(100,(i.value/20)*100)}%`}}></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-6 text-right">{i.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-display font-bold text-gray-900 mb-4">Villes les plus actives</h3>
                <div className="space-y-3">
                  {(stats.villesActives||[]).map((v,i)=>(
                    <div key={v._id} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-300 w-6">#{i+1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700">{v._id}</span>
                          <span className="text-sm font-bold text-blue-600">{v.count}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{width:`${(v.count/(stats.villesActives[0]?.count||1))*100}%`}}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-display font-bold text-gray-900 mb-4">Legende des badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(BADGE_CONFIG).map(([key, cfg])=>(
                  <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                    <span className="text-xs text-gray-500">{cfg.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab==='users' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-display font-bold text-gray-900">Utilisateurs ({users.length})</h2>
              <input type="text" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm w-72"/>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Utilisateur</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Role</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Ville</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.filter(u=>!search||u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase())).map(u=>(
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={getAvatarUrl(u.avatar, u.name)} alt={u.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0"/>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                              <p className="text-gray-400 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role==='client'?'bg-blue-50 text-blue-700':u.role==='artisan'?'bg-green-50 text-green-700':u.role==='entreprise'?'bg-purple-50 text-purple-700':'bg-red-50 text-red-700'}`}>{u.role}</span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">{u.city||'-'}</td>
                        <td className="px-5 py-3 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                        <td className="px-5 py-3">
                          <button onClick={()=>deleteUser(u._id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ARTISANS */}
        {tab==='artisans' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-display font-bold text-gray-900">Artisans ({artisans.length})</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold">{artisans.filter(a=>a.verifie).length} verifies</span>
                <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold">{artisans.filter(a=>!a.verifie).length} en attente</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artisans.map(a=>(
                <div key={a._id} className={`bg-white rounded-2xl border-2 p-5 transition-all ${!a.verifie?'border-yellow-200':'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(a.user?.avatar, a.user?.name)} alt={a.user?.name} className="w-12 h-12 rounded-2xl object-cover"/>
                      <div>
                        <p className="font-bold text-gray-900">{a.user?.name}</p>
                        <p className="text-blue-600 text-sm font-semibold">{a.metier}</p>
                        <p className="text-gray-400 text-xs">{a.user?.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.verifie?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>
                      {a.verifie?'Verifie':'En attente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    <span>📍 {a.ville}</span>
                    {a.user?.phone && <span>📞 {a.user.phone}</span>}
                    <span>📅 {formatDate(a.createdAt)}</span>
                  </div>

                  {/* Badges */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Badges :</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(BADGE_CONFIG).map(type=>(
                        <BadgeToggle key={type} badges={a.badges} type={type} onToggle={(t,v)=>toggleBadgeArtisan(a._id,t,v)}/>
                      ))}
                    </div>
                  </div>

                  {!a.verifie ? (
                    <button onClick={()=>verifyArtisan(a._id, true)}
                      className="w-full py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors">
                      Valider le profil
                    </button>
                  ) : (
                    <button onClick={()=>verifyArtisan(a._id, false)}
                      className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                      Retirer la verification
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENTREPRISES */}
        {tab==='entreprises' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-display font-bold text-gray-900">Entreprises ({entreprises.length})</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold">{entreprises.filter(e=>e.verifie).length} certifiees</span>
                <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold">{entreprises.filter(e=>!e.verifie).length} en attente</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entreprises.map(e=>(
                <div key={e._id} className={`bg-white rounded-2xl border-2 p-5 transition-all ${!e.verifie?'border-yellow-200':'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{e.nomEntreprise}</p>
                      <p className="text-gray-500 text-sm">Resp: {e.nomResponsable}</p>
                      <p className="text-gray-400 text-xs">{e.user?.email}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${e.verifie?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>
                      {e.verifie?'Certifiee':'En attente'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(e.lotsTravauxPropose||[]).map(l=><span key={l} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{l}</span>)}
                  </div>

                  {/* Badges */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Badges :</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(BADGE_CONFIG).map(type=>(
                        <BadgeToggle key={type} badges={e.badges} type={type} onToggle={(t,v)=>toggleBadgeEntreprise(e._id,t,v)}/>
                      ))}
                    </div>
                  </div>

                  {!e.verifie ? (
                    <button onClick={()=>verifyEntreprise(e._id, true)}
                      className="w-full py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors">
                      Certifier l entreprise
                    </button>
                  ) : (
                    <button onClick={()=>verifyEntreprise(e._id, false)}
                      className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                      Retirer la certification
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIGNALEMENTS */}
        {tab==='signalements' && (
          <div className="space-y-5">
            <h2 className="text-xl font-display font-bold text-gray-900">Signalements ({signalements.length})</h2>
            {signalements.length===0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-display font-bold text-gray-700">Aucun signalement</h3>
              </div>
            ) : signalements.map(s=>(
              <div key={s._id} className={`bg-white rounded-2xl border-2 p-5 ${s.statut==='en_attente'?'border-red-200':'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.statut==='en_attente'?'bg-red-50 text-red-700':s.statut==='traite'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>
                        {s.statut==='en_attente'?'En attente':s.statut==='traite'?'Traite':'Rejete'}
                      </span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold capitalize">{s.type}</span>
                    </div>
                    <p className="font-bold text-gray-900">{s.motif}</p>
                    {s.description && <p className="text-gray-500 text-sm mt-1">{s.description}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(s.createdAt)}</span>
                </div>
                {s.statut==='en_attente' && (
                  <div className="flex gap-2">
                    <button onClick={()=>traiterSignalement(s._id,'traite')}
                      className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors">
                      Marquer comme traite
                    </button>
                    <button onClick={()=>traiterSignalement(s._id,'rejete')}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MESSAGERIE */}
        {tab==='messagerie' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-display font-bold text-gray-900">Messagerie administrative</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5">Envoyer un message groupé</h3>
              {broadcastMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">{broadcastMsg}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Destinataires</label>
                  <select value={broadcast.roleFilter} onChange={e=>setBroadcast(b=>({...b,roleFilter:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
                    <option value="">Tous les utilisateurs</option>
                    <option value="client">Clients uniquement</option>
                    <option value="artisan">Artisans uniquement</option>
                    <option value="entreprise">Entreprises uniquement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                  <textarea value={broadcast.contenu} onChange={e=>setBroadcast(b=>({...b,contenu:e.target.value}))} rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Ecrivez votre message..."/>
                </div>
                <button onClick={sendBroadcast} disabled={sending||!broadcast.contenu.trim()}
                  className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {sending?'Envoi...':'Envoyer le message'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
