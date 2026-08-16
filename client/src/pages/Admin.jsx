import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, formatBudget, getAvatarUrl } from '../utils/helpers';

const BADGE_CONFIG = {
  verifie:  { label:'Verifie', icon:'✓', color:'bg-blue-500 text-white', desc:'Identite verifiee par Batilink' },
  complet:  { label:'Complet', icon:'★', color:'bg-green-500 text-white', desc:'Profil 100% complete' },
  topRated: { label:'Top', icon:'⭐', color:'bg-amber-500 text-white', desc:'Note > 4.5 avec 5+ avis' },
  premium:  { label:'Premium', icon:'👑', color:'bg-purple-600 text-white', desc:'Partenaire premium' },
};

function BadgeToggle({ badges={}, onToggle, type }) {
  const cfg = BADGE_CONFIG[type];
  const active = badges?.[type];
  return (
    <button onClick={() => onToggle(type, !active)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${active?`${cfg.color} border-transparent shadow-sm`:'bg-gray-100 text-gray-400 border-gray-200 hover:border-gray-300'}`}
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
  const [litiges, setLitiges] = useState([]);
  const [visites, setVisites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [broadcast, setBroadcast] = useState({ contenu:'', roleFilter:'' });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [demandesPersonnel, setDemandesPersonnel] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [artisansDispos, setArtisansDispos] = useState([]);
  const [showProposer, setShowProposer] = useState(false);
  const [propositionForm, setPropositionForm] = useState({ artisansIds:[], prixParArtisan:'', message:'' });

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, a, e, sig, lit, vis, dem] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/artisans'),
        api.get('/admin/entreprises'),
        api.get('/admin/signalements'),
        api.get('/litiges'),
        api.get('/visites/admin/toutes'),
        api.get('/demandes-personnel/mes-demandes'),
      ]);
      if (s.status==='fulfilled') setStats(s.value.data);
      if (u.status==='fulfilled') setUsers(u.value.data.users || []);
      if (a.status==='fulfilled') setArtisans(a.value.data.artisans || []);
      if (e.status==='fulfilled') setEntreprises(e.value.data.entreprises || []);
      if (sig.status==='fulfilled') setSignalements(sig.value.data || []);
      if (lit.status==='fulfilled') setLitiges(lit.value.data || []);
      if (vis.status==='fulfilled') setVisites(vis.value.data || []);
      if (dem.status==='fulfilled') setDemandesPersonnel(dem.value.data || []);
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

  const resoudreLitige = async (id, statut, decision) => {
    await api.put(`/litiges/${id}/resoudre`, { statut, decisionAdmin: decision });
    setLitiges(prev => prev.map(l => l._id===id ? {...l, statut, decisionAdmin: decision} : l));
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

  const litiesOuverts = litiges.filter(l=>l.statut==='ouvert').length;
  const visitesEnAttente = visites.filter(v=>v.statut==='en_attente').length;

  const TABS = [
    { id:'stats', label:'Tableau de bord', icon:'📊', badge:null },
    { id:'users', label:'Utilisateurs', icon:'👥', badge:users.length },
    { id:'artisans', label:'Artisans', icon:'🔨', badge:artisans.filter(a=>!a.verifie).length||null },
    { id:'entreprises', label:'Entreprises', icon:'🏢', badge:entreprises.filter(e=>!e.verifie).length||null },
    { id:'signalements', label:'Signalements', icon:'🚨', badge:signalements.filter(s=>s.statut==='en_attente').length||null },
    { id:'litiges', label:'Litiges', icon:'⚖️', badge:litiesOuverts||null },
    { id:'visites', label:'Visites', icon:'🔍', badge:visitesEnAttente||null },
    { id:'messagerie', label:'Messagerie', icon:'📢', badge:null },
    { id:'historique', label:'Journal', icon:'📜', badge:null },
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:'Projets', value:stats.projects, icon:'📋', color:'border-orange-200 bg-orange-50 text-orange-700' },
                { label:'Missions', value:stats.missions, icon:'👷', color:'border-yellow-200 bg-yellow-50 text-yellow-700' },
                { label:'Litiges ouverts', value:litiesOuverts, icon:'⚖️', color:'border-red-200 bg-red-50 text-red-700' },
                { label:'Visites en attente', value:visitesEnAttente, icon:'🔍', color:'border-indigo-200 bg-indigo-50 text-indigo-700' },
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
                    { label:'Nouveaux (7j)', value:stats.newUsers7j||0, color:'bg-blue-500' },
                    { label:'Nouveaux (30j)', value:stats.newUsers30j||0, color:'bg-blue-400' },
                    { label:'Projets ouverts', value:stats.projectsOuverts||0, color:'bg-green-500' },
                    { label:'Missions ouvertes', value:stats.missionsOuvertes||0, color:'bg-purple-500' },
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
                <h3 className="font-display font-bold text-gray-900 mb-4">Derniers inscrits</h3>
                <div className="space-y-2">
                  {(stats.recentUsers||[]).slice(0,5).map(u=>(
                    <div key={u._id} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2">
                        <img src={getAvatarUrl(u.avatar, u.name)} alt={u.name} className="w-8 h-8 rounded-lg object-cover"/>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-none">{u.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{u.city}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.role==='client'?'bg-blue-50 text-blue-700':u.role==='artisan'?'bg-green-50 text-green-700':'bg-purple-50 text-purple-700'}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
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
                  </div>
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
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.statut==='en_attente'?'bg-red-50 text-red-700':s.statut==='traite'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>
                        {s.statut==='en_attente'?'En attente':s.statut==='traite'?'Traite':'Rejete'}
                      </span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold capitalize">{s.type}</span>
                    </div>
                    <p className="font-bold text-gray-900">{s.motif}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(s.createdAt)}</span>
                </div>
                {s.statut==='en_attente' && (
                  <div className="flex gap-2">
                    <button onClick={()=>traiterSignalement(s._id,'traite')}
                      className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600">
                      Marquer traite
                    </button>
                    <button onClick={()=>traiterSignalement(s._id,'rejete')}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200">
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* LITIGES */}
        {tab==='litiges' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-display font-bold text-gray-900">Litiges ({litiges.length})</h2>
              <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-bold">
                {litiesOuverts} ouvert{litiesOuverts>1?'s':''}
              </span>
            </div>
            {litiges.length===0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className="text-xl font-display font-bold text-gray-700">Aucun litige</h3>
                <p className="text-gray-400 mt-2">Toutes les transactions se passent bien !</p>
              </div>
            ) : litiges.map(l=>(
              <div key={l._id} className={`bg-white rounded-2xl border-2 p-5 ${l.statut==='ouvert'?'border-red-200':l.statut==='en_examen'?'border-amber-200':'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${l.statut==='ouvert'?'bg-red-50 text-red-700':l.statut==='en_examen'?'bg-amber-50 text-amber-700':l.statut.includes('resolu')?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>
                        {l.statut==='ouvert'?'Ouvert':l.statut==='en_examen'?'En examen':l.statut==='resolu_plaignant'?'Resolu en faveur du plaignant':l.statut==='resolu_accuse'?'Resolu en faveur de l accuse':'Classe'}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900">{l.motif}</p>
                    <p className="text-gray-500 text-sm mt-1">{l.description}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(l.createdAt)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Plaignant</p>
                    <div className="flex items-center gap-2">
                      <img src={getAvatarUrl(l.plaignant?.avatar, l.plaignant?.name)} alt="" className="w-7 h-7 rounded-lg"/>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{l.plaignant?.name}</p>
                        <p className="text-xs text-gray-400">{l.plaignant?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Accuse</p>
                    <div className="flex items-center gap-2">
                      <img src={getAvatarUrl(l.accuse?.avatar, l.accuse?.name)} alt="" className="w-7 h-7 rounded-lg"/>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{l.accuse?.name}</p>
                        <p className="text-xs text-gray-400">{l.accuse?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {['ouvert','en_examen'].includes(l.statut) && (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Decision de l administrateur..."
                      id={`decision-${l._id}`}
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none text-sm"/>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={()=>resoudreLitige(l._id,'resolu_plaignant',document.getElementById(`decision-${l._id}`).value)}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                        Donner raison au plaignant
                      </button>
                      <button onClick={()=>resoudreLitige(l._id,'resolu_accuse',document.getElementById(`decision-${l._id}`).value)}
                        className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600">
                        Donner raison a l accuse
                      </button>
                      <button onClick={()=>resoudreLitige(l._id,'classe',document.getElementById(`decision-${l._id}`).value)}
                        className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200">
                        Classer
                      </button>
                    </div>
                  </div>
                )}

                {l.decisionAdmin && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                    <strong>Decision :</strong> {l.decisionAdmin}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VISITES */}
        {tab==='visites' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-display font-bold text-gray-900">Visites d evaluation ({visites.length})</h2>
              <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold">
                {visitesEnAttente} en attente
              </span>
            </div>
            {visites.length===0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-display font-bold text-gray-700">Aucune visite</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {visites.map(v=>(
                  <div key={v._id} className={`bg-white rounded-2xl border-2 p-5 ${v.statut==='en_attente'?'border-yellow-200':v.statut==='rapport_soumis'?'border-green-200':'border-gray-100'}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            v.statut==='en_attente'?'bg-yellow-50 text-yellow-700':
                            v.statut==='evaluateur_assigne'?'bg-blue-50 text-blue-700':
                            v.statut==='rapport_soumis'?'bg-green-50 text-green-700':
                            'bg-gray-100 text-gray-500'}`}>
                            {v.statut==='en_attente'?'En attente':
                             v.statut==='evaluateur_assigne'?'Technicien assigne':
                             v.statut==='rapport_soumis'?'Rapport disponible':v.statut}
                          </span>
                          {v.typeProbleme && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{v.typeProbleme}</span>}
                        </div>
                        <p className="font-bold text-gray-900">{v.description?.substring(0,80)}...</p>
                        <p className="text-gray-500 text-sm mt-1">📍 {v.adresse}, {v.ville}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{formatBudget(v.fraisVisite)}</p>
                        <p className="text-xs text-gray-400">{formatDate(v.createdAt)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Client</p>
                        <p className="font-semibold text-gray-900">{v.client?.name}</p>
                        <p className="text-gray-400 text-xs">{v.client?.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Evaluateur</p>
                        <p className="font-semibold text-gray-900">{v.evaluateur?.name||'Non assigne'}</p>
                        <p className="text-gray-400 text-xs">{v.evaluateur?.phone||''}</p>
                      </div>
                    </div>
                    {v.rapport?.estimationCout > 0 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                        <strong>Estimation :</strong> {formatBudget(v.rapport.estimationCout)} — {v.rapport.estimationDuree}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORIQUE */}
        {tab==="historique" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-gray-900">Journal d activite</h2>
              <Link to="/admin/historique" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">
                Voir le journal complet →
              </Link>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">📜</div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Journal d activite complet</h3>
              <p className="text-gray-500 mb-6">Consultez toutes les actions effectuees sur la plateforme avec matricules, timestamps et details.</p>
              <Link to="/admin/historique" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                Ouvrir le journal →
              </Link>
            </div>
          </div>
        {tab==="demandes" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-display font-bold text-gray-900">Demandes de personnel ({demandesPersonnel.length})</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold">{demandesPersonnel.filter(d=>d.statut==="en_attente").length} en attente</span>
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{demandesPersonnel.filter(d=>d.statut==="en_negociation").length} en negociation</span>
              </div>
            </div>
            {demandesPersonnel.length===0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-6xl mb-4">👷</div>
                <h3 className="text-xl font-display font-bold text-gray-700">Aucune demande</h3>
              </div>
            ) : demandesPersonnel.map(d=>(
              <div key={d._id} className={`bg-white rounded-2xl border-2 p-5 ${d.statut==="en_attente"?"border-yellow-200":d.statut==="en_negociation"?"border-blue-200":"border-gray-100"}`}>
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${d.statut==="en_attente"?"bg-yellow-50 text-yellow-700":d.statut==="en_negociation"?"bg-blue-50 text-blue-700":d.statut==="accord_trouve"?"bg-green-50 text-green-700":"bg-gray-100 text-gray-500"}`}>
                        {d.statut==="en_attente"?"En attente":d.statut==="en_negociation"?"En negociation":d.statut==="accord_trouve"?"Accord trouve":d.statut}
                      </span>
                      {d.typePersonnel?.map(t=><span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{t}</span>)}
                    </div>
                    <p className="font-bold text-gray-900">{d.nombrePersonnes} personne(s) - {d.ville}</p>
                    <p className="text-gray-500 text-sm mt-1">Du {formatDate(d.dateDebut)} au {formatDate(d.dateFin)}</p>
                    <p className="text-gray-400 text-xs mt-1">Entreprise: {d.entreprise?.name} · {d.entreprise?.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">{formatBudget(d.budgetFinal||d.budgetPropose)}</p>
                    {d.budgetFinal && <p className="text-xs text-green-600 font-semibold">Prix negocie</p>}
                    <p className="text-xs text-gray-400">{formatDate(d.createdAt)}</p>
                  </div>
                </div>
                {d.description && <p className="text-gray-500 text-sm mb-4 p-3 bg-gray-50 rounded-xl">{d.description}</p>}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={()=>{ const msg = `Bonjour, concernant votre demande de ${d.typePersonnel?.join(", ")} a ${d.ville}, nous avons identifie des techniciens disponibles. Pouvez-vous confirmer votre budget de ${new Intl.NumberFormat("fr-FR").format(d.budgetPropose)} FCFA ?`; api.post("/messages", {destinataire: d.entreprise?._id, contenu: msg}); alert("Message envoye a l entreprise !"); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                    Message entreprise
                  </button>
                  {["en_attente","en_negociation"].includes(d.statut) && (
                    <button onClick={()=>{ const prix = prompt("Prix final agree (FCFA):"); if(prix) { api.put(`/demandes-personnel/${d._id}/valider-accord`, {budgetFinal: parseInt(prix), message: "Accord valide par admin Batilink"}).then(()=>{ loadAll(); alert("Accord valide ! Generez maintenant le contrat."); }).catch(()=>alert("Erreur")); } }}
                      className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600">
                      Valider accord
                    </button>
                  )}
                  {d.statut==="accord_trouve" && (
                    <Link to={`/contrats/creer?demandeId=${d._id}&entrepriseId=${d.entreprise?._id}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700">
                      Generer contrat
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        )}

        {/* MESSAGERIE */}
        {tab==='messagerie' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-display font-bold text-gray-900">Messagerie administrative</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5">Envoyer un message groupe</h3>
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
