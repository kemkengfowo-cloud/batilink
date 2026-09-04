import React, { useState } from 'react';
import api from '../utils/api';

const OPERATEURS = [
  {
    id: 'orange_money',
    nom: 'Orange Money',
    couleur: '#FF6600',
    bg: '#FFF3E0',
    border: '#FFB74D',
    emoji: '🟠',
    description: 'Paiement via Orange Money Cameroun',
  },
  {
    id: 'mtn_momo',
    nom: 'MTN MoMo',
    couleur: '#FFC107',
    bg: '#FFFDE7',
    border: '#FFD54F',
    emoji: '🟡',
    description: 'Paiement via MTN Mobile Money',
  },
];

export default function PaiementModal({ devis, jalon, onClose, onSuccess }) {
  const [operateur, setOperateur] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const montant = jalon ? jalon.montant : devis?.total;
  const commission = Math.round(montant * 0.08);
  const montantArtisan = montant - commission;

  const handlePayer = async () => {
    if (!operateur) { setError('Choisissez un opérateur.'); return; }
    if (!telephone || telephone.length < 9) { setError('Entrez un numéro valide.'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/mesomb/initier', {
        devisId: devis._id,
        jalonId: jalon?._id || null,
        operateur,
        telephone,
      });
      setResult(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch(err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'initiation du paiement');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">💳 Paiement sécurisé</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-blue-200 text-sm mb-1">{jalon ? `Jalon : ${jalon.titre}` : `Projet : ${devis?.titre || 'Devis'}`}</p>
            <p className="text-3xl font-black">{new Intl.NumberFormat('fr-FR').format(montant)} <span className="text-lg font-normal">FCFA</span></p>
            <div className="flex justify-between mt-2 text-xs text-blue-200">
              <span>Artisan recevra : {new Intl.NumberFormat('fr-FR').format(montantArtisan)} FCFA</span>
              <span>Commission B.Y.H : {new Intl.NumberFormat('fr-FR').format(commission)} FCFA</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!result ? (
            <>
              {/* Avertissement */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex gap-2">
                <span className="text-amber-500 flex-shrink-0">⚠️</span>
                <p className="text-amber-700 text-xs">L'argent sera transféré au compte B.Y.H. La distribution à l'artisan se fait après confirmation par notre équipe (30 min max).</p>
              </div>

              {/* Choix opérateur */}
              <p className="font-bold text-gray-900 mb-3">Choisissez votre opérateur</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {OPERATEURS.map(op => (
                  <button key={op.id} onClick={() => setOperateur(op.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-center ${operateur === op.id ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}>
                    <div className="text-3xl mb-1">{op.emoji}</div>
                    <div className="font-bold text-sm text-gray-900">{op.nom}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{op.description}</div>
                  </button>
                ))}
              </div>

              {/* Numéro de téléphone */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Votre numéro {operateur === 'orange_money' ? 'Orange' : operateur === 'mtn_momo' ? 'MTN' : 'Mobile Money'}
                </label>
                <div className="flex gap-2">
                  <div className="px-3 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold text-sm">+237</div>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    placeholder="6XX XXX XXX"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900"
                    maxLength={9}
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-sm mb-4 flex gap-1"><span>⚠️</span>{error}</p>}

              <button onClick={handlePayer} disabled={loading || !operateur || !telephone}
                className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20">
                {loading ? '⏳ Traitement...' : `Payer ${new Intl.NumberFormat('fr-FR').format(montant)} FCFA`}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">🔒 Paiement sécurisé par B.Y.H</p>
            </>
          ) : (
            /* Résultat paiement initié */
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Paiement initié !</h3>
              <p className="text-gray-500 text-sm mb-6">{result.message}</p>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-left space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Référence</span>
                  <span className="font-bold text-blue-600 text-sm">{result.paiement?.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Opérateur</span>
                  <span className="font-bold text-gray-900 text-sm">{result.paiement?.operateur}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Montant</span>
                  <span className="font-bold text-gray-900 text-sm">{new Intl.NumberFormat('fr-FR').format(result.paiement?.montant)} FCFA</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left space-y-2 mb-6">
                <p className="font-bold text-amber-800 text-sm mb-2">📋 Instructions de paiement</p>
                <p className="text-amber-700 text-sm">1️⃣ {result.instructions?.etape1}</p>
                <p className="text-amber-700 text-sm font-bold">📞 Numéro B.Y.H : {result.instructions?.numeroByh}</p>
                <p className="text-amber-700 text-sm">2️⃣ {result.instructions?.etape2}</p>
                <p className="text-amber-700 text-sm">3️⃣ {result.instructions?.etape3}</p>
              </div>

              <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
