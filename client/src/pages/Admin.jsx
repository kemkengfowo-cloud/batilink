import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, getAvatarUrl } from '../utils/helpers';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, u, a, e] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/artisans'),
        api.get('/admin/entreprises')
      ]);
      setStats(s.data);
      setUsers(u.data.users || []);
      setArtisans(a.data.artisans || []);
      setEntreprises(e.data.entreprises || []);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const verifyArtisan = async (id, verifie) => {
    await api.put(`/admin/artisans/${id}/verify`, { verifie });
    setArtisans(prev => prev.map(a => a._id === id ? {...a, verifie} : a));
  };

  const verifyEntreprise = async (id, verifie) => {
    await api.put(`/admin/entreprises/${id}/verify`, { verifie });
    setEntreprises(prev => prev.map(e => e._id === id ? {...e, verifie} : e));
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const TABS = [
    { id:'stats', label:'Tableau de bord', icon:'📊' },
    { id:'users', label:'Utilisateurs', icon:'👥' },
    { id:'artisans', label:'Artisans', icon:'🔨' },
    { id:'entreprises', label:'Entreprises', icon:'🏢' },
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
      {/* Header */}
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Panel Administration</h1>
              <p className="text-blue-300 text-sm mt-1">Batilink — Gestion de la plateforme</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">A</div>
              <div>
                <p className="text-white text-sm font-semibold">Admin</p>
                <p className="text-blue-300 text-xs">Super administrateur</p>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-blue-800">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-sm font-semibold transition-all rounded-t-lg ${tab===t.id?'bg-white text-blue-700':'text-blue-200 hover:text-white hover:bg-white/10'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* STATS */}
        {tab === 'stats' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label:'Clients', value:stats.clients, icon:'🏠', color:'bg-blue-50 text-blue-700 border-blue-100' },
                { label:'Artisans', value:stats.artisans, icon:'🔨', color:'bg-green-50 text-green-700 border-green-100' },
                { label:'Entreprises', value:stats.entreprises, icon:'🏢', color:'bg-purple-50 text-purple-700 border-purple-100' },
                { label:'Projets', value:stats.projects, icon:'📋', color:'bg-orange-50 text-orange-700 border-orange-100' },
                { label:'Missions', value:stats.missions, icon:'👷', color:'bg-yellow-50 text-yellow-700 border-yellow-100' },
              ].map(s => (
                <div key={s.label} className={`bg-white rounded-2xl p-5 border-2 ${s.color}`}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <p className="text-3xl font-display font-black">{s.value}</p>
                  <p className="text-sm font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-display font-bold text-gray-900 mb-5">Derniers inscrits</h2>
              <div className="space-y-3">
                {(stats.recentUsers || []).map(u => (
                  <div key={u._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(u.avatar, u.name)} alt={u.name} className="w-9 h-9 rounded-xl object-cover"/>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role==='client'?'bg-blue-50 text-blue-700':u.role==='artisan'?'bg-green-50 text-green-700':u.role==='entreprise'?'bg-purple-50 text-purple-700':'bg-red-50 text-red-700'}`}>
                        {u.role}
                      </span>
                      <span className="text-gray-400 text-xs">{formatDate(u.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-display font-bold text-gray-900">Utilisateurs ({users.length})</h2>
              <input type="text" placeholder="Rechercher..." value={filter} onChange={e=>setFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm w-64"/>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Utilisateur</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Rôle</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Ville</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.filter(u => !filter || u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase())).map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={getAvatarUrl(u.avatar, u.name)} alt={u.name} className="w-9 h-9 rounded-xl object-cover"/>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                            <p className="text-gray-400 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role==='client'?'bg-blue-50 text-blue-700':u.role==='artisan'?'bg-green-50 text-green-700':u.role==='entreprise'?'bg-purple-50 text-purple-700':'bg-red-50 text-red-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{u.city || '-'}</td>
                      <td className="px-5 py-4 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => deleteUser(u._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ARTISANS */}
        {tab === 'artisans' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-display font-bold text-gray-900">Artisans ({artisans.length})</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                  {artisans.filter(a=>a.verifie).length} vérifiés
                </span>
                <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold">
                  {artisans.filter(a=>!a.verifie).length} en attente
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artisans.map(a => (
                <div key={a._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(a.user?.avatar, a.user?.name)} alt={a.user?.name} className="w-11 h-11 rounded-xl object-cover"/>
                      <div>
                        <p className="font-bold text-gray-900">{a.user?.name}</p>
                        <p className="text-blue-600 text-sm font-semibold">{a.metier}</p>
                        <p className="text-gray-400 text-xs">{a.user?.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${a.verifie?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>
                      {a.verifie ? '✓ Vérifié' : '⏳ En attente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                    <span>📍 {a.ville}</span>
                    <span>•</span>
                    <span>📅 {formatDate(a.createdAt)}</span>
                    {a.user?.phone && <><span>•</span><span>📞 {a.user.phone}</span></>}
                  </div>
                  <div className="flex gap-2">
                    {!a.verifie ? (
                      <button onClick={() => verifyArtisan(a._id, true)}
                        className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors">
                        ✓ Valider le profil
                      </button>
                    ) : (
                      <button onClick={() => verifyArtisan(a._id, false)}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                        Retirer la vérification
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENTREPRISES */}
        {tab === 'entreprises' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-display font-bold text-gray-900">Entreprises ({entreprises.length})</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                  {entreprises.filter(e=>e.verifie).length} certifiées
                </span>
                <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold">
                  {entreprises.filter(e=>!e.verifie).length} en attente
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entreprises.map(e => (
                <div key={e._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{e.nomEntreprise}</p>
                      <p className="text-gray-500 text-sm">Responsable : {e.nomResponsable}</p>
                      <p className="text-gray-400 text-xs">{e.user?.email}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${e.verifie?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>
                      {e.verifie ? '✓ Certifiée' : '⏳ En attente'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(e.lotsTravauxPropose||[]).map(l => (
                      <span key={l} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{l}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                    <span>📍 {e.ville}</span>
                    {e.rccm && <><span>•</span><span>RCCM: {e.rccm}</span></>}
                    <span>•</span><span>{formatDate(e.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    {!e.verifie ? (
                      <button onClick={() => verifyEntreprise(e._id, true)}
                        className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors">
                        ✓ Certifier l'entreprise
                      </button>
                    ) : (
                      <button onClick={() => verifyEntreprise(e._id, false)}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                        Retirer la certification
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
