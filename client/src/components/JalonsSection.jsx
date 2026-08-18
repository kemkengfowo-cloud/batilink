import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatBudget, formatDate } from '../utils/helpers';

const STATUT_JALON = {
  en_attente: { label:'En attente', color:'bg-gray-100 text-gray-500', icon:'⏳' },
  en_cours:   { label:'En cours', color:'bg-blue-50 text-blue-700', icon:'🔨' },
  soumis:     { label:'Soumis pour validation', color:'bg-yellow-50 text-yellow-700', icon:'📤' },
  valide:     { label:'Valide', color:'bg-green-50 text-green-700', icon:'✅' },
  conteste:   { label:'Conteste', color:'bg-red-50 text-red-700', icon:'⚠️' },
};

export default function JalonsSection({ devis }) {
  const { user } = useAuth();
  const [jalons, setJalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreer, setShowCreer] = useState(false);
  const [nouveauxJalons, setNouveauxJalons] = useState([
    { titre:'Demarrage et preparation', description:'', pourcentage:30 },
    { titre:'Mi-chantier', description:'', pourcentage:40 },
    { titre:'Livraison finale', description:'', pourcentage:30 },
  ]);
  const [uploading, setUploading] = useState(false);
  const [activeJalon, setActiveJalon] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [commentaire, setCommentaire] = useState('');
  const [message, setMessage] = useState('');
  const [raison, setRaison] = useState('');
  const [contesterId, setContesterId] = useState(null);

  const isArtisan = user?._id === devis?.artisan?._id || user?.id === devis?.artisan?._id;
  const isClient = user?._id === devis?.client?._id || user?.id === devis?.client?._id;

  useEffect(() => {
    api.get(`/jalons/${devis._id}`)
      .then(res => setJalons(res.data || []))
      .finally(() => setLoading(false));
  }, [devis._id]);

  const creerJalons = async () => {
    const total = nouveauxJalons.reduce((s,j)=>s+j.pourcentage,0);
    if (total !== 100) return setMessage('Les pourcentages doivent totaliser 100%.');
    try {
      const res = await api.post('/jalons', { devisId: devis._id, jalons: nouveauxJalons });
      setJalons(res.data);
      setShowCreer(false);
      setMessage('Jalons crees avec succes !');
      setTimeout(() => setMessage(''), 3000);
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
  };

  const soumettrePhotos = async (jalonId) => {
    if (!photoFiles.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      photoFiles.forEach(f => fd.append('photos', f));
      fd.append('commentaire', commentaire);
      const res = await api.post(`/jalons/${jalonId}/photos`, fd, { headers:{'Content-Type':'multipart/form-data'} });
      setJalons(prev => prev.map(j => j._id===jalonId ? res.data : j));
      setActiveJalon(null); setPhotoFiles([]); setCommentaire('');
      setMessage('Photos soumises pour validation !');
      setTimeout(() => setMessage(''), 3000);
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
    finally { setUploading(false); }
  };

  const validerJalon = async (jalonId) => {
    try {
      const res = await api.put(`/jalons/${jalonId}/valider`, { commentaire });
      setJalons(prev => prev.map(j => j._id===jalonId ? res.data.jalon : j));
      setMessage(res.data.message);
      setTimeout(() => setMessage(''), 5000);
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
  };

  const contesterJalon = async (jalonId) => {
    if (!raison.trim()) return setMessage('Veuillez expliquer votre contestation.');
    try {
      const res = await api.put(`/jalons/${jalonId}/contester`, { raison });
      setJalons(prev => prev.map(j => j._id===jalonId ? res.data.jalon : j));
      setContesterId(null); setRaison('');
      setMessage(res.data.message);
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
  };

  const totalPourcentage = nouveauxJalons.reduce((s,j)=>s+j.pourcentage,0);

  return (
    <>
    {lightbox && (
      <div onClick={()=>setLightbox(null)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer">
        <div className="relative max-w-4xl w-full">
          <button onClick={()=>setLightbox(null)} className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-gray-300">✕</button>
          <img src={lightbox} alt="Photo chantier" className="w-full rounded-2xl max-h-screen object-contain"/>
        </div>
      </div>
    )}
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">Jalons de paiement</h2>
          <p className="text-gray-400 text-sm mt-0.5">Paiement par etapes securise</p>
        </div>
        {isArtisan && jalons.length === 0 && !showCreer && devis.statut === 'accepte' && (
          <button onClick={()=>setShowCreer(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">
            Definir les jalons
          </button>
        )}
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium">{message}</div>
      )}

      {/* Créer jalons */}
      {showCreer && (
        <div className="mb-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl space-y-4">
          <h3 className="font-bold text-gray-900">Definir les etapes de paiement</h3>
          <p className="text-sm text-gray-500">Total : <span className={`font-bold ${totalPourcentage===100?'text-green-600':'text-red-500'}`}>{totalPourcentage}%</span> (doit etre 100%)</p>
          {nouveauxJalons.map((j,i)=>(
            <div key={i} className="bg-white p-4 rounded-xl space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Titre</label>
                  <input type="text" value={j.titre} onChange={e=>setNouveauxJalons(prev=>prev.map((x,idx)=>idx===i?{...x,titre:e.target.value}:x))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"/>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">% du total</label>
                  <input type="number" min="1" max="100" value={j.pourcentage} onChange={e=>setNouveauxJalons(prev=>prev.map((x,idx)=>idx===i?{...x,pourcentage:+e.target.value}:x))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"/>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 font-bold">{formatBudget(Math.round(devis.total * j.pourcentage / 100))}</span>
                {nouveauxJalons.length > 2 && (
                  <button type="button" onClick={()=>setNouveauxJalons(prev=>prev.filter((_,idx)=>idx!==i))}
                    className="text-red-400 hover:text-red-600 text-xs">Supprimer</button>
                )}
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={()=>setNouveauxJalons(prev=>[...prev,{titre:'',description:'',pourcentage:0}])}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
              + Ajouter etape
            </button>
            <button onClick={creerJalons} disabled={totalPourcentage!==100}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 text-sm">
              Valider les jalons
            </button>
            <button onClick={()=>setShowCreer(false)}
              className="px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg text-sm font-semibold">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste jalons */}
      {jalons.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-500 font-semibold">Aucun jalon defini</p>
          <p className="text-gray-400 text-sm mt-1">
            {isArtisan && devis.statut==='accepte' ? 'Definissez les etapes de paiement' : 'L artisan definira les etapes de paiement'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jalons.map((j,i)=>(
            <div key={j._id} className={`border-2 rounded-2xl overflow-hidden ${j.statut==='valide'?'border-green-200':j.statut==='conteste'?'border-red-200':j.statut==='soumis'?'border-yellow-200':'border-gray-100'}`}>
              <div className="p-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${j.statut==='valide'?'bg-green-500 text-white':j.statut==='soumis'?'bg-yellow-500 text-white':'bg-gray-200 text-gray-600'}`}>
                      {i+1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{j.titre}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-blue-600 font-bold text-sm">{formatBudget(j.montant)}</span>
                        <span className="text-gray-400 text-xs">({j.pourcentage}%)</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUT_JALON[j.statut]?.color}`}>
                    {STATUT_JALON[j.statut]?.icon} {STATUT_JALON[j.statut]?.label}
                  </span>
                </div>

                {/* Photos soumises */}
                {j.photos?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Photos soumises :</p>
                    <div className="flex gap-2 flex-wrap">
                      {j.photos.map((p,idx)=>(
                        <img key={idx} src={`${process.env.REACT_APP_API_URL||''}${p}`} alt="" className="w-16 h-16 rounded-lg object-cover"/>
                      ))}
                    </div>
                    {j.commentaireArtisan && <p className="text-xs text-gray-500 mt-2 italic">"{j.commentaireArtisan}"</p>}
                  </div>
                )}

                {/* Délai contestation */}
                {j.statut==='valide' && j.delaiContestationExpire && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    ⏰ Delai de contestation expire le {formatDate(j.delaiContestationExpire)}
                  </div>
                )}
              </div>

              {/* Actions artisan */}
              {isArtisan && j.statut==='en_attente' && (
                <div className="px-4 pb-4">
                  {activeJalon===j._id ? (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm font-semibold text-gray-700">Soumettre les photos de ce jalon</p>
                      <textarea value={commentaire} onChange={e=>setCommentaire(e.target.value)} rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500"
                        placeholder="Decrivez l avancement..."/>
                      <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 text-sm text-blue-500 font-medium">
                        📸 Ajouter photos ({photoFiles.length} selectionne{photoFiles.length>1?'es':''})
                        <input type="file" accept="image/*" multiple onChange={e=>setPhotoFiles(Array.from(e.target.files))} className="hidden"/>
                      </label>
                      <div className="flex gap-2">
                        <button onClick={()=>soumettrePhotos(j._id)} disabled={uploading||!photoFiles.length}
                          className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                          {uploading?'Envoi...':'Soumettre pour validation'}
                        </button>
                        <button onClick={()=>setActiveJalon(null)} className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-600">Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={()=>setActiveJalon(j._id)}
                      className="w-full py-2.5 border-2 border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50">
                      📤 Soumettre les photos de ce jalon
                    </button>
                  )}
                </div>
              )}

              {/* Actions client */}
              {isClient && j.statut==='soumis' && (
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={()=>validerJalon(j._id)}
                    className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600">
                    ✅ Valider et payer {formatBudget(j.montant)}
                  </button>
                  <button onClick={()=>setContesterId(j._id)}
                    className="px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50">
                    ⚠️ Contester
                  </button>
                </div>
              )}

              {/* Contester */}
              {isClient && contesterId===j._id && (
                <div className="px-4 pb-4 space-y-3 pt-2 border-t border-gray-100">
                  <textarea value={raison} onChange={e=>setRaison(e.target.value)} rows={3}
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-xl text-sm resize-none focus:outline-none focus:border-red-400"
                    placeholder="Expliquez pourquoi vous contestez ce jalon..."/>
                  <div className="flex gap-2">
                    <button onClick={()=>contesterJalon(j._id)}
                      className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600">
                      Confirmer la contestation
                    </button>
                    <button onClick={()=>setContesterId(null)} className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Annuler</button>
                  </div>
                </div>
              )}

              {/* Valide info */}
              {j.statut==='valide' && (
                <div className="px-4 pb-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-semibold">
                    ✅ Valide le {formatDate(j.dateValidation)} — {formatBudget(j.montant)} libere a l artisan
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
    </div>
    </>
  );
}
