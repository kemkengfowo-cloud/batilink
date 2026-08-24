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

const RAPPORT_INITIAL = {
  type:'quotidien', meteo:'ensoleille', avancement:0,
  activites:'', problemes:'', solutions:'', noteGenerale:'',
  recommandations:'', nombreOuvriers:0,
  equipes:'', materiaux:''
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
  const [rapport, setRapport] = useState(RAPPORT_INITIAL);
  const [onglet, setOnglet] = useState('journal');

  const loadData = () => {
    setLoading(true);
    const url = filtre
      ? `/conducteur-travaux/chantiers/${id}/rapports?type=${filtre}`
      : `/conducteur-travaux/chantiers/${id}/rapports`;
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
      const payload = {
        ...rapport,
        activites: rapport.activites ? rapport.activites.split('\n').filter(Boolean) : [],
        problemes: rapport.problemes ? rapport.problemes.split('\n').filter(Boolean) : [],
        solutions: rapport.solutions ? rapport.solutions.split('\n').filter(Boolean) : [],
        equipes: rapport.equipes ? rapport.equipes.split('\n').filter(Boolean) : [],
      };
      await api.post(`/conducteur-travaux/chantiers/${id}/rapports`, payload);
      setShowRapport(false);
      setRapport(RAPPORT_INITIAL);
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

  const isClient = chantier?.client?._id === user?._id || chantier?.client?._id === user?.id ||
    chantier?.client === user?._id || chantier?.client === user?.id;
  const isConducteur = chantier?.conducteur?._id === user?._id || chantier?.conducteur?._id === user?.id ||
    chantier?.conducteur === user?._id || chantier?.conducteur === user?.id;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader/></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12 relative overflow-hidden" style={{background:'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <Link to="/dashboard" className="text-green-300 hover:text-white text-sm mb-4 inline-block">← Tableau de bord</Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-display font-black mb-2">{chantier?.titreChantier || 'Mon Chantier'}</h1>
              <p className="text-green-200">📍 {chantier?.localisation} — {chantier?.ville}</p>
              {chantier?.client?.name && (
                <p className="text-green-300 text-sm mt-1">
                  Client : {chantier.client.name}
                  {chantier.client.phone && ` • ${chantier.client.phone}`}
                </p>
              )}
            </div>
            {isConducteur && (
              <button onClick={() => setShowRapport(true)}
                className="flex-shrink-0 px-5 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg">
                📝 Nouveau rapport
              </button>
            )}
          </div>

          {/* Stats */}
cd /c/Users/Kemke/OneDrive/Desktop/batilink-projet-complet/batilink
cat > client/src/pages/MonChantier.jsx << 'ENDOFFILE'
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

const RAPPORT_INITIAL = {
  type:'quotidien', meteo:'ensoleille', avancement:0,
  activites:'', problemes:'', solutions:'', noteGenerale:'',
  recommandations:'', nombreOuvriers:0,
  equipes:'', materiaux:''
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
  const [rapport, setRapport] = useState(RAPPORT_INITIAL);
  const [onglet, setOnglet] = useState('journal');

  const loadData = () => {
    setLoading(true);
    const url = filtre
      ? `/conducteur-travaux/chantiers/${id}/rapports?type=${filtre}`
      : `/conducteur-travaux/chantiers/${id}/rapports`;
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
      const payload = {
        ...rapport,
        activites: rapport.activites ? rapport.activites.split('\n').filter(Boolean) : [],
        problemes: rapport.problemes ? rapport.problemes.split('\n').filter(Boolean) : [],
        solutions: rapport.solutions ? rapport.solutions.split('\n').filter(Boolean) : [],
        equipes: rapport.equipes ? rapport.equipes.split('\n').filter(Boolean) : [],
      };
      await api.post(`/conducteur-travaux/chantiers/${id}/rapports`, payload);
      setShowRapport(false);
      setRapport(RAPPORT_INITIAL);
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

  const isClient = chantier?.client?._id === user?._id || chantier?.client?._id === user?.id ||
    chantier?.client === user?._id || chantier?.client === user?.id;
  const isConducteur = chantier?.conducteur?._id === user?._id || chantier?.conducteur?._id === user?.id ||
    chantier?.conducteur === user?._id || chantier?.conducteur === user?.id;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader/></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12 relative overflow-hidden" style={{background:'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <Link to="/dashboard" className="text-green-300 hover:text-white text-sm mb-4 inline-block">← Tableau de bord</Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-display font-black mb-2">{chantier?.titreChantier || 'Mon Chantier'}</h1>
              <p className="text-green-200">📍 {chantier?.localisation} — {chantier?.ville}</p>
              {chantier?.client?.name && (
                <p className="text-green-300 text-sm mt-1">
                  Client : {chantier.client.name}
                  {chantier.client.phone && ` • ${chantier.client.phone}`}
                </p>
              )}
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
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Début : {chantier?.dateDebut ? new Date(chantier.dateDebut).toLocaleDateString('fr-FR') : '-'}</span>
            <span>Fin prévue : {chantier?.dateFin ? new Date(chantier.dateFin).toLocaleDateString('fr-FR') : '-'}</span>
          </div>
        </div>

        {/* Infos chantier */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">📋 Informations du chantier</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Type</p>
              <p className="font-semibold capitalize">{chantier?.typeChantier || '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Superficie</p>
              <p className="font-semibold">{chantier?.superficie || 'Non définie'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Tarif/jour</p>
              <p className="font-semibold text-green-600">{chantier?.tarifjourFinal ? `${new Intl.NumberFormat('fr-FR').format(chantier.tarifjourFinal)} FCFA` : '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Nb rapports</p>
              <p className="font-semibold">{chantier?.nombreRapports || 0}</p>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { v:'journal', l:'📋 Journal de chantier' },
            { v:'quotidien', l:'📅 Quotidiens' },
            { v:'hebdomadaire', l:'📊 Hebdomadaires' },
            { v:'mensuel', l:'📈 Mensuels' },
          ].map(f => (
            <button key={f.v} onClick={() => { setOnglet(f.v); setFiltre(f.v === 'journal' ? '' : f.v); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${onglet === f.v ? 'bg-green-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'}`}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Rapports */}
        {rapports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 mb-2 font-semibold">Aucun rapport soumis</p>
            <p className="text-gray-400 text-sm mb-6">Commencez à documenter l'avancement du chantier</p>
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
                  {/* En-tête rapport */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{METEO_ICONS[r.meteo] || '☀️'}</span>
                      <div>
                        <p className="font-bold text-gray-900 capitalize">
                          Rapport {r.type} — {new Date(r.date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-gray-400 text-xs">Par {r.conducteur?.name}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                      style={{background:statut.bg, color:statut.text}}>
                      {statut.label}
                    </span>
                  </div>

                  {/* Avancement */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Avancement</span>
                      <span className="font-black text-green-600">{r.avancement}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full h-3"
                        style={{width:`${r.avancement}%`}}/>
                    </div>
                  </div>

                  {/* Grille infos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    {r.activites?.length > 0 && (
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="font-bold text-green-800 mb-2">✅ Activités réalisées</p>
                        <ul className="text-green-700 space-y-1">
                          {r.activites.map((a,i) => <li key={i} className="flex gap-2"><span>•</span><span>{a}</span></li>)}
                        </ul>
                      </div>
                    )}
                    {r.problemes?.length > 0 && (
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="font-bold text-red-800 mb-2">⚠️ Problèmes rencontrés</p>
                        <ul className="text-red-700 space-y-1">
                          {r.problemes.map((p,i) => <li key={i} className="flex gap-2"><span>•</span><span>{p}</span></li>)}
                        </ul>
                      </div>
                    )}
                    {r.solutions?.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="font-bold text-blue-800 mb-2">💡 Solutions appliquées</p>
                        <ul className="text-blue-700 space-y-1">
                          {r.solutions.map((s,i) => <li key={i} className="flex gap-2"><span>•</span><span>{s}</span></li>)}
                        </ul>
                      </div>
                    )}
                    {r.equipes?.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="font-bold text-gray-800 mb-2">👷 Équipes présentes</p>
                        <ul className="text-gray-600 space-y-1">
                          {r.equipes.map((e,i) => <li key={i} className="flex gap-2"><span>•</span><span>{e}</span></li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Infos supplémentaires */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">👷 {r.nombreOuvriers} ouvrier{r.nombreOuvriers > 1 ? 's' : ''}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full capitalize">{METEO_ICONS[r.meteo]} {r.meteo}</span>
                  </div>

                  {r.noteGenerale && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <p className="font-bold text-amber-800 text-sm mb-1">📝 Note générale</p>
                      <p className="text-amber-700 text-sm italic">"{r.noteGenerale}"</p>
                    </div>
                  )}

                  {r.recommandations && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                      <p className="font-bold text-purple-800 text-sm mb-1">💼 Recommandations</p>
                      <p className="text-purple-700 text-sm">{r.recommandations}</p>
                    </div>
                  )}

                  {/* Boutons validation client */}
                  {isClient && r.statut === 'soumis' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button onClick={() => handleValider(r._id)}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
                        ✅ Valider le rapport
                      </button>
                      <button onClick={() => handleContester(r._id)}
                        className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100">
                        ⚠️ Contester
                      </button>
                    </div>
                  )}

                  {r.commentaireClient && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-amber-700 text-sm">
                        <strong>Commentaire client :</strong> {r.commentaireClient}
                      </p>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-4">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white rounded-t-3xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">📝 Journal de Chantier</h2>
                  <p className="text-green-200 text-sm">{chantier?.titreChantier}</p>
                </div>
                <button onClick={() => setShowRapport(false)} className="text-white/70 hover:text-white text-2xl">×</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Type et météo */}
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">Météo du jour</label>
                  <select value={rapport.meteo} onChange={e=>setRapport(r=>({...r,meteo:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white">
                    <option value="ensoleille">☀️ Ensoleillé</option>
                    <option value="nuageux">⛅ Nuageux</option>
                    <option value="pluvieux">🌧️ Pluvieux</option>
                    <option value="orageux">⛈️ Orageux</option>
                  </select>
                </div>
              </div>

              {/* Avancement */}
              <div className="bg-green-50 rounded-2xl p-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Avancement global : <span className="text-green-600 text-lg">{rapport.avancement}%</span>
                </label>
                <input type="range" min="0" max="100" value={rapport.avancement}
                  onChange={e=>setRapport(r=>({...r,avancement:parseInt(e.target.value)}))}
                  className="w-full accent-green-600"/>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div className="bg-green-600 rounded-full h-3 transition-all" style={{width:`${rapport.avancement}%`}}/>
                </div>
              </div>

              {/* Personnel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre d'ouvriers</label>
                  <input type="number" min="0" value={rapport.nombreOuvriers}
                    onChange={e=>setRapport(r=>({...r,nombreOuvriers:parseInt(e.target.value)||0}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Équipes présentes</label>
                  <input type="text" value={rapport.equipes}
                    onChange={e=>setRapport(r=>({...r,equipes:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                    placeholder="Ex: Maçons, Ferraileurs"/>
                </div>
              </div>

              {/* Activités */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ✅ Activités réalisées <span className="text-gray-400 font-normal">(une par ligne)</span>
                </label>
                <textarea value={rapport.activites} onChange={e=>setRapport(r=>({...r,activites:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={3}
                  placeholder={"Coulage dalle RDC\nPose ferraillage niveau 1\nInstallation coffrage"}/>
              </div>

              {/* Problèmes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ⚠️ Problèmes rencontrés <span className="text-gray-400 font-normal">(un par ligne)</span>
                </label>
                <textarea value={rapport.problemes} onChange={e=>setRapport(r=>({...r,problemes:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder={"Manque de sable\nOuvriers absents"}/>
              </div>

              {/* Solutions */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  💡 Solutions appliquées <span className="text-gray-400 font-normal">(une par ligne)</span>
                </label>
                <textarea value={rapport.solutions} onChange={e=>setRapport(r=>({...r,solutions:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder={"Commande sable pour demain\nRemplacement ouvrier"}/>
              </div>

              {/* Note générale */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">📝 Note générale</label>
                <textarea value={rapport.noteGenerale} onChange={e=>setRapport(r=>({...r,noteGenerale:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Observations générales sur l'avancement..."/>
              </div>

              {/* Recommandations */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">💼 Recommandations</label>
                <textarea value={rapport.recommandations} onChange={e=>setRapport(r=>({...r,recommandations:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Recommandations pour la prochaine étape..."/>
              </div>

              {/* Note photos */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-700 text-sm font-semibold">📸 Photos de chantier</p>
                <p className="text-blue-600 text-xs mt-1">La fonctionnalité d'upload de photos arrive prochainement via Cloudinary !</p>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 shadow-lg text-lg">
                {submitting ? '⏳ Envoi en cours...' : '📤 Soumettre le rapport'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
