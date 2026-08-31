import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatBudget, formatDate, getAvatarUrl } from '../utils/helpers';
import Avertissement from '../components/Avertissement';

const STATUT = {
  en_attente_signatures: { label:'En attente de signatures', color:'bg-yellow-50 text-yellow-700', icon:'✍️' },
  signe:    { label:'Signe par les deux parties', color:'bg-blue-50 text-blue-700', icon:'📝' },
  en_cours: { label:'Mission en cours', color:'bg-green-50 text-green-700', icon:'🔨' },
  termine:  { label:'Mission terminee et payee', color:'bg-gray-100 text-gray-600', icon:'✅' },
  resilie:  { label:'Contrat resilie', color:'bg-red-50 text-red-700', icon:'❌' },
};

export default function ContratDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [contrat, setContrat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [nomSignature, setNomSignature] = useState('');
  const [showSignForm, setShowSignForm] = useState(false);
  const [note, setNote] = useState('');
  const [showTerminerForm, setShowTerminerForm] = useState(false);

  useEffect(() => {
    api.get(`/contrats/${id}`)
      .then(res => setContrat(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action, data={}) => {
    setProcessing(true);
    try {
      const res = await api.put(`/contrats/${id}/${action}`, data);
      setContrat(res.data.contrat || res.data);
      setMessage(res.data.message || 'Action effectuee avec succes !');
      setShowSignForm(false);
      setShowTerminerForm(false);
    } catch(err) { setMessage(err.response?.data?.message || 'Erreur'); }
    finally { setProcessing(false); }
  };

  if (loading) return <Loader/>;
  if (!contrat) return <div className="text-center py-20 text-gray-500">Contrat non trouve.</div>;

  const isEmployeur = user?._id === contrat.employeur?._id || user?.id === contrat.employeur?._id;
  const isTechnicien = user?._id === contrat.technicien?._id || user?.id === contrat.technicien?._id;
  const statut = STATUT[contrat.statut];

  const dejaSigne = isEmployeur
    ? contrat.signatureEmployeur?.signe
    : contrat.signatureTechnicien?.signe;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/contrats" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 font-medium">
            ← Retour aux contrats
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-mono text-gray-400 mb-1">{contrat.numeroContrat}</p>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Contrat de mission — {contrat.typePersonnel}
              </h1>
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
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Employeur</p>
            <div className="flex items-center gap-3 mb-3">
              <img src={getAvatarUrl(contrat.employeur?.avatar, contrat.employeur?.name)} alt="" className="w-12 h-12 rounded-xl object-cover"/>
              <div>
                <p className="font-bold text-gray-900">{contrat.employeur?.name}</p>
                <p className="text-gray-400 text-sm">{contrat.employeur?.city}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${contrat.signatureEmployeur?.signe?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>
              {contrat.signatureEmployeur?.signe ? (
                <>✓ Signe le {formatDate(contrat.signatureEmployeur.date)}</>
              ) : '⏳ Signature en attente'}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Technicien</p>
            <div className="flex items-center gap-3 mb-3">
              <img src={getAvatarUrl(contrat.technicien?.avatar, contrat.technicien?.name)} alt="" className="w-12 h-12 rounded-xl object-cover"/>
              <div>
                <p className="font-bold text-gray-900">{contrat.technicien?.name}</p>
                <p className="text-gray-400 text-sm">{contrat.technicien?.city}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${contrat.signatureTechnicien?.signe?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>
              {contrat.signatureTechnicien?.signe ? (
                <>✓ Signe le {formatDate(contrat.signatureTechnicien.date)}</>
              ) : '⏳ Signature en attente'}
            </div>
          </div>
        </div>

        {/* Details mission */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-display font-bold text-gray-900 mb-5 text-xl">Details de la mission</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { label:'Type de personnel', value:contrat.typePersonnel },
              { label:'Nombre de personnes', value:contrat.nombrePersonnes },
              { label:'Date de debut', value:formatDate(contrat.dateDebut) },
              { label:'Date de fin', value:formatDate(contrat.dateFin) },
              { label:'Adresse chantier', value:contrat.adresseChantier },
              { label:'Horaires', value:contrat.horaires },
              { label:'Equipements fournis', value:contrat.equipementsFournis?'Oui':'Non' },
            ].map(i=>(
              <div key={i.label} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">{i.label}</p>
                <p className="font-semibold text-gray-900 text-sm">{i.value}</p>
              </div>
            ))}
          </div>
          {contrat.obligations && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Obligations</p>
              <p className="text-gray-600 text-sm leading-relaxed">{contrat.obligations}</p>
            </div>
          )}
        </div>

        {/* Financier */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Remuneration</h2>
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm text-gray-600 py-2 border-b border-gray-100">
              <span>Remuneration totale</span>
              <span className="font-bold">{formatBudget(contrat.remunerationTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 py-2 border-b border-gray-100">
              <span>Commission B.Y.H (8%)</span>
              <span>{formatBudget(contrat.montantCommission)}</span>
            </div>
            <div className="flex justify-between text-lg font-display font-black text-green-600 py-2">
              <span>Technicien recevra</span>
              <span>{formatBudget(contrat.montantTechnicien)}</span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-blue-600 uppercase mb-2">Conditions de resiliation</p>
          <p className="text-blue-800 text-sm">{contrat.conditionsResiliation}</p>
        </div>

        {/* Signature */}
        {contrat.statut === 'en_attente_signatures' && !dejaSigne && (
          <div className="bg-white rounded-2xl border-2 border-blue-300 p-6">
            <h3 className="font-display font-bold text-gray-900 mb-2">Signer le contrat</h3>
            <p className="text-gray-500 text-sm mb-4">
              En signant ce contrat, vous acceptez toutes les conditions ci-dessus.
              Votre signature electronique a valeur legale.
            </p>
            {!showSignForm ? (
              <button onClick={()=>setShowSignForm(true)}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-lg">
                ✍️ Signer le contrat
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tapez votre nom complet pour signer *
                  </label>
                  <input type="text" value={nomSignature} onChange={e=>setNomSignature(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
                    placeholder="Votre nom complet"/>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                  ⚠️ En signant, vous confirmez avoir lu et accepte toutes les conditions du contrat. Cette signature electronique est juridiquement contraignante.
                </div>
                <div className="flex gap-3">
                  <button onClick={()=>handleAction('signer', { nom: nomSignature })}
                    disabled={processing || !nomSignature.trim()}
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {processing ? 'Signature...' : 'Confirmer ma signature'}
                  </button>
                  <button onClick={()=>setShowSignForm(false)}
                    className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {contrat.statut === 'en_attente_signatures' && dejaSigne && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="text-green-700 font-semibold">✅ Vous avez signe ce contrat</p>
            <p className="text-green-600 text-sm mt-1">En attente de la signature de l autre partie.</p>
          </div>
        )}

        {/* Demarrer mission */}
        {isEmployeur && contrat.statut === 'signe' && (
          <div className="bg-white rounded-2xl border-2 border-green-200 p-6">
            <h3 className="font-display font-bold text-gray-900 mb-2">Demarrer la mission</h3>
            <p className="text-gray-500 text-sm mb-4">Les deux parties ont signe. Confirmez le demarrage de la mission.</p>
            <button onClick={()=>handleAction('demarrer')} disabled={processing}
              className="w-full py-3.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-50 transition-colors">
              {processing?'...':'🔨 Demarrer la mission'}
            </button>
          </div>
        )}

        {/* Valider fin */}
        {isEmployeur && contrat.statut === 'en_cours' && (
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6">
            <h3 className="font-display font-bold text-gray-900 mb-2">Valider la fin de mission</h3>
            <p className="text-gray-500 text-sm mb-4">
              Confirmez que la mission est terminee. Le technicien recevra{' '}
              <strong>{formatBudget(contrat.montantTechnicien)}</strong> sur son Mobile Money.
            </p>
            {!showTerminerForm ? (
              <button onClick={()=>setShowTerminerForm(true)}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                ✅ Valider et payer le technicien
              </button>
            ) : (
              <div className="space-y-4">
                <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Commentaire sur la mission (optionnel)..."/>
                <div className="flex gap-3">
                  <button onClick={()=>handleAction('terminer', { note })} disabled={processing}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-50">
                    {processing?'Validation...':'Confirmer la validation'}
                  </button>
                  <button onClick={()=>setShowTerminerForm(false)}
                    className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info technicien en cours */}
        {isTechnicien && contrat.statut === 'en_cours' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
            <p className="text-green-700 font-bold text-lg">🔨 Mission en cours</p>
            <p className="text-green-600 text-sm mt-1">
              Realisez votre mission. Vous recevrez{' '}
              <strong>{formatBudget(contrat.montantTechnicien)}</strong> apres validation de l employeur.
            </p>
          </div>
        )}

        {/* Termine */}
        {contrat.statut === 'termine' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5">
            <p className="text-green-700 font-bold text-lg">💰 Mission terminee et validee</p>
            <p className="text-green-600 text-sm mt-1">
              {isTechnicien
                ? `Vous recevrez ${formatBudget(contrat.montantTechnicien)} sur votre Mobile Money dans 24-48h.`
                : `Le technicien recevra ${formatBudget(contrat.montantTechnicien)} sur son Mobile Money.`}
            </p>
            {contrat.noteEmployeur && <p className="text-green-600 text-sm mt-2 italic">"{contrat.noteEmployeur}"</p>}
          </div>
        )}

        {/* Resilier */}
        {['en_attente_signatures','signe'].includes(contrat.statut) && (isEmployeur || isTechnicien) && (
          <div className="text-center">
            <button onClick={()=>{ if(window.confirm('Resilier ce contrat ?')) handleAction('resilier'); }}
              className="px-5 py-2.5 text-red-500 border-2 border-red-200 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
              Resilier le contrat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
