import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const METEO_ICONS = { ensoleille:'☀️', nuageux:'⛅', pluvieux:'🌧️', orageux:'⛈️' };
const STATUT_JOURNAL = {
  soumis:   { bg:'#FFF7ED', text:'#EA580C', label:'⏳ Soumis' },
  vu:       { bg:'#EFF6FF', text:'#2563EB', label:'👁️ Vu' },
  valide:   { bg:'#F0FDF4', text:'#16A34A', label:'✅ Validé' },
  conteste: { bg:'#FFF1F2', text:'#E11D48', label:'⚠️ Contesté' },
};

export default function ConducteurDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [mission, setMission] = useState(null);
  const [journaux, setJournaux] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('journaux');
  const [showRapport, setShowRapport] = useState(false);
  const [rapport, setRapport] = useState({
    meteo:'ensoleille', avancement:0, activites:'', problemes:'',
    noteGenerale:'', nombreOuvriers:0, type:'quotidien'
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get(`/conducteur/missions/${id}/journaux`).catch(() => ({ data: { journaux: [] } })),
      api.get(`/conducteur/missions/${id}/stats`).catch(() => ({ data: {} })),
      api.get('/conducteur/mes-missions').catch(() => ({ data: [] })),
      api.get('/conducteur/missions').catch(() => ({ data: [] })),
    ]).then(([journauxRes, statsRes, mesMissionsRes, missionsRes]) => {
      setJournaux(journauxRes.data.journaux || []);
      setStats(statsRes.data);
      const toutes = [...(mesMissionsRes.data || []), ...(missionsRes.data || [])];
      const m = toutes.find(x => x._id === id);
      setMission(m);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]);

  const handleSubmitRapport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/conducteur/missions/${id}/journaux`, rapport);
      setShowRapport(false);
      loadData();
    } catch(err) {
      alert(err.response?.data?.message || 'Erreur');
    } finally { setSubmitting(false); }
  };

  const handleValider = async (journalId) => {
    try {
      await api.put(`/conducteur/journaux/${journalId}/valider`, {});
      loadData();
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const handleContester = async (journalId) => {
    const commentaire = prompt('Raison de la contestation :');
    if (!commentaire) return;
    try {
      await api.put(`/conducteur/journaux/${journalId}/contester`, { commentaire });
      loadData();
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const handleAccepterCandidature = async (conducteurId) => {
    if (!window.confirm('Accepter ce conducteur ?')) return;
    try {
      await api.put(`/conducteur/missions/${id}/accepter/${conducteurId}`);
      loadData();
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader/></div>;

  const isClient = mission?.client?._id === user?._id || mission?.client?._id === user?.id ||
    mission?.client === user?._id || mission?.client === user?.id;
  const isConducteur = mission?.conducteur?._id === user?._id || mission?.conducteur?._id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12 relative overflow-hidden" style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <Link to="/conducteur" className="text-blue-300 hover:text-white text-sm mb-4 inline-block">← Retour aux missions</Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-display font-black mb-2">{mission?.titre || 'Mission chantier'}</h1>
              <p className="text-blue-200">📍 {mission?.localisation}</p>
              {mission?.client?.name && <p className="text-blue-300 text-sm mt-1">Client : {mission.client.name}</p>}
            </div>
            {isConducteur && mission?.statut === 'en_cours' && (
              <button onClick={() => setShowRapport(true)}
                className="px-5 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-all shadow-lg">
                📝 Soumettre rapport
              </button>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label:'Avancement', value:`${stats.avancementActuel || 0}%`, icon:'📊' },
                { label:'Journaux', value:stats.totalJournaux || 0, icon:'📋' },
                { label:'Validés', value:stats.journauxValides || 0, icon:'✅' },
                { label:'Photos', value:stats.totalPhotos || 0, icon:'📸' },
              ].map((s,i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-blue-300 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Barre avancement */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">Avancement global</h3>
            <span className="text-2xl font-black text-blue-600">{mission?.avancementGlobal || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-4 transition-all duration-500"
              style={{width:`${mission?.avancementGlobal || 0}%`}}/>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id:'journaux', label:'📋 Journal de chantier' },
            { id:'candidatures', label:`👥 Candidatures (${mission?.candidatures?.length || 0})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Journal */}
        {tab === 'journaux' && (
          <div className="space-y-4">
            {journaux.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-500 mb-4">Aucun rapport soumis pour l'instant</p>
                {isConducteur && mission?.statut === 'en_cours' && (
                  <button onClick={() => setShowRapport(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                    Soumettre le premier rapport →
                  </button>
                )}
              </div>
            ) : journaux.map(j => {
              const statut = STATUT_JOURNAL[j.statut] || STATUT_JOURNAL.soumis;
              return (
                <div key={j._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">{METEO_ICONS[j.meteo] || '☀️'}</span>
                        <h4 className="font-bold text-gray-900 capitalize">
                          Rapport {j.type} — {new Date(j.date).toLocaleDateString('fr-FR')}
                        </h4>
                      </div>
                      <p className="text-gray-400 text-sm">Par {j.conducteur?.name}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0" style={{background: statut.bg, color: statut.text}}>
                      {statut.label}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Avancement</span>
                      <span className="font-bold text-blue-600">{j.avancement}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 rounded-full h-2" style={{width:`${j.avancement}%`}}/>
                    </div>
                  </div>

                  {j.activites?.length > 0 && (
                    <div className="mb-3">
                      <p className="font-bold text-gray-700 text-sm mb-1">✅ Activités</p>
                      <ul className="text-gray-500 text-sm space-y-0.5">
                        {j.activites.map((a,i) => <li key={i}>• {a}</li>)}
                      </ul>
                    </div>
                  )}

                  {j.problemes?.length > 0 && (
                    <div className="mb-3">
                      <p className="font-bold text-gray-700 text-sm mb-1">⚠️ Problèmes</p>
                      <ul className="text-red-500 text-sm space-y-0.5">
                        {j.problemes.map((p,i) => <li key={i}>• {p}</li>)}
                      </ul>
                    </div>
                  )}

                  {j.noteGenerale && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-gray-600 text-sm italic">"{j.noteGenerale}"</p>
                    </div>
                  )}

                  {isClient && j.statut === 'soumis' && (
                    <div className="flex gap-3 pt-3 border-t border-gray-100">
                      <button onClick={() => handleValider(j._id)}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
                        ✅ Valider
                      </button>
                      <button onClick={() => handleContester(j._id)}
                        className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100">
                        ⚠️ Contester
                      </button>
                    </div>
                  )}

                  {j.commentaireClient && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-amber-700 text-sm"><strong>Commentaire :</strong> {j.commentaireClient}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Candidatures */}
        {tab === 'candidatures' && (
          <div className="space-y-4">
            {!mission?.candidatures?.length ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-3">👥</div>
                <p className="text-gray-500">Aucune candidature pour l'instant</p>
              </div>
            ) : mission.candidatures.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{c.conducteur?.name || 'Conducteur'}</p>
                    <p className="text-gray-500 text-sm">
                      {c.tarif ? `${new Intl.NumberFormat('fr-FR').format(c.tarif)} FCFA/jour` : 'Tarif à négocier'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    c.statut === 'accepte' ? 'bg-green-50 text-green-700' :
                    c.statut === 'refuse' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {c.statut === 'accepte' ? '✅ Accepté' : c.statut === 'refuse' ? '❌ Refusé' : '⏳ En attente'}
                  </span>
                </div>
                {c.message && <p className="text-gray-600 text-sm mb-3 italic">"{c.message}"</p>}
                {isClient && c.statut === 'en_attente' && mission?.statut === 'ouverte' && (
                  <button onClick={() => handleAccepterCandidature(c.conducteur?._id || c.conducteur)}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">
                    ✅ Accepter ce conducteur
                  </button>
                )}
              </div>
            ))}
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
            <form onSubmit={handleSubmitRapport} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                  <select value={rapport.type} onChange={e => setRapport(r=>({...r,type:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white">
                    <option value="quotidien">📅 Quotidien</option>
                    <option value="hebdomadaire">📊 Hebdomadaire</option>
                    <option value="mensuel">📈 Mensuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Météo</label>
                  <select value={rapport.meteo} onChange={e => setRapport(r=>({...r,meteo:e.target.value}))}
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
                  onChange={e => setRapport(r=>({...r,avancement:parseInt(e.target.value)}))}
                  className="w-full accent-green-600"/>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-green-600 rounded-full h-2" style={{width:`${rapport.avancement}%`}}/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Activités du jour</label>
                <textarea value={rapport.activites} onChange={e => setRapport(r=>({...r,activites:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Ex: Coulage dalle, pose ferraillage..."/>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Problèmes rencontrés</label>
                <textarea value={rapport.problemes} onChange={e => setRapport(r=>({...r,problemes:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Ex: Manque de sable..."/>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Note générale</label>
                <textarea value={rapport.noteGenerale} onChange={e => setRapport(r=>({...r,noteGenerale:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Observations, recommandations..."/>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre d'ouvriers</label>
                <input type="number" min="0" value={rapport.nombreOuvriers}
                  onChange={e => setRapport(r=>({...r,nombreOuvriers:parseInt(e.target.value)}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"/>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 shadow-lg">
                {submitting ? '⏳ Envoi...' : '📤 Soumettre le rapport'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
