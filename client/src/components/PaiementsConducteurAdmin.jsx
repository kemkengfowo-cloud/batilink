import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const STATUTS = {
  en_attente: { bg: '#FFF7ED', text: '#EA580C', label: '⏳ En attente' },
  confirme:   { bg: '#F0FDF4', text: '#16A34A', label: '✅ Confirmé' },
  echoue:     { bg: '#FFF1F2', text: '#E11D48', label: '❌ Échoué' },
  initie:     { bg: '#F8FAFC', text: '#64748B', label: '🔵 Initié' },
};

export default function PaiementsConducteurAdmin() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('');
  const [processing, setProcessing] = useState(null);
  const [msg, setMsg] = useState('');

  const loadPaiements = () => {
    const url = filtre ? '/paiements-conducteur/admin/tous?statut=' + filtre : '/paiements-conducteur/admin/tous';
    api.get(url)
      .then(res => setPaiements(res.data.paiements || []))
      .catch(() => setPaiements([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPaiements(); }, [filtre]);

  const confirmer = async (id) => {
    const transactionId = prompt('ID de transaction (optionnel):') || '';
    setProcessing(id);
    try {
      await api.put('/paiements-conducteur/' + id + '/confirmer', { transactionId });
      setMsg('Paiement conducteur confirme et distribue !');
      loadPaiements();
    } catch(err) {
      setMsg('Erreur: ' + (err.response && err.response.data ? err.response.data.message : 'Erreur'));
    } finally { setProcessing(null); }
  };

  const echouer = async (id) => {
    if (!window.confirm('Marquer ce paiement comme echoue ?')) return;
    setProcessing(id);
    try {
      await api.put('/paiements-conducteur/' + id + '/echouer', { notes: 'Paiement non recu' });
      setMsg('Paiement marque comme echoue.');
      loadPaiements();
    } catch(err) {
      setMsg('Erreur: ' + (err.response && err.response.data ? err.response.data.message : 'Erreur'));
    } finally { setProcessing(null); }
  };

  const enAttente = paiements.filter(p => p.statut === 'en_attente' || p.statut === 'initie').length;
  const totalConfirme = paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + (p.montant || 0), 0);
  const commissionTotal = paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + (p.commission || 0), 0);

  return (
    <div className="space-y-6">
      {msg && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex justify-between items-center">
          <span className="text-blue-700 text-sm font-semibold">{msg}</span>
          <button onClick={() => setMsg('')} className="text-blue-400 hover:text-blue-600">×</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-amber-600">{enAttente}</p>
          <p className="text-amber-700 text-sm mt-1">En attente de confirmation</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-xl font-black text-green-600">{new Intl.NumberFormat('fr-FR').format(totalConfirme)} FCFA</p>
          <p className="text-green-700 text-sm mt-1">Total confirmé</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-xl font-black text-blue-600">{new Intl.NumberFormat('fr-FR').format(commissionTotal)} FCFA</p>
          <p className="text-blue-700 text-sm mt-1">Commission B.Y.H</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { v: '', l: 'Tous' },
          { v: 'en_attente', l: '⏳ En attente' },
          { v: 'confirme', l: '✅ Confirmés' },
          { v: 'echoue', l: '❌ Échoués' },
        ].map(f => (
          <button key={f.v} onClick={() => setFiltre(f.v)}
            className={'px-4 py-2 rounded-xl text-sm font-semibold transition-all ' + (filtre === f.v ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300')}>
            {f.l}
          </button>
        ))}
        <button onClick={loadPaiements} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:border-blue-300 ml-auto">
          🔄 Actualiser
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Chargement...</div>
      ) : paiements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-gray-500">Aucun paiement conducteur</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paiements.map(p => {
            const statut = STATUTS[p.statut] || STATUTS.initie;
            return (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900">{p.demande ? p.demande.titreChantier : 'Chantier'}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{p.reference}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                    style={{ background: statut.bg, color: statut.text }}>
                    {statut.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">Client</p>
                    <p className="font-semibold">{p.client ? p.client.name : '-'}</p>
                    <p className="text-gray-400 text-xs">{p.client ? p.client.phone : ''}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">Conducteur</p>
                    <p className="font-semibold">{p.conducteur ? p.conducteur.name : '-'}</p>
                    <p className="text-gray-400 text-xs">{p.conducteur ? p.conducteur.phone : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-blue-400 text-xs mb-1">Montant total</p>
                    <p className="font-black text-blue-700">{new Intl.NumberFormat('fr-FR').format(p.montant)} FCFA</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-green-400 text-xs mb-1">Conducteur (90%)</p>
                    <p className="font-black text-green-700">{new Intl.NumberFormat('fr-FR').format(p.montantConducteur)} FCFA</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-amber-400 text-xs mb-1">B.Y.H (10%)</p>
                    <p className="font-black text-amber-700">{new Intl.NumberFormat('fr-FR').format(p.commission)} FCFA</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span>{p.operateur === 'orange_money' ? '🟠 Orange Money' : '🟡 MTN MoMo'}</span>
                  <span>{p.nombreJours} jour{p.nombreJours > 1 ? 's' : ''} × {new Intl.NumberFormat('fr-FR').format(p.tarifjour)} FCFA/j</span>
                  <span>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>

                {(p.statut === 'en_attente' || p.statut === 'initie') && (
                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <button onClick={() => confirmer(p._id)} disabled={processing === p._id}
                      className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50">
                      {processing === p._id ? '⏳...' : '✅ Confirmer le paiement'}
                    </button>
                    <button onClick={() => echouer(p._id)} disabled={processing === p._id}
                      className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 disabled:opacity-50">
                      ❌ Échoué
                    </button>
                  </div>
                )}

                {p.statut === 'confirme' && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-green-600 text-sm font-semibold">✅ Confirmé le {p.dateConfirmation ? new Date(p.dateConfirmation).toLocaleDateString('fr-FR') : '-'}</p>
                    {p.transactionId && <p className="text-gray-400 text-xs mt-1">Transaction: {p.transactionId}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
