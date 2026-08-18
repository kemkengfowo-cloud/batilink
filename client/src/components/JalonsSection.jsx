import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatBudget, formatDate, getImageUrl } from '../utils/helpers';

export default function JalonsSection({ devis, onUpdate }) {
  const { user } = useAuth();
  const [showCreer, setShowCreer] = useState(false);
  const [nouveauxJalons, setNouveauxJalons] = useState([
    { titre:'', pourcentage:30, description:'' },
    { titre:'', pourcentage:40, description:'' },
    { titre:'', pourcentage:30, description:'' },
  ]);
  const [activeJalon, setActiveJalon] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [commentaire, setCommentaire] = useState('');
  const [message, setMessage] = useState('');
  const [lightbox, setLightbox] = useState(null);

  const isArtisan = user?.role === 'artisan';
  const isClient = user?.role === 'client';
  const jalons = devis?.jalons || [];

  const creerJalons = async () => {
    const total = nouveauxJalons.reduce((s,j)=>s+j.pourcentage,0);
    if (total !== 100) { setMessage('Le total des pourcentages doit etre 100%'); return; }
    try {
      await api.post('/jalons', { devisId: devis._id, jalons: nouveauxJalons });
      setShowCreer(false);
      setMessage('Jalons crees !');
      if (onUpdate) onUpdate();
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
  };

  const soumettrePhotos = async (jalonId) => {
    if (!photoFiles.length) { setMessage('Ajoutez au moins une photo'); return; }
    try {
      const fd = new FormData();
      fd.append('commentaire', commentaire);
      photoFiles.forEach(f => fd.append('photos', f));
      await api.post('/jalons/' + jalonId + '/photos', fd, { headers:{'Content-Type':'multipart/form-data'} });
      setActiveJalon(null); setPhotoFiles([]); setCommentaire('');
      setMessage('Photos soumises pour validation !');
      if (onUpdate) onUpdate();
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
  };

  const validerJalon = async (jalonId) => {
    if (!window.confirm('Valider ce jalon et liberer le paiement ?')) return;
    try {
      await api.put('/jalons/' + jalonId + '/valider');
      setMessage('Jalon valide ! Paiement libere.');
      if (onUpdate) onUpdate();
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
  };

  const contesterJalon = async (jalonId) => {
    const motif = window.prompt('Motif de la contestation:');
    if (!motif) return;
    try {
      await api.put('/jalons/' + jalonId + '/contester', { motif });
      setMessage('Contestation enregistree.');
      if (onUpdate) onUpdate();
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
  };

  const STATUT_COLOR = {
    en_attente: 'bg-gray-100 text-gray-500',
    en_cours:   'bg-blue-50 text-blue-600',
    soumis:     'bg-amber-50 text-amber-700',
    valide:     'bg-green-50 text-green-700',
    conteste:   'bg-red-50 text-red-700',
  };
  const STATUT_LABEL = {
    en_attente: 'En attente',
    en_cours:   'En cours',
    soumis:     'Photos soumises',
    valide:     'Valide',
    conteste:   'Conteste',
  };

  return (
    <>
      {lightbox && (
        <div onClick={()=>setLightbox(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer">
          <div className="relative max-w-4xl w-full">
            <button onClick={()=>setLightbox(null)}
              className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-gray-300">✕</button>
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
          {isArtisan && jalons.length === 0 && devis.statut === 'accepte' && !showCreer && (
            <button onClick={()=>setShowCreer(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
              + Definir jalons
            </button>
          )}
        </div>

        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium">
            {message}
          </div>
        )}

        {showCreer && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Definir les jalons de paiement</h3>
            {nouveauxJalons.map((j,i) => (
              <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                <div className="flex gap-3">
                  <input type="text" value={j.titre} onChange={e=>{const n=[...nouveauxJalons];n[i].titre=e.target.value;setNouveauxJalons(n);}}
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    placeholder={`Jalon ${i+1} (ex: Fondations)`}/>
                  <div className="flex items-center gap-1">
                    <input type="number" value={j.pourcentage} onChange={e=>{const n=[...nouveauxJalons];n[i].pourcentage=parseInt(e.target.value)||0;setNouveauxJalons(n);}}
                      className="w-16 px-2 py-2 border-2 border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:border-blue-500"/>
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                </div>
                <input type="text" value={j.description} onChange={e=>{const n=[...nouveauxJalons];n[i].description=e.target.value;setNouveauxJalons(n);}}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Description (optionnel)"/>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${nouveauxJalons.reduce((s,j)=>s+j.pourcentage,0)===100?'text-green-600':'text-red-500'}`}>
                Total: {nouveauxJalons.reduce((s,j)=>s+j.pourcentage,0)}%
              </p>
              <div className="flex gap-2">
                <button onClick={()=>setNouveauxJalons([...nouveauxJalons,{titre:'',pourcentage:0,description:''}])}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">+ Ajouter</button>
                <button onClick={creerJalons}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">Valider</button>
                <button onClick={()=>setShowCreer(false)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600">Annuler</button>
              </div>
            </div>
          </div>
        )}

        {jalons.length === 0 && !showCreer ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">
              {isArtisan && devis.statut === 'accepte'
                ? 'Definissez les jalons pour organiser le paiement par etapes'
                : 'Aucun jalon defini pour ce devis'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jalons.map((j,idx) => (
              <div key={j._id} className="border-2 border-gray-100 rounded-2xl overflow-hidden">
                <div className={`px-5 py-4 ${j.statut==='valide'?'bg-green-50':j.statut==='soumis'?'bg-amber-50':j.statut==='conteste'?'bg-red-50':'bg-white'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${STATUT_COLOR[j.statut]}`}>
                        {idx+1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{j.titre}</p>
                        {j.description && <p className="text-gray-400 text-xs mt-0.5">{j.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUT_COLOR[j.statut]}`}>
                        {STATUT_LABEL[j.statut]}
                      </span>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{j.pourcentage}%</p>
                        <p className="text-xs text-gray-400">{formatBudget(j.montant)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {j.photos?.length > 0 && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Photos soumises :</p>
                    <div className="flex gap-2 flex-wrap">
                      {j.photos.map((p,pidx)=>(
                        <img key={pidx}
                          src={`${process.env.REACT_APP_API_URL||''}${p}`}
                          alt=""
                          onClick={()=>setLightbox(`${process.env.REACT_APP_API_URL||''}${p}`)}
                          className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 hover:scale-105 transition-all"/>
                      ))}
                    </div>
                    {j.commentaireArtisan && (
                      <p className="text-xs text-gray-500 mt-2 italic">"{j.commentaireArtisan}"</p>
                    )}
                  </div>
                )}

                {isArtisan && j.statut === 'en_cours' && (
                  <div className="px-5 py-4 border-t border-gray-100">
                    {activeJalon !== j._id ? (
                      <button onClick={()=>setActiveJalon(j._id)}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                        📷 Soumettre photos pour validation
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <input type="file" multiple accept="image/*"
                          onChange={e=>setPhotoFiles(Array.from(e.target.files))}
                          className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold"/>
                        <textarea value={commentaire} onChange={e=>setCommentaire(e.target.value)} rows={2}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500"
                          placeholder="Commentaire (optionnel)"/>
                        <div className="flex gap-2">
                          <button onClick={()=>soumettrePhotos(j._id)}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                            Envoyer
                          </button>
                          <button onClick={()=>{setActiveJalon(null);setPhotoFiles([]);}}
                            className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600">
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isClient && j.statut === 'soumis' && (
                  <div className="px-5 py-4 border-t border-amber-100 bg-amber-50">
                    <p className="text-sm text-amber-700 font-medium mb-3">
                      L artisan a soumis des photos. Validez pour liberer le paiement de {formatBudget(j.montant)}.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={()=>validerJalon(j._id)}
                        className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600">
                        ✅ Valider et payer
                      </button>
                      <button onClick={()=>contesterJalon(j._id)}
                        className="flex-1 py-2.5 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100">
                        ❌ Contester
                      </button>
                    </div>
                  </div>
                )}

                {j.statut === 'valide' && (
                  <div className="px-5 py-3 bg-green-50 border-t border-green-100">
                    <p className="text-sm text-green-700 font-semibold">
                      ✅ Valide le {formatDate(j.dateValidation)} — {formatBudget(j.montant)} libere
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
