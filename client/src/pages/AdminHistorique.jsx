import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, formatTimestamp } from '../utils/helpers';

const ACTION_LABELS = {
  INSCRIPTION: { label:'Inscription', color:'bg-green-50 text-green-700', icon:'👤' },
  CONNEXION: { label:'Connexion', color:'bg-blue-50 text-blue-700', icon:'🔑' },
  PROJET_PUBLIE: { label:'Projet publie', color:'bg-purple-50 text-purple-700', icon:'📋' },
  DEVIS_ENVOYE: { label:'Devis envoye', color:'bg-yellow-50 text-yellow-700', icon:'📄' },
  DEVIS_ACCEPTE: { label:'Devis accepte', color:'bg-green-50 text-green-700', icon:'✅' },
  DEVIS_REFUSE: { label:'Devis refuse', color:'bg-red-50 text-red-700', icon:'❌' },
  TRAVAUX_VALIDES: { label:'Travaux valides', color:'bg-green-50 text-green-700', icon:'💰' },
  CONTRAT_CREE: { label:'Contrat cree', color:'bg-blue-50 text-blue-700', icon:'✍️' },
  CONTRAT_SIGNE: { label:'Contrat signe', color:'bg-green-50 text-green-700', icon:'📝' },
  CONTRAT_TERMINE: { label:'Contrat termine', color:'bg-purple-50 text-purple-700', icon:'✅' },
  LITIGE_OUVERT: { label:'Litige ouvert', color:'bg-red-50 text-red-700', icon:'⚖️' },
  VISITE_DEMANDEE: { label:'Visite demandee', color:'bg-indigo-50 text-indigo-700', icon:'🔍' },
  VISITE_ACCEPTEE: { label:'Visite acceptee', color:'bg-blue-50 text-blue-700', icon:'👷' },
  RAPPORT_SOUMIS: { label:'Rapport soumis', color:'bg-green-50 text-green-700', icon:'📋' },
  AVIS_LAISSE: { label:'Avis laisse', color:'bg-amber-50 text-amber-700', icon:'⭐' },
  MESSAGE_ENVOYE: { label:'Message', color:'bg-gray-100 text-gray-600', icon:'💬' },
  MISSION_PUBLIEE: { label:'Mission publiee', color:'bg-purple-50 text-purple-700', icon:'👷' },
};

export default function AdminHistorique() {
  const [historique, setHistorique] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ action:'', role:'', matricule:'', debut:'', fin:'' });
  const [search, setSearch] = useState({});
  const [activeTab, setActiveTab] = useState('journal');

  useEffect(() => {
    loadData();
  }, [page, search]);

  useEffect(() => {
    api.get('/historique/stats').then(res => setStats(res.data)).catch(()=>{});
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:50, ...Object.fromEntries(Object.entries(search).filter(([,v])=>v)) });
      const res = await api.get(`/historique?${params}`);
      setHistorique(res.data.historique || []);
      setTotal(res.data.total || 0);
    } catch { setHistorique([]); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setSearch({...filters}); setPage(1); };
  const handleReset = () => { setFilters({action:'',role:'',matricule:'',debut:'',fin:''}); setSearch({}); setPage(1); };

  const inputCls = "px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm bg-white";

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/admin" className="text-blue-300 hover:text-white text-sm font-medium">← Panel Admin</Link>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Journal d activite</h1>
          <p className="text-blue-300 text-sm mt-1">{total} actions enregistrees au total</p>

          <div className="flex gap-1 mt-5">
            {[{id:'journal',label:'Journal'},{id:'stats',label:'Statistiques'}].map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${activeTab===t.id?'bg-white text-blue-700':'text-blue-200 hover:bg-white/10'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Actions les plus frequentes */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Actions les plus frequentes</h3>
                <div className="space-y-2">
                  {stats.parAction?.slice(0,8).map(a=>(
                    <div key={a._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{ACTION_LABELS[a._id]?.icon||'•'}</span>
                        <span className="text-sm text-gray-600">{ACTION_LABELS[a._id]?.label||a._id}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{a.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Par role */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Activite par role</h3>
                <div className="space-y-3">
                  {stats.parRole?.map(r=>(
                    <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r._id==='client'?'bg-blue-50 text-blue-700':r._id==='artisan'?'bg-green-50 text-green-700':r._id==='entreprise'?'bg-purple-50 text-purple-700':'bg-red-50 text-red-700'}`}>
                        {r._id||'inconnu'}
                      </span>
                      <span className="font-bold text-gray-900">{r.count} actions</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activite 7 derniers jours */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">7 derniers jours</h3>
                <div className="space-y-2">
                  {stats.parJour?.map(j=>(
                    <div key={j._id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{j._id}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full"
                            style={{width:`${Math.min(100,(j.count/(stats.parJour[0]?.count||1))*100)}%`}}></div>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{j.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="space-y-5">
            {/* Filtres */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <input type="text" placeholder="Matricule..." value={filters.matricule}
                  onChange={e=>setFilters(f=>({...f,matricule:e.target.value}))} className={inputCls}/>
                <select value={filters.action} onChange={e=>setFilters(f=>({...f,action:e.target.value}))} className={inputCls}>
                  <option value="">Toutes les actions</option>
                  {Object.entries(ACTION_LABELS).map(([k,v])=>(
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
                <select value={filters.role} onChange={e=>setFilters(f=>({...f,role:e.target.value}))} className={inputCls}>
                  <option value="">Tous les roles</option>
                  <option value="client">Client</option>
                  <option value="artisan">Artisan</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="admin">Admin</option>
                </select>
                <input type="date" value={filters.debut} onChange={e=>setFilters(f=>({...f,debut:e.target.value}))} className={inputCls}/>
                <input type="date" value={filters.fin} onChange={e=>setFilters(f=>({...f,fin:e.target.value}))} className={inputCls}/>
              </div>
              <div className="flex gap-2 mt-3">
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">Filtrer</button>
                <button type="button" onClick={handleReset} className="px-5 py-2 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50">Reset</button>
                <a href={`${process.env.REACT_APP_API_URL}/api/admin/export/historique`} target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700">📥 Export CSV</a>
              </div>
            </form>

            {/* Tableau */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Matricule</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Utilisateur</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Action</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Details</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Statut</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Date creation</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Date maj</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan="8" className="text-center py-10 text-gray-400">Chargement...</td></tr>
                    ) : historique.length === 0 ? (
                      <tr><td colSpan="8" className="text-center py-10 text-gray-400">Aucune action trouvee</td></tr>
                    ) : historique.map(h=>(
                      <tr key={h._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-lg text-gray-700">{h.matricule}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{h.utilisateur?.nom||'Inconnu'}</p>
                          <p className="text-xs text-gray-400">{h.utilisateur?.email||''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${h.utilisateur?.role==='client'?'bg-blue-50 text-blue-700':h.utilisateur?.role==='artisan'?'bg-green-50 text-green-700':h.utilisateur?.role==='entreprise'?'bg-purple-50 text-purple-700':'bg-red-50 text-red-700'}`}>
                            {h.utilisateur?.role||'inconnu'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ACTION_LABELS[h.action]?.color||'bg-gray-100 text-gray-600'}`}>
                            {ACTION_LABELS[h.action]?.icon} {ACTION_LABELS[h.action]?.label||h.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-xs text-gray-500 truncate">
                            {h.details ? Object.entries(h.details).slice(0,2).map(([k,v])=>`${k}: ${v}`).join(' | ') : '-'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${h.statut==='succes'?'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>
                            {h.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap font-mono">{formatTimestamp(h.createdAt)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap font-mono">{formatTimestamp(h.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > 50 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">{total} actions au total</p>
                  <div className="flex gap-2">
                    <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:border-blue-300">
                      ← Precedent
                    </button>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
                      {page} / {Math.ceil(total/50)}
                    </span>
                    <button onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(total/50)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:border-blue-300">
                      Suivant →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
