import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const CLOUD_NAME = 'q2xbk0zn';
const UPLOAD_PRESET = 'byh_chantier';

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'byh/chantiers');
  const res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload', { method: 'POST', body: formData });
  const data = await res.json();
  return data.secure_url;
};

const METEO_ICONS = { ensoleille: '☀️', nuageux: '⛅', pluvieux: '🌧️', orageux: '⛈️' };
const STATUT_RAPPORT = {
  soumis: { bg: '#FFF7ED', text: '#EA580C', label: '⏳ Soumis' },
  vu: { bg: '#EFF6FF', text: '#2563EB', label: '👁️ Vu' },
  valide: { bg: '#F0FDF4', text: '#16A34A', label: '✅ Validé' },
  conteste: { bg: '#FFF1F2', text: '#E11D48', label: '⚠️ Contesté' },
};

const RAPPORT_INITIAL = {
  type: 'quotidien', meteo: 'ensoleille', avancement: 0,
  activites: '', problemes: '', solutions: '',
  noteGenerale: '', recommandations: '',
  nombreOuvriers: 0, equipes: '',
};

function getStatutClass(statut) {
  if (statut === 'confirme') return 'px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700';
  if (statut === 'echoue') return 'px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600';
  return 'px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700';
}

function getStatutLabel(statut) {
  if (statut === 'confirme') return '✅ Confirmé';
  if (statut === 'echoue') return '❌ Échoué';
  return '⏳ En attente';
}

function getFiltreClass(actif) {
  if (actif) return 'px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-green-600 text-white shadow';
  return 'px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-white text-gray-600 border border-gray-200 hover:border-green-300';
}

export default function MonChantier() {
  const { id } = useParams();
  const { user } = useAuth();
  const [chantier, setChantier] = useState(null);
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRapport, setShowRapport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPaiement, setShowPaiement] = useState(false);
  const [paiementForm, setPaiementForm] = useState({ operateur: 'orange_money', telephone: '', nombreJours: 7 });
  const [payingConducteur, setPayingConducteur] = useState(false);
  const [paiementsConducteur, setPaiementsConducteur] = useState([]);
  const [filtre, setFiltre] = useState('');
  const [rapport, setRapport] = useState(RAPPORT_INITIAL);
  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  const loadData = () => {
    setLoading(true);
    const rapportUrl = filtre
      ? '/conducteur-travaux/chantiers/' + id + '/rapports?type=' + filtre
      : '/conducteur-travaux/chantiers/' + id + '/rapports';
    const chantiersUrl = user && user.role === 'conducteur'
      ? '/conducteur-travaux/mes-chantiers'
      : '/conducteur-travaux/mes-demandes';
    Promise.all([
      api.get(chantiersUrl).catch(() => ({ data: [] })),
      api.get(rapportUrl).catch(() => ({ data: { rapports: [] } })),
      api.get('/paiements-conducteur/demande/' + id).catch(() => ({ data: { paiements: [] } })),
    ]).then(([chantiersRes, rapportsRes, paiementsRes]) => {
      const list = Array.isArray(chantiersRes.data) ? chantiersRes.data : [];
      const c = list.find((x) => x._id === id);
      setChantier(c);
      setRapports(rapportsRes.data.rapports || []);
      setPaiementsConducteur(paiementsRes.data.paiements || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id, filtre]);

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingPhotos(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadToCloudinary(f)));
      setPhotos((prev) => prev.concat(urls.map((url) => ({ url: url, legende: '' }))));
    } catch (err) {
      alert('Erreur upload: ' + err.message);
    } finally { setUploadingPhotos(false); }
  };

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = Object.assign({}, rapport, {
        activites: rapport.activites ? rapport.activites.split('\n').filter(Boolean) : [],
        problemes: rapport.problemes ? rapport.problemes.split('\n').filter(Boolean) : [],
        solutions: rapport.solutions ? rapport.solutions.split('\n').filter(Boolean) : [],
        equipes: rapport.equipes ? rapport.equipes.split('\n').filter(Boolean) : [],
        photos: photos,
      });
      await api.post('/conducteur-travaux/chantiers/' + id + '/rapports', payload);
      setShowRapport(false);
      setRapport(RAPPORT_INITIAL);
      setPhotos([]);
      loadData();
    } catch (err) {
      alert(err.response && err.response.data ? err.response.data.message : 'Erreur');
    } finally { setSubmitting(false); }
  };

  const handleValider = async (rapportId) => {
    try {
      await api.put('/conducteur-travaux/rapports/' + rapportId + '/valider', {});
      loadData();
    } catch (err) { alert(err.response && err.response.data ? err.response.data.message : 'Erreur'); }
  };

  const handleContester = async (rapportId) => {
    const commentaire = prompt('Raison de la contestation :');
    if (!commentaire) return;
    try {
      await api.put('/conducteur-travaux/rapports/' + rapportId + '/contester', { commentaire: commentaire });
      loadData();
    } catch (err) { alert(err.response && err.response.data ? err.response.data.message : 'Erreur'); }
  };

  const handlePayer = async (e) => {
    e.preventDefault();
    setPayingConducteur(true);
    try {
      const res = await api.post('/paiements-conducteur/initier', Object.assign({ demandeId: id }, paiementForm));
      alert('Paiement initié! Ref: ' + res.data.paiement.reference);
      setShowPaiement(false);
      loadData();
    } catch (err) {
      alert(err.response && err.response.data ? err.response.data.message : 'Erreur');
    } finally { setPayingConducteur(false); }
  };

  const isClient = !!(chantier && user && (
    (chantier.client && chantier.client._id && (chantier.client._id === user._id || chantier.client._id === user.id)) ||
    (chantier.client && (chantier.client === user._id || chantier.client === user.id))
  ));

  const isConducteur = !!(chantier && user && (
    (chantier.conducteur && chantier.conducteur._id && (chantier.conducteur._id === user._id || chantier.conducteur._id === user.id)) ||
    (chantier.conducteur && (chantier.conducteur === user._id || chantier.conducteur === user.id))
  ));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader /></div>;

  const avancement = chantier ? (chantier.avancementGlobal || 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <Link to="/dashboard" className="text-green-300 hover:text-white text-sm mb-4 inline-block">← Tableau de bord</Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-display font-black mb-2">{chantier ? chantier.titreChantier : 'Mon Chantier'}</h1>
              <p className="text-green-200">📍 {chantier ? chantier.localisation : ''} — {chantier ? chantier.ville : ''}</p>
              {chantier && chantier.client && chantier.client.name && (
                <p className="text-green-300 text-sm mt-1">Client : {chantier.client.name}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {isConducteur && (
                <button onClick={() => setShowRapport(true)}
                  className="px-5 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg">
                  📝 Nouveau rapport
                </button>
              )}
              {isClient && chantier && chantier.statut === 'en_cours' && (
                <button onClick={() => setShowPaiement(true)}
                  className="px-5 py-3 bg-yellow-400 text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 transition-all shadow-lg">
                  💳 Payer le conducteur
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Avancement', value: avancement + '%', icon: '📊' },
              { label: 'Rapports', value: rapports.length, icon: '📋' },
              { label: 'Validés', value: rapports.filter((r) => r.statut === 'valide').length, icon: '✅' },
              { label: 'Contestés', value: rapports.filter((r) => r.statut === 'conteste').length, icon: '⚠️' },
            ].map((s, i) => (
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
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">Avancement global</h3>
            <span className="text-2xl font-black text-green-600">{avancement}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full h-4 transition-all" style={{ width: avancement + '%' }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Début : {chantier && chantier.dateDebut ? new Date(chantier.dateDebut).toLocaleDateString('fr-FR') : '-'}</span>
            <span>Fin : {chantier && chantier.dateFin ? new Date(chantier.dateFin).toLocaleDateString('fr-FR') : '-'}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">📋 Informations du chantier</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Type', value: chantier ? (chantier.typeChantier || '-') : '-' },
              { label: 'Superficie', value: chantier ? (chantier.superficie || 'Non définie') : '-' },
              { label: 'Tarif/jour', value: chantier && chantier.tarifjourFinal ? (new Intl.NumberFormat('fr-FR').format(chantier.tarifjourFinal) + ' FCFA') : '-' },
              { label: 'Nb rapports', value: chantier ? (chantier.nombreRapports || 0) : 0 },
            ].map((info, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">{info.label}</p>
                <p className="font-semibold capitalize">{info.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { v: '', l: 'Tous les rapports' },
            { v: 'quotidien', l: '📅 Quotidiens' },
            { v: 'hebdomadaire', l: '📊 Hebdomadaires' },
            { v: 'mensuel', l: '📈 Mensuels' },
          ].map((f) => (
            <button key={f.v} onClick={() => setFiltre(f.v)} className={getFiltreClass(filtre === f.v)}>
              {f.l}
            </button>
          ))}
        </div>

        {rapports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 mb-2 font-semibold">Aucun rapport soumis</p>
            {isConducteur && (
              <button onClick={() => setShowRapport(true)} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">
                Soumettre le premier rapport →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {rapports.map((r) => {
              const statut = STATUT_RAPPORT[r.statut] || STATUT_RAPPORT.soumis;
              return (
                <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{METEO_ICONS[r.meteo] || '☀️'}</span>
                      <div>
                        <p className="font-bold text-gray-900 capitalize">Rapport {r.type} — {new Date(r.date).toLocaleDateString('fr-FR')}</p>
                        <p className="text-gray-400 text-xs">Par {r.conducteur ? r.conducteur.name : ''}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0" style={{ background: statut.bg, color: statut.text }}>
                      {statut.label}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Avancement</span>
                      <span className="font-black text-green-600">{r.avancement}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full h-3" style={{ width: r.avancement + '%' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                    {r.activites && r.activites.length > 0 && (
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="font-bold text-green-800 mb-2">✅ Activités</p>
                        <ul className="text-green-700 space-y-1">{r.activites.map((a, i) => <li key={i}>• {a}</li>)}</ul>
                      </div>
                    )}
                    {r.problemes && r.problemes.length > 0 && (
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="font-bold text-red-800 mb-2">⚠️ Problèmes</p>
                        <ul className="text-red-700 space-y-1">{r.problemes.map((p, i) => <li key={i}>• {p}</li>)}</ul>
                      </div>
                    )}
                    {r.solutions && r.solutions.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="font-bold text-blue-800 mb-2">💡 Solutions</p>
                        <ul className="text-blue-700 space-y-1">{r.solutions.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                      </div>
                    )}
                    {r.equipes && r.equipes.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="font-bold text-gray-800 mb-2">👷 Équipes</p>
                        <ul className="text-gray-600 space-y-1">{r.equipes.map((e, i) => <li key={i}>• {e}</li>)}</ul>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mb-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">👷 {r.nombreOuvriers} ouvrier{r.nombreOuvriers > 1 ? 's' : ''}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full capitalize">{METEO_ICONS[r.meteo]} {r.meteo}</span>
                  </div>
                  {r.noteGenerale && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                      <p className="font-bold text-amber-800 text-sm mb-1">📝 Note générale</p>
                      <p className="text-amber-700 text-sm italic">"{r.noteGenerale}"</p>
                    </div>
                  )}
                  {r.recommandations && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3">
                      <p className="font-bold text-purple-800 text-sm mb-1">💼 Recommandations</p>
                      <p className="text-purple-700 text-sm">{r.recommandations}</p>
                    </div>
                  )}
                  {r.photos && r.photos.length > 0 && (
                    <div className="mb-4">
                      <p className="font-bold text-gray-700 text-sm mb-2">📸 Photos ({r.photos.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {r.photos.map((p, i) => (
                          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer">
                            <img src={p.url} alt={p.legende || ('Photo ' + (i + 1))}
                              className="w-full h-24 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
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
                      <p className="text-amber-700 text-sm"><strong>Commentaire :</strong> {r.commentaireClient}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isClient && paiementsConducteur.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">💳 Historique des paiements</h3>
            <div className="space-y-3">
              {paiementsConducteur.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-sm">{p.nombreJours} jours — {new Intl.NumberFormat('fr-FR').format(p.montant)} FCFA</p>
                    <p className="text-gray-400 text-xs">Ref: {p.reference} — {new Date(p.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={getStatutClass(p.statut)}>{getStatutLabel(p.statut)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPaiement && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">💳 Payer le conducteur</h2>
                  <p className="text-yellow-100 text-sm">{chantier ? chantier.titreChantier : ''}</p>
                </div>
                <button onClick={() => setShowPaiement(false)} className="text-white/70 hover:text-white text-2xl">×</button>
              </div>
            </div>
            <form onSubmit={handlePayer} className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-yellow-800 text-sm font-semibold">
                  Tarif/jour : {chantier && chantier.tarifjourFinal ? (new Intl.NumberFormat('fr-FR').format(chantier.tarifjourFinal) + ' FCFA') : 'Non défini'}
                </p>
                <p className="text-yellow-700 text-xs mt-1">Total = Tarif x Jours — 8% commission BYH</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de jours</label>
                <input type="number" min="1" max="30" value={paiementForm.nombreJours}
                  onChange={(e) => setPaiementForm((f) => Object.assign({}, f, { nombreJours: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500" />
                {chantier && chantier.tarifjourFinal && (
                  <p className="text-green-600 text-sm mt-1 font-semibold">
                    Total : {new Intl.NumberFormat('fr-FR').format(chantier.tarifjourFinal * paiementForm.nombreJours)} FCFA
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Opérateur Mobile Money</label>
                <select value={paiementForm.operateur}
                  onChange={(e) => setPaiementForm((f) => Object.assign({}, f, { operateur: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 bg-white">
                  <option value="orange_money">Orange Money</option>
                  <option value="mtn_momo">MTN MoMo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Votre numéro Mobile Money</label>
                <input type="tel" value={paiementForm.telephone}
                  onChange={(e) => setPaiementForm((f) => Object.assign({}, f, { telephone: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500"
                  placeholder="+237 6XX XXX XXX" required />
              </div>
              <button type="submit" disabled={payingConducteur}
                className="w-full py-4 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 disabled:opacity-50 shadow-lg">
                {payingConducteur ? '⏳ Traitement...' : '💳 Initier le paiement'}
              </button>
              <button type="button" onClick={() => setShowPaiement(false)}
                className="w-full py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50">
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}

      {showRapport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-4">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">📝 Journal de Chantier</h2>
                  <p className="text-green-200 text-sm">{chantier ? chantier.titreChantier : ''}</p>
                </div>
                <button onClick={() => setShowRapport(false)} className="text-white/70 hover:text-white text-2xl">×</button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type de rapport</label>
                  <select value={rapport.type}
                    onChange={(e) => setRapport((r) => Object.assign({}, r, { type: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white">
                    <option value="quotidien">📅 Quotidien</option>
                    <option value="hebdomadaire">📊 Hebdomadaire</option>
                    <option value="mensuel">📈 Mensuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Météo du jour</label>
                  <select value={rapport.meteo}
                    onChange={(e) => setRapport((r) => Object.assign({}, r, { meteo: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white">
                    <option value="ensoleille">☀️ Ensoleillé</option>
                    <option value="nuageux">⛅ Nuageux</option>
                    <option value="pluvieux">🌧️ Pluvieux</option>
                    <option value="orageux">⛈️ Orageux</option>
                  </select>
                </div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Avancement global : <span className="text-green-600 text-lg font-black">{rapport.avancement}%</span>
                </label>
                <input type="range" min="0" max="100" value={rapport.avancement}
                  onChange={(e) => setRapport((r) => Object.assign({}, r, { avancement: parseInt(e.target.value) }))}
                  className="w-full accent-green-600" />
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div className="bg-green-600 rounded-full h-3 transition-all" style={{ width: rapport.avancement + '%' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre d'ouvriers</label>
                  <input type="number" min="0" value={rapport.nombreOuvriers}
                    onChange={(e) => setRapport((r) => Object.assign({}, r, { nombreOuvriers: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Équipes présentes</label>
                  <input type="text" value={rapport.equipes}
                    onChange={(e) => setRapport((r) => Object.assign({}, r, { equipes: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                    placeholder="Maçons, Ferraileurs..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">✅ Activités réalisées (une par ligne)</label>
                <textarea value={rapport.activites}
                  onChange={(e) => setRapport((r) => Object.assign({}, r, { activites: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={3}
                  placeholder="Coulage dalle RDC" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">⚠️ Problèmes rencontrés (un par ligne)</label>
                <textarea value={rapport.problemes}
                  onChange={(e) => setRapport((r) => Object.assign({}, r, { problemes: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Manque de sable" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">💡 Solutions appliquées (une par ligne)</label>
                <textarea value={rapport.solutions}
                  onChange={(e) => setRapport((r) => Object.assign({}, r, { solutions: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Commande sable pour demain" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">📝 Note générale</label>
                <textarea value={rapport.noteGenerale}
                  onChange={(e) => setRapport((r) => Object.assign({}, r, { noteGenerale: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Observations générales..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">💼 Recommandations</label>
                <textarea value={rapport.recommandations}
                  onChange={(e) => setRapport((r) => Object.assign({}, r, { recommandations: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none" rows={2}
                  placeholder="Recommandations pour la prochaine étape..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📸 Photos du chantier</label>
                <div onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                  {uploadingPhotos ? (
                    <div>
                      <div className="text-3xl mb-2">⏳</div>
                      <p className="text-gray-500 text-sm">Upload en cours...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📸</div>
                      <p className="text-gray-600 text-sm font-semibold">Cliquez pour ajouter des photos</p>
                      <p className="text-gray-400 text-xs mt-1">JPG, PNG — plusieurs fichiers acceptés</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                {photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {photos.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p.url} alt={'Photo ' + (i + 1)} className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                        <button type="button" onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-700">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => { setShowRapport(false); setPhotos([]); setRapport(RAPPORT_INITIAL); }}
                className="w-full py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all">
                Annuler
              </button>
              <button type="submit" disabled={submitting || uploadingPhotos}
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
