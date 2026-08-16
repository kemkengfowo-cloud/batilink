import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatBudget, formatDate, getAvatarUrl, getImageUrl } from '../utils/helpers';

const STATUT = {
  en_attente:          { label:'En attente d un technicien', color:'bg-yellow-50 text-yellow-700', icon:'⏳' },
  evaluateur_assigne:  { label:'Technicien assigne', color:'bg-blue-50 text-blue-700', icon:'👷' },
  visite_effectuee:    { label:'Visite effectuee', color:'bg-indigo-50 text-indigo-700', icon:'✓' },
  rapport_soumis:      { label:'Rapport disponible', color:'bg-green-50 text-green-700', icon:'📋' },
  devis_genere:        { label:'Devis genere', color:'bg-purple-50 text-purple-700', icon:'📄' },
  annulee:             { label:'Annulee', color:'bg-red-50 text-red-700', icon:'❌' },
};

export default function VisiteDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [visite, setVisite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [showRapport, setShowRapport] = useState(false);
  const [rapport, setRapport] = useState({
    problemesIdentifies:'', travauxRecommandes:'',
    estimationCout:'', estimationDuree:'', observations:''
  });
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    api.get(`/visites/${id}`)
      .then(res => setVisite(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const accepterVisite = async () => {
    setProcessing(true);
    try {
      const res = await api.put(`/visites/${id}/accepter`);
      setVisite(res.data);
      setMessage('Vous avez accepte cette visite ! Le client a ete notifie.');
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
    finally { setProcessing(false); }
  };

  const soumettreRapport = async (e) => {
    e.preventDefault(); setProcessing(true);
    try {
      const fd = new FormData();
      Object.entries(rapport).forEach(([k,v]) => fd.append(k, v));
      photos.forEach(p => fd.append('photos', p));
      const res = await api.post(`/visites/${id}/rapport`, fd, {
        headers: {'Content-Type':'multipart/form-data'}
      });
      setVisite(res.data);
      setShowRapport(false);
      setMessage('Rapport soumis ! Le client a ete notifie.');
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
    finally { setProcessing(false); }
  };

  const annulerVisite = async () => {
    if (!window.confirm('Annuler cette visite ?')) return;
    setProcessing(true);
    try {
      const res = await api.put(`/visites/${id}/annuler`);
      setVisite(res.data.visite);
      setMessage('Visite annulee.');
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
    finally { setProcessing(false); }
  };

  if (loading) return <Loader/>;
  if (!visite) return <div className="text-center py-20 text-gray-500">Visite non trouvee.</div>;

  const isClient = user?._id === visite.client?._id || user?.id === visite.client?._id;
  const isEvaluateur = user?._id === visite.evaluateur?._id || user?.id === visite.evaluateur?._id;
  const isArtisan = user?.role === 'artisan' || user?.role === 'entreprise';
  const statut = STATUT[visite.statut];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/visites" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 font-medium">
            ← Retour aux visites
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Visite d evaluation</h1>
              <p className="text-gray-500 mt-1">{visite.ville} — {formatDate(visite.createdAt)}</p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${statut?.color}`}>
              {statut?.icon} {statut?.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {message && (
          <div className="p-4 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-2xl font-semibold">
            ✅ {message}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Details de la demande</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Description du probleme</p>
                <p className="text-gray-800 font-medium text-sm">{visite.description}</p>
              </div>
              {visite.typeProbleme && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Type de probleme</p>
                  <p className="text-gray-800 font-medium text-sm">{visite.typeProbleme}</p>
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Adresse du chantier</p>
                <p className="text-gray-800 font-medium text-sm">📍 {visite.adresse}, {visite.ville}</p>
              </div>
            </div>
            <div className="space-y-3">
              {visite.dateVisite && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Date souhaitee</p>
                  <p className="text-gray-800 font-medium text-sm">📅 {formatDate(visite.dateVisite)}</p>
                </div>
              )}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-400 mb-1">Frais de visite</p>
                <p className="text-blue-700 font-bold text-lg">{formatBudget(visite.fraisVisite)}</p>
                <p className="text-blue-500 text-xs mt-0.5">Deduits du devis si accepte</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Client</p>
            <div className="flex items-center gap-3">
              <img src={getAvatarUrl(visite.client?.avatar, visite.client?.name)} alt="" className="w-12 h-12 rounded-xl object-cover"/>
              <div>
                <p className="font-bold text-gray-900">{visite.client?.name}</p>
                <p className="text-gray-400 text-sm">{visite.client?.city}</p>
                {visite.client?.phone && <p className="text-gray-400 text-sm">📞 {visite.client.phone}</p>}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Evaluateur</p>
            {visite.evaluateur ? (
              <div className="flex items-center gap-3">
                <img src={getAvatarUrl(visite.evaluateur?.avatar, visite.evaluateur?.name)} alt="" className="w-12 h-12 rounded-xl object-cover"/>
                <div>
                  <p className="font-bold text-gray-900">{visite.evaluateur?.name}</p>
                  <p className="text-gray-400 text-sm">Technicien evaluateur</p>
                  {visite.evaluateur?.phone && <p className="text-gray-400 text-sm">📞 {visite.evaluateur.phone}</p>}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">⏳</div>
                <p className="text-gray-400 text-sm">En attente d un technicien</p>
              </div>
            )}
          </div>
        </div>

        {visite.rapport?.problemesIdentifies && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display font-bold text-gray-900 mb-5 text-xl">📋 Rapport de visite</h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-bold text-red-500 uppercase mb-2">Problemes identifies</p>
                <p className="text-gray-800 text-sm leading-relaxed">{visite.rapport.problemesIdentifies}</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-bold text-blue-500 uppercase mb-2">Travaux recommandes</p>
                <p className="text-gray-800 text-sm leading-relaxed">{visite.rapport.travauxRecommandes}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                  <p className="text-xs font-bold text-green-500 uppercase mb-1">Estimation du cout</p>
                  <p className="text-2xl font-display font-black text-green-700">{formatBudget(visite.rapport.estimationCout)}</p>
                  <p className="text-green-600 text-xs mt-1">Frais visite deduits si accepte</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-bold text-amber-500 uppercase mb-1">Duree estimee</p>
                  <p className="text-xl font-bold text-amber-700">{visite.rapport.estimationDuree}</p>
                </div>
              </div>
              {visite.rapport.observations && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Observations</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{visite.rapport.observations}</p>
                </div>
              )}
              {visite.rapport.photos?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Photos ({visite.rapport.photos.length})</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {visite.rapport.photos.map((p,i)=>(
                      <a key={i} href={getImageUrl(p)} target="_blank" rel="noopener noreferrer">
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity">
                          <img src={getImageUrl(p)} alt={`Photo ${i+1}`} className="w-full h-full object-cover"/>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {isClient && visite.statut === 'rapport_soumis' && (
              <div className="mt-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-2">Que voulez-vous faire ?</h3>
                <p className="text-gray-500 text-sm mb-4">Le technicien peut vous faire un devis officiel base sur ce rapport.</p>
                <div className="flex gap-3 flex-wrap">
                  <Link to="/devis/creer"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-700 text-sm">
                    Demander un devis officiel
                  </Link>
                  <button onClick={annulerVisite}
                    className="px-5 py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50">
                    Decliner
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isArtisan && !isEvaluateur && visite.statut === 'en_attente' && (
          <div className="bg-white rounded-2xl border-2 border-green-200 p-6">
            <h3 className="font-display font-bold text-gray-900 mb-2">Accepter cette visite</h3>
            <p className="text-gray-500 text-sm mb-4">
              Vous recevrez <strong>{formatBudget(visite.fraisVisite)}</strong> pour cette visite.
            </p>
            <button onClick={accepterVisite} disabled={processing}
              className="w-full py-3.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-50 text-lg">
              {processing ? '...' : '✅ Accepter la visite'}
            </button>
          </div>
        )}

        {isEvaluateur && ['evaluateur_assigne','visite_effectuee'].includes(visite.statut) && (
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6">
            <h3 className="font-display font-bold text-gray-900 mb-2">Soumettre le rapport</h3>
            {!showRapport ? (
              <button onClick={()=>setShowRapport(true)}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                📋 Rediger le rapport
              </button>
            ) : (
              <form onSubmit={soumettreRapport} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Problemes identifies *</label>
                  <textarea required value={rapport.problemesIdentifies}
                    onChange={e=>setRapport(r=>({...r,problemesIdentifies:e.target.value}))} rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Problemes observes sur le chantier..."/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Travaux recommandes *</label>
                  <textarea required value={rapport.travauxRecommandes}
                    onChange={e=>setRapport(r=>({...r,travauxRecommandes:e.target.value}))} rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Travaux necessaires..."/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estimation (FCFA) *</label>
                    <input type="number" required value={rapport.estimationCout}
                      onChange={e=>setRapport(r=>({...r,estimationCout:e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      placeholder="250000"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duree estimee *</label>
                    <input type="text" required value={rapport.estimationDuree}
                      onChange={e=>setRapport(r=>({...r,estimationDuree:e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      placeholder="3 jours..."/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Observations</label>
                  <textarea value={rapport.observations}
                    onChange={e=>setRapport(r=>({...r,observations:e.target.value}))} rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Autres remarques..."/>
                </div>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-50">
                  <span className="text-sm text-blue-500 font-medium">📸 Photos ({photos.length} selectionnee{photos.length>1?'s':''})</span>
                  <input type="file" accept="image/*" multiple onChange={e=>setPhotos(Array.from(e.target.files))} className="hidden"/>
                </label>
                <div className="flex gap-3">
                  <button type="submit" disabled={processing}
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                    {processing ? 'Envoi...' : 'Soumettre le rapport'}
                  </button>
                  <button type="button" onClick={()=>setShowRapport(false)}
                    className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold">
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {isClient && !['annulee','devis_genere'].includes(visite.statut) && (
          <div className="text-center">
            <button onClick={annulerVisite}
              className="px-5 py-2.5 text-red-500 border-2 border-red-200 rounded-xl text-sm font-semibold hover:bg-red-50">
              Annuler la demande
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
