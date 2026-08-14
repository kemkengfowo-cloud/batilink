import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatBudget, formatDate, getAvatarUrl } from '../utils/helpers';
import Avertissement from '../components/Avertissement';

const STATUT = {
  envoye:   { label:'En attente', color:'bg-yellow-50 text-yellow-700', icon:'⏳' },
  accepte:  { label:'Accepte - Travaux en cours', color:'bg-blue-50 text-blue-700', icon:'🔨' },
  refuse:   { label:'Refuse', color:'bg-red-50 text-red-700', icon:'❌' },
  expire:   { label:'Expire', color:'bg-gray-100 text-gray-500', icon:'⌛' },
  termine:  { label:'Termine - Paye', color:'bg-green-50 text-green-700', icon:'✅' },
};

export default function DevisDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

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
      setMessage(res.data.message || `Devis ${type} avec succes !`);
      setAction('');
      setNote('');
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
    finally { setProcessing(false); }
  };

  if (loading) return <Loader/>;
  if (!devis) return <div className="text-center py-20 text-gray-500">Devis non trouve.</div>;

  const isClient = user?._id === devis.client?._id || user?.id === devis.client?._id;
  const isArtisan = user?._id === devis.artisan?._id || user?.id === devis.artisan?._id;
  const statut = STATUT[devis.statut];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/devis" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 font-medium">
            ← Retour aux devis
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-mono text-gray-400 mb-1">{devis.numeroDevis}</p>
              <h1 className="text-2xl font-display font-bold text-gray-900">{devis.titre}</h1>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${statut?.color}`}>
              {statut?.icon} {statut?.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {message && (
          <div className="p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-2xl font-semibold">
            ✅ {message}
          </div>
        )}

        <Avertissement type="devis"/>

        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Prestataire</p>
            <div className="flex items-center gap-3">
              <img src={getAvatarUrl(devis.artisan?.avatar, devis.artisan?.name)} alt="" className="w-12 h-12 rounded-xl object-cover"/>
              <div>
                <p className="font-bold text-gray-900">{devis.artisan?.name}</p>
                <p className="text-gray-400 text-sm">{devis.artisan?.city}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Client</p>
            <div className="flex items-center gap-3">
              <img src={getAvatarUrl(devis.client?.avatar, devis.client?.name)} alt="" className="w-12 h-12 rounded-xl object-cover"/>
              <div>
                <p className="font-bold text-gray-900">{devis.client?.name}</p>
                <p className="text-gray-400 text-sm">{devis.client?.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-display font-bold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-600 leading-relaxed">{devis.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Delai d execution</p>
              <p className="font-bold text-gray-900">{devis.delaiExecution}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Validite du devis</p>
              <p className="font-bold text-gray-900">{devis.validiteJours} jours</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Materiels inclus</p>
              <p className="font-bold text-gray-900">{devis.materielsInclus ? 'Oui' : 'Non'}</p>
            </div>
          </div>
        </div>

        {/* Lignes du devis */}
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
                {devis.lignes?.map((l, i) => (
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

          {/* Totaux */}
          <div className="p-5 border-t border-gray-100">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span className="font-semibold">{formatBudget(devis.sousTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Commission Batilink (10%)</span>
                <span>{formatBudget(devis.montantCommission)}</span>
              </div>
              <div className="flex justify-between text-lg font-display font-black text-blue-600 pt-2 border-t border-gray-200">
                <span>Total a payer</span>
                <span>{formatBudget(devis.total)}</span>
              </div>
              {devis.statut === 'termine' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3">
                  <p className="text-xs text-green-600 font-semibold mb-1">Repartition du paiement :</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Artisan (90%)</span>
                    <span className="font-bold text-green-700">{formatBudget(devis.montantArtisan)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Batilink (10%)</span>
                    <span className="font-semibold text-gray-500">{formatBudget(devis.montantCommission)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-blue-600 uppercase mb-2">Conditions de paiement</p>
          <p className="text-blue-800 text-sm">{devis.conditionsPaiement}</p>
        </div>

        {/* Actions client */}
        {isClient && devis.statut === 'envoye' && (
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6">
            <h3 className="font-display font-bold text-gray-900 mb-4">Votre reponse</h3>
            {action === '' ? (
              <div className="flex gap-3 flex-wrap">
                <button onClick={()=>setAction('accepter')}
                  className="flex-1 py-3.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors text-lg">
                  ✅ Accepter le devis
                </button>
                <button onClick={()=>setAction('refuser')}
                  className="flex-1 py-3.5 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors text-lg">
                  ❌ Refuser
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-semibold text-gray-700">
                  {action==='accepter'?'Confirmer l acceptation du devis ?':'Motif du refus (optionnel) :'}
                </p>
                {action==='refuser' && (
                  <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Expliquez pourquoi vous refusez ce devis..."/>
                )}
                {action==='accepter' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                    ⚠️ En acceptant ce devis, vous vous engagez a effectuer le paiement de <strong>{formatBudget(devis.total)}</strong> via Batilink. L argent sera bloque jusqu a la validation des travaux.
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={()=>handleAction(action)} disabled={processing}
                    className={`flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-colors ${action==='accepter'?'bg-green-500 hover:bg-green-600':'bg-red-500 hover:bg-red-600'}`}>
                    {processing?'En cours...':action==='accepter'?'Confirmer l acceptation':'Confirmer le refus'}
                  </button>
                  <button onClick={()=>setAction('')}
                    className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation travaux */}
        {isClient && devis.statut === 'accepte' && (
          <div className="bg-white rounded-2xl border-2 border-green-200 p-6">
            <h3 className="font-display font-bold text-gray-900 mb-2">Valider les travaux</h3>
            <p className="text-gray-500 text-sm mb-4">
              Confirmez que les travaux ont ete realises conformement au devis. 
              L artisan recevra alors <strong>{formatBudget(devis.montantArtisan)}</strong> sur son Mobile Money.
            </p>
            {action === 'terminer' ? (
              <div className="space-y-4">
                <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Commentaire optionnel sur les travaux realises..."/>
                <div className="flex gap-3">
                  <button onClick={()=>handleAction('terminer')} disabled={processing}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-50">
                    {processing?'Validation...':'Confirmer la fin des travaux'}
                  </button>
                  <button onClick={()=>setAction('')}
                    className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={()=>setAction('terminer')}
                className="w-full py-3.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors text-lg">
                ✅ Valider la fin des travaux et payer l artisan
              </button>
            )}
          </div>
        )}

        {/* Info artisan */}
        {isArtisan && devis.statut === 'envoye' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <p className="text-blue-700 font-semibold">⏳ En attente de la reponse du client</p>
            <p className="text-blue-600 text-sm mt-1">Le client a {devis.validiteJours} jours pour accepter ou refuser ce devis.</p>
          </div>
        )}

        {isArtisan && devis.statut === 'accepte' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="text-green-700 font-semibold">🔨 Devis accepte — Travaux en cours</p>
            <p className="text-green-600 text-sm mt-1">
              Realisez les travaux. Vous recevrez <strong>{formatBudget(devis.montantArtisan)}</strong> apres validation du client.
            </p>
          </div>
        )}

        {isArtisan && devis.statut === 'termine' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5">
            <p className="text-green-700 font-bold text-lg">💰 Travaux valides par le client</p>
            <p className="text-green-600 text-sm mt-1">
              Vous recevrez <strong>{formatBudget(devis.montantArtisan)}</strong> sur votre Mobile Money dans les 24-48h.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
