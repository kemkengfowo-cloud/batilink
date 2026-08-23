import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const METEO_ICONS = { ensoleille:'☀️', nuageux:'⛅', pluvieux:'🌧️', orageux:'⛈️' };
const STATUT_RAPPORT = {
  soumis:   { bg:'#FFF7ED', text:'#EA580C', label:'⏳ Soumis' },
  vu:       { bg:'#EFF6FF', text:'#2563EB', label:'👁️ Vu' },
  valide:   { bg:'#F0FDF4', text:'#16A34A', label:'✅ Validé' },
  conteste: { bg:'#FFF1F2', text:'#E11D48', label:'⚠️ Contesté' },
};

export default function MonChantier() {
  const { id } = useParams();
  const { user } = useAuth();
  const [chantier, setChantier] = useState(null);
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRapport, setShowRapport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filtre, setFiltre] = useState('');
  const [rapport, setRapport] = useState({
    type:'quotidien', meteo:'ensoleille', avancement:0,
    activites:'', problemes:'', noteGenerale:'', nombreOuvriers:0
  });

  const loadData = () => {
    setLoading(true);
    const url = filtre ? `/conducteur-travaux/chantiers/${id}/rapports?type=${filtre}` : `/conducteur-travaux/chantiers/${id}/rapports`;
    Promise.all([
      api.get('/conducteur-travaux/mes-chantiers').catch(() => ({ data: [] })),
      api.get(url).catch(() => ({ data: { rapports: [] } })),
    ]).then(([chantiersRes, rapportsRes]) => {
      const c = (chantiersRes.data || []).find(x => x._id === id);
      setChantier(c);
      setRapports(rapportsRes.data.rapports || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id, filtre]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/conducteur-travaux/chantiers/${id}/rapports`, rapport);
      setShowRapport(false);
      setRapport({ type:'quotidien', meteo:'ensoleille', avancement:0, activites:'', problemes:'', noteGenerale:'', nombreOuvriers:0 });
      loadData();
    } catch(err) {
      alert(err.response?.data?.message || 'Erreur');
    } finally { setSubmitting(false); }
  };

  const handleValider = async (rapportId) => {
    try {
      await api.put(`/conducteur-travaux/rapports/${rapportId}/valider`, {});
      loadData();
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const handleContester = async (rapportId) => {
    const commentaire = prompt('Raison de la contestation :');
    if (!commentaire) return;
    try {
      await api.put(`/conducteur-travaux/rapports/${rapportId}/contester`, { commentaire });
      loadData();
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const isClient = chantier?.client?._id === user?._id || chantier?.client?._id === user?.id;
  const isConducteur = chantier?.conducteur?._id === user?._id || chantier?.conducteur?._id === user?.id;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader/></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12 relative overflow-hidden" style={{background:'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <Link to="/conducteur-travaux" className="text-green-300 hover:text-white text-sm mb-4 inline-block">← Mes chantiers</Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-display font-black mb-2">{chantier?.titreChantier || 'Mon Chantier'}</h1>
              <p className="text-green-200">📍 {chantier?.localisation} — {chantier?.ville}</p>
              {chantier?.client?.name && <p className="text-green-300 text-sm mt-1">Client : {chantier.client.name} • {chantier.client.phone}</p>}
            </div>
            {isConducteur && (
              <button onClick={() => setShowRapport(true)}
                className="flex-shrink-0 px-5 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg">
                📝 Nouveau rapport
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label:'Avancement', value:`${chantier?.avancementGlobal || 0}%`, icon:'📊' },
              { label:'Rapports', value:rapports.length, icon:'📋' },
              { label:'Validés', value:rapports.filter(r=>r.statut==='valide').length, icon:'✅' },
              { label:'Contestés', value:rapports.filter(r=>r.statut==='conteste').length, icon:'⚠️' },
            ].map((s,i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-green-300 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Barre avancement */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">Avancement global</h3>
            <span className="text-2xl font-black text-green-600">{chantier?.avancementGlobal || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full h-4 transition-all"
              style={{width:`${chantier?.avancementGlobal || 0}%`}}/>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { v:'', l:'Tous les rapports' },
            { v:'quotidien', l:'📅 Quotidiens' },
            { v:'hebdomadaire', l:'📊 Hebdomadaires' },
            { v:'mensuel', l:'📈 Mensuels' },
          ].map(f => (
            <button key={f.v} onClick={() => setFiltre(f.v)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filtre === f.v ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'}`}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Rapports */}
        {rapports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 mb-4">Aucun rapport soumis</p>
            {isConducteur && (
              <button onClick={() => setShowRapport(true)} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">
                Soumettre le premier rapport →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {rapports.map(r => {
              const statut = STATUT_RAPPORT[r.statut] || STATUT_RAPPORT.soumis;
              return (
                <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{METEO_ICONS[r.meteo] || '☀️'}</span>
                      <div>
                        <p className="font-bold text-gray-900 capitalize">Rapport {r.type} — {new Date(r.date).toLocaleDateString('fr-FR')}</p>
                        <p className="text-gray-400 text-xs">{r.conducteur?.name}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background:statut.bg, color:statut.text}}>
                      {statut.label}
                    </span>
                  </div>

                  {/* Avancement */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Avancement</span>
                      <span className="font-bold text-green-600">{r.avancement}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 rounded-full h-2" style={{width:`${r.avancement}%`}}/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    {r.activites?.length > 0 && (
                      <div>
                        <p className="font-bold text-gray-700 mb-1">✅ Activités</p>
                        <ul className="text-gray-500 space-y-0.5">
                          {r.activites.map((a,i) => <li key={i}>• {a}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.problemes?.length > 0 && (
                      <div>
                        <p className="font-bold text-gray-700 mb-1">⚠️ Problèmes</p>
                        <ul className="text-red-500 space-y-0.5">
                          {r.problemes.map((p,i) => <li key={i}>• {p}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {r.noteGenerale && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <p className="text-gray-600 text-sm italic">"{r.noteGenerale}"</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                    <span>👷 {r.nombreOuvriers} ouvriers</span>
                  </div>

                  {isClient && r.statut === 'soumis' && (
                    <div className="flex gap-3 pt-3 border-t border-gray-100">
                      <button onClick={() => handleValider(r._id)}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
                        ✅ Valider
                      </button>
                      <button onClick={() => handleContester(r._id)}
                        className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100">
                        ⚠️ Contester
                      </button>
                    </div>
                  )}

                  {r.commentaireClient && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-amber-700 text-sm"><strong>Commentaire client :</strong> {r.commentaireClient}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal rapport */}
      {showRapport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">📝 Soumettre un rapport</h2>
                <button onClick={() => setShowRapport(false)} className="text-white/70 hover:text-white text-2xl">×</button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type de rapport</label>
                  <select value={rapport.type} onChange={e=>setRapport(r=>({...r,type:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white">
                    <option value="quotidien">📅 Quotidien</option>
                    <option value="hebdomadaire">📊 Hebdomadaire</option>
                    <option value="mensuel">📈 Mensuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Météo</label>
                  <select value={rapport.meteo} onChange={e=>setRapport(r=>({...r,meteo:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white">
                    <option value="ensoleille">☀️ Ensoleillé</option>
                    <option value="nuageux">⛅ Nuageux</option>
                    <option value="pluvieux">🌧️ Pluvieux</option>
                    <option value="orageux">⛈️ Orageux</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Avancement : {rapport.avancement}%</label>
                <input type="range" min="0" max="100" value={rapport.avancement}
                  onChange={e=>setRapport(r=>({...r,avancement:parseInt(e.target.value)}))}
                  className="w-full accent-green-600"/>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-green-600 rounded-full h-2" style={{width:`${rapport.avancement}%`}}/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Activités réalisées</label>
                <textarea value={rapport.activites} onChange={e=>setRapport(r=>({...r,activites:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Ex: Coulage dalle RDC, pose ferraillage niveau 1..."/>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Problèmes rencontrés</label>
                <textarea value={rapport.problemes} onChange={e=>setRapport(r=>({...r,problemes:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Ex: Manque de sable, ouvriers absents..."/>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Note générale et recommandations</label>
                <textarea value={rapport.noteGenerale} onChange={e=>setRapport(r=>({...r,noteGenerale:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Observations, recommandations pour la suite..."/>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre d'ouvriers présents</label>
                <input type="number" min="0" value={rapport.nombreOuvriers}
                  onChange={e=>setRapport(r=>({...r,nombreOuvriers:parseInt(e.target.value)}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"/>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 shadow-lg">
                {submitting ? '⏳ Envoi en cours...' : '📤 Soumettre le rapport'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
