import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
import { formatBudget, formatDate, getAvatarUrl } from '../utils/helpers';
import Avertissement from '../components/Avertissement';

import JalonsSection from '../components/JalonsSection';
import LitigeModal from '../components/LitigeModal';
import FacturePDF from '../components/FacturePDF';
import AvisSection from '../components/AvisSection';

const STATUT = {
  envoye:  { label:'En attente', color:'bg-yellow-50 text-yellow-700', icon:'⏳' },
  accepte: { label:'Accepte - Travaux en cours', color:'bg-blue-50 text-blue-700', icon:'🔨' },
  refuse:  { label:'Refuse', color:'bg-red-50 text-red-700', icon:'❌' },
  expire:  { label:'Expire', color:'bg-gray-100 text-gray-500', icon:'⌛' },
  termine: { label:'Termine - Paye', color:'bg-green-50 text-green-700', icon:'✅' },
};

export default function DevisDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [showLitige, setShowLitige] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    api.get(`/devis/${id}`)
      .then(res => setDevis(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (type) => {
    setProcessing(true);
    try {
      const res = await api.put(`/devis/${id}/${type}`, { note });
      setDevis(res.data.devis || res.data);
      setMessage(res.data.message || 'Action effectuee !');
      setAction(''); setNote('');
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur');
      toast.error(err.response?.data?.message || 'Une erreur est survenue'); }
    finally { setProcessing(false); }
  };

  if (loading) return <Loader/>;
  if (!devis) return <div className="text-center py-20 text-gray-500">Devis non trouve.</div>;

  const isClient = user?._id === devis.client?._id || user?.id === devis.client?._id;
  const isArtisan = user?._id === devis.artisan?._id || user?.id === devis.artisan?._id;
  const statut = STATUT[devis.statut];

  const TABS = [
    { id:'details', label:'Details' },
    { id:'jalons', label:'Jalons de paiement' },
    
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/devis" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 font-medium">
            ← Retour
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-mono text-gray-400 mb-1">{devis.numeroDevis}</p>
              <h1 className="text-2xl font-display font-bold text-gray-900">{devis.titre}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-4 py-2 rounded-xl text-sm font-bold ${statut?.color}`}>
                {statut?.icon} {statut?.label}
              </span>
              {(isClient || isArtisan) && ['accepte'].includes(devis.statut) && (
                <button onClick={() => setShowLitige(true)}
                  className="px-4 py-2 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100">
                  Litige
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-1 mt-5 border-b border-gray-200">
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)}
                className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab===t.id?'border-blue-500 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {message && (
          <div className="p-4 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-2xl font-semibold">
            {message}
          </div>
        )}

        {activeTab === 'details' && (
          <>
            {isClient && devis.statut === "accepte" && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 cursor-pointer hover:bg-amber-100 transition-colors" onClick={()=>setActiveTab("jalons")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl animate-bounce">🔨</span>
                    <div>
                      <p className="font-bold text-gray-900">Travaux en cours — Validez les jalons</p>
                      <p className="text-amber-700 text-sm mt-0.5">Cliquez pour voir les photos soumises par l artisan et valider son travail</p>
                    </div>
                  </div>
                  <span className="text-amber-600 font-bold text-sm">Voir jalons →</span>
                </div>
              </div>
            )}
            <Avertissement type="devis"/>

            {devis.statut === 'termine' && (
              <div className="flex justify-end">
                <FacturePDF devis={devis}/>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{label:'Prestataire',data:devis.artisan},{label:'Client',data:devis.client}].map(p=>(
                <div key={p.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">{p.label}</p>
                  <div className="flex items-center gap-3">
                    <img src={getAvatarUrl(p.data?.avatar, p.data?.name)} alt="" className="w-12 h-12 rounded-xl object-cover"/>
                    <div>
                      <p className="font-bold text-gray-900">{p.data?.name}</p>
                      <p className="text-gray-400 text-sm">{p.data?.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-display font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{devis.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
                <div><p className="text-xs text-gray-400 mb-1">Delai</p><p className="font-bold text-gray-900">{devis.delaiExecution}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Validite</p><p className="font-bold text-gray-900">{devis.validiteJours} jours</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Materiels</p><p className="font-bold text-gray-900">{devis.materielsInclus?'Inclus':'Non inclus'}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-display font-bold text-gray-900">Detail des travaux</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Designation</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Qte</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Unite</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Prix unit.</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {devis.lignes?.map((l,i)=>(
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium text-gray-900">{l.designation}</td>
                        <td className="px-5 py-4 text-right text-gray-600">{l.quantite}</td>
                        <td className="px-5 py-4 text-right text-gray-600">{l.unite}</td>
                        <td className="px-5 py-4 text-right text-gray-600">{formatBudget(l.prixUnitaire)}</td>
                        <td className="px-5 py-4 text-right font-bold text-gray-900">{formatBudget(l.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 border-t border-gray-100">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-sm text-gray-600"><span>Sous-total</span><span className="font-semibold">{formatBudget(devis.sousTotal)}</span></div>
                  <div className="flex justify-between text-sm text-gray-500"><span>Commission BYHOME (10%)</span><span>{formatBudget(devis.montantCommission)}</span></div>
                  <div className="flex justify-between text-lg font-display font-black text-blue-600 pt-2 border-t border-gray-200">
                    <span>Total</span><span>{formatBudget(devis.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {isClient && devis.statut === 'envoye' && (
              <div className="bg-white rounded-2xl border-2 border-blue-200 p-6">
                <h3 className="font-display font-bold text-gray-900 mb-4">Votre reponse</h3>
                {action === '' ? (
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={()=>setAction('accepter')} className="flex-1 py-3.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 text-lg">Accepter</button>
                    <button onClick={()=>setAction('counter')} className="flex-1 py-3.5 bg-amber-50 text-amber-700 border-2 border-amber-200 rounded-xl font-bold hover:bg-amber-100 text-lg">Contre-offre</button>
                    <button onClick={()=>setAction('refuser')} className="flex-1 py-3.5 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-bold hover:bg-red-100 text-lg">Refuser</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {action === 'counter' && (
                      <>
                        <p className="font-semibold text-gray-700">Proposer un nouveau montant</p>
                        <input type="number" value={note} onChange={e=>setNote(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                          placeholder="Montant propose en FCFA"/>
                      </>
                    )}
                    {action === 'refuser' && (
                      <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                        placeholder="Motif du refus..."/>
                    )}
                    {action === 'accepter' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                        En acceptant, vous vous engagez a payer {formatBudget(devis.total)} via BYHOME.
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={()=>handleAction(action === 'counter' ? 'counter' : action)} disabled={processing}
                        className={`flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 ${action==='accepter'?'bg-green-500 hover:bg-green-600':action==='counter'?'bg-amber-500 hover:bg-amber-600':'bg-red-500 hover:bg-red-600'}`}>
                        {processing ? '...' : action==='accepter'?'Confirmer':'Envoyer'}
                      </button>
                      <button onClick={()=>setAction('')} className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold">Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isClient && devis.statut === 'accepte' && (
              <div className="bg-white rounded-2xl border-2 border-green-200 p-6">
                <h3 className="font-display font-bold text-gray-900 mb-2">Valider les travaux</h3>
                <p className="text-gray-500 text-sm mb-4">L artisan recevra <strong>{formatBudget(devis.montantArtisan)}</strong> apres validation.</p>
                {action === 'terminer' ? (
                  <div className="space-y-3">
                    <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Commentaire sur les travaux..."/>
                    <div className="flex gap-3">
                      <button onClick={()=>handleAction('terminer')} disabled={processing}
                        className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-50">
                        {processing ? 'Validation...' : 'Confirmer'}
                      </button>
                      <button onClick={()=>setAction('')} className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>setAction('terminer')}
                    className="w-full py-3.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 text-lg">
                    Valider et payer l artisan
                  </button>
                )}
              </div>
            )}

            {isArtisan && devis.statut === 'envoye' && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <p className="text-blue-700 font-semibold">En attente de la reponse du client</p>
                <p className="text-blue-600 text-sm mt-1">Le client a {devis.validiteJours} jours pour repondre.</p>
                <Link to={`/devis/creer?edit=${devis._id}`} className="inline-flex items-center gap-2 mt-3 px-4 py-2 border-2 border-blue-300 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-100">✏️ Modifier ce devis</Link>
              <button onClick={async()=>{ if(window.confirm("Annuler ce devis ?")) { try { await api.put("/devis/"+devis._id+"/annuler"); window.location.reload(); } catch(e) { alert("Erreur"); } }}} className="inline-flex items-center gap-2 mt-2 px-4 py-2 border-2 border-red-200 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50">❌ Annuler ce devis</button>
              </div>
            )}

            {isArtisan && devis.statut === 'accepte' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <p className="text-green-700 font-semibold">Devis accepte — Travaux en cours</p>
                <p className="text-green-600 text-sm mt-1">Definissez les jalons et soumettez vos photos.</p>
              </div>
            )}

            {devis.statut === 'termine' && (
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5">
                <p className="text-green-700 font-bold text-lg">Travaux valides et paiement libere</p>
                <p className="text-green-600 text-sm mt-1">
                  {isArtisan ? `Vous recevrez ${formatBudget(devis.montantArtisan)} sur votre Mobile Money.` : `Le paiement a ete libere a l artisan.`}
                </p>
              </div>
            )}
            {devis.statut === "termine" && isClient && devis.artisan && (
              <AvisSection
                cibleUserId={devis.artisan._id || devis.artisan}
                cibleType="artisan"
                cibleRefId={devis.artisan._id || devis.artisan}
                nomCible={devis.artisan.name || "Artisan"}
              />
            )}
            )}
          </>
        )}

        {activeTab === 'jalons' && !['envoye','refuse'].includes(devis.statut) && (
          <JalonsSection devis={devis}/>
        )}

        {activeTab === 'photos' && !['envoye','refuse'].includes(devis.statut) && (
          <PhotosChantier devisId={devis._id}/>
        )}

        {['jalons','photos'].includes(activeTab) && ['envoye','refuse'].includes(devis.statut) && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-gray-500">Disponible apres acceptation du devis</p>
          </div>
        )}
      </div>

      {showLitige && (
        <LitigeModal
          devisId={devis._id}
          accuseId={isClient ? devis.artisan?._id : devis.client?._id}
          onClose={()=>setShowLitige(false)}
          onSuccess={()=>setMessage('Litige ouvert ! L admin va examiner votre reclamation.')}
        />
      )}
    </div>
  );
}
