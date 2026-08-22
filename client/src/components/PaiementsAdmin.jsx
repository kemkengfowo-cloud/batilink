import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const STATUTS = {
  en_attente: { bg: '#FFF7ED', text: '#EA580C', label: '⏳ En attente' },
  confirme:   { bg: '#F0FDF4', text: '#16A34A', label: '✅ Confirmé' },
  echoue:     { bg: '#FFF1F2', text: '#E11D48', label: '❌ Échoué' },
  initie:     { bg: '#F8FAFC', text: '#64748B', label: '🔵 Initié' },
};

export default function PaiementsAdmin() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('');
  const [processing, setProcessing] = useState(null);
  const [msg, setMsg] = useState('');

  const loadPaiements = () => {
    const url = filtre ? `/paiements/admin/tous?statut=${filtre}` : '/paiements/admin/tous';
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
      await api.put(`/paiements/${id}/confirmer`, { transactionId });
      setMsg('✅ Paiement confirmé et distribué !');
      loadPaiements();
    } catch(err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Erreur'));
    } finally { setProcessing(null); }
  };

  const echouer = async (id) => {
    if (!window.confirm('Marquer ce paiement comme échoué ?')) return;
    setProcessing(id);
    try {
      await api.put(`/paiements/${id}/echouer`, { notes: 'Paiement non reçu' });
      setMsg('Paiement marqué comme échoué.');
      loadPaiements();
    } catch(err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Erreur'));
    } finally { setProcessing(null); }
  };

  const enAttente = paiements.filter(p => p.statut === 'en_attente').length;
  const totalConfirme = paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + p.montant, 0);
  const totalCommission = paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + p.commission, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-gray-900">💳 Gestion des paiements</h2>
        <button onClick={loadPaiements} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
          Actualiser
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm font-semibold ${msg.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
          <button onClick={() => setMsg('')} className="ml-2 opacity-50 hover:opacity-100">×</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-amber-600">{enAttente}</p>
          <p className="text-amber-700 text-sm font-semibold mt-1">En attente de confirmation</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-green-600">{new Intl.NumberFormat('fr-FR').format(totalConfirme)}</p>
          <p className="text-green-700 text-sm font-semibold mt-1">FCFA total confirmé</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{new Intl.NumberFormat('fr-FR').format(totalCommission)}</p>
          <p className="text-blue-700 text-sm font-semibold mt-1">FCFA commission B.Y.H</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[{v:'', l:'Tous'}, {v:'en_attente', l:'⏳ En attente'}, {v:'confirme', l:'✅ Confirmés'}, {v:'echoue', l:'❌ Échoués'}].map(f => (
          <button key={f.v} onClick={() => setFiltre(f.v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filtre === f.v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Liste paiements */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Chargement...</div>
      ) : paiements.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">💳</div>
          <p className="text-gray-500">Aucun paiement {filtre ? 'avec ce statut' : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paiements.map(p => {
            const statut = STATUTS[p.statut] || STATUTS.initie;
            return (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900">{p.devis?.titre || 'Projet'}</p>
                    <p className="text-blue-600 font-mono text-sm">{p.reference}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: statut.bg, color: statut.text}}>
                    {statut.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-400">Client</p>
                    <p className="font-semibold">{p.client?.name}</p>
                    <p className="text-gray-400 text-xs">{p.client?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Artisan</p>
                    <p className="font-semibold">{p.artisan?.name}</p>
                    <p className="text-gray-400 text-xs">{p.artisan?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Montant</p>
                    <p className="font-black text-gray-900">{new Intl.NumberFormat('fr-FR').format(p.montant)} FCFA</p>
                    <p className="text-green-600 text-xs">Artisan: {new Intl.NumberFormat('fr-FR').format(p.montantArtisan)} FCFA</p>
                    <p className="text-blue-600 text-xs">B.Y.H: {new Intl.NumberFormat('fr-FR').format(p.commission)} FCFA</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Opérateur</p>
                    <p className="font-semibold">{p.operateur === 'orange_money' ? '🟠 Orange Money' : '🟡 MTN MoMo'}</p>
                    <p className="text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {p.statut === 'en_attente' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
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
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    <span className="text-green-600 text-sm">✅ Confirmé le {new Date(p.dateConfirmation).toLocaleDateString('fr-FR')}</span>
                    {p.transactionId && <span className="text-gray-400 text-xs">ID: {p.transactionId}</span>}
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
