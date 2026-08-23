import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const STATUTS = {
  en_attente:           { bg:'#FFF7ED', text:'#EA580C', label:'⏳ En attente' },
  en_traitement:        { bg:'#EFF6FF', text:'#2563EB', label:'🔍 En traitement' },
  conducteur_propose:   { bg:'#F0FDF4', text:'#16A34A', label:'👷 Conducteur proposé' },
  contrat_client:       { bg:'#FDF4FF', text:'#9333EA', label:'📄 Contrat client' },
  valide_client:        { bg:'#F0FDF4', text:'#16A34A', label:'✅ Validé client' },
  en_cours:             { bg:'#EFF6FF', text:'#2563EB', label:'🏗️ En cours' },
  terminee:             { bg:'#F8FAFC', text:'#64748B', label:'✅ Terminé' },
  annulee:              { bg:'#FFF1F2', text:'#E11D48', label:'❌ Annulé' },
};

export default function ConducteurTravauxAdmin() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('');
  const [msg, setMsg] = useState('');
  const [conducteurs, setConducteurs] = useState([]);
  const [showProposer, setShowProposer] = useState(null);
  const [proposition, setProposition] = useState({ conducteurId:'', budgetFinal:'', message:'' });

  const loadDemandes = () => {
    const url = filtre ? `/conducteur-travaux/admin/demandes?statut=${filtre}` : '/conducteur-travaux/admin/demandes';
    api.get(url)
      .then(res => setDemandes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDemandes([]))
      .finally(() => setLoading(false));
  };

  const loadConducteurs = () => {
    api.get('/admin/users?role=artisan')
      .then(res => setConducteurs(Array.isArray(res.data) ? res.data : res.data?.users || []))
      .catch(() => setConducteurs([]));
  };

  useEffect(() => { loadDemandes(); loadConducteurs(); }, [filtre]);

  const handleProposer = async (demandeId) => {
    try {
      await api.put(`/conducteur-travaux/admin/demandes/${demandeId}/proposer`, proposition);
      setMsg('✅ Conducteur proposé au client !');
      setShowProposer(null);
      loadDemandes();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const handleEnvoyerContrat = async (demandeId) => {
    try {
      await api.put(`/conducteur-travaux/admin/demandes/${demandeId}/envoyer-contrat-client`, {});
      setMsg('✅ Contrat envoyé au client !');
      loadDemandes();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const handleActiver = async (demandeId) => {
    if (!window.confirm('Activer la mission ? Le conducteur pourra soumettre des rapports.')) return;
    try {
      await api.put(`/conducteur-travaux/admin/demandes/${demandeId}/activer`, {});
      setMsg('✅ Mission activée ! Le conducteur est notifié.');
      loadDemandes();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const enAttente = demandes.filter(d => d.statut === 'en_attente').length;
  const enCours = demandes.filter(d => d.statut === 'en_cours').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-gray-900">🏗️ Conducteurs de Travaux</h2>
        <button onClick={loadDemandes} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
          Actualiser
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm font-semibold ${msg.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg} <button onClick={() => setMsg('')} className="ml-2 opacity-50">×</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-amber-600">{enAttente}</p>
          <p className="text-amber-700 text-sm font-semibold mt-1">En attente de traitement</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-blue-600">{enCours}</p>
          <p className="text-blue-700 text-sm font-semibold mt-1">Missions en cours</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-gray-600">{demandes.length}</p>
          <p className="text-gray-700 text-sm font-semibold mt-1">Total demandes</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { v:'', l:'Toutes' },
          { v:'en_attente', l:'⏳ En attente' },
          { v:'conducteur_propose', l:'👷 Proposé' },
          { v:'contrat_client', l:'📄 Contrat client' },
          { v:'valide_client', l:'✅ Validé' },
          { v:'en_cours', l:'🏗️ En cours' },
        ].map(f => (
          <button key={f.v} onClick={() => setFiltre(f.v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filtre === f.v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Liste demandes */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Chargement...</div>
      ) : demandes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">🏗️</div>
          <p className="text-gray-500">Aucune demande</p>
        </div>
      ) : demandes.map(d => {
        const statut = STATUTS[d.statut] || STATUTS.en_attente;
        return (
          <div key={d._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{d.titreChantier}</h3>
                <p className="text-gray-500 text-sm">📍 {d.localisation} — {d.ville}</p>
                <p className="text-gray-500 text-sm">👤 Client : {d.client?.name} — {d.client?.phone}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background:statut.bg, color:statut.text}}>
                {statut.label}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Type</p>
                <p className="font-semibold capitalize">{d.typeChantier}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Début</p>
                <p className="font-semibold">{d.dateDebut ? new Date(d.dateDebut).toLocaleDateString('fr-FR') : '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Budget proposé</p>
                <p className="font-semibold">{d.budgetPropose ? `${new Intl.NumberFormat('fr-FR').format(d.budgetPropose)} FCFA/j` : 'Non défini'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Rapports</p>
                <p className="font-semibold">{d.nombreRapports || 0}</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{d.description}</p>

            {d.conducteurPropose && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                <p className="text-green-700 text-sm font-semibold">👷 Conducteur proposé : {d.conducteurPropose.name}</p>
                {d.budgetFinal && <p className="text-green-600 text-xs">{new Intl.NumberFormat('fr-FR').format(d.budgetFinal)} FCFA/jour</p>}
              </div>
            )}

            {d.conducteur && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                <p className="text-blue-700 text-sm font-semibold">🏗️ Conducteur assigné : {d.conducteur.name}</p>
                <p className="text-blue-600 text-xs">{d.conducteur.phone} — Avancement : {d.avancementGlobal || 0}%</p>
              </div>
            )}

            {/* Actions admin */}
            <div className="flex gap-2 pt-3 border-t border-gray-100 flex-wrap">
              {d.statut === 'en_attente' && (
                <button onClick={() => { setShowProposer(d._id); setProposition({ conducteurId:'', budgetFinal:'', message:'' }); }}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">
                  👷 Proposer un conducteur
                </button>
              )}
              {d.statut === 'conducteur_propose' && (
                <button onClick={() => handleEnvoyerContrat(d._id)}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700">
                  📄 Envoyer contrat au client
                </button>
              )}
              {d.statut === 'valide_client' && (
                <button onClick={() => handleActiver(d._id)}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
                  🚀 Activer la mission
                </button>
              )}
            </div>

            {/* Modal proposer conducteur */}
            {showProposer === d._id && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <h4 className="font-bold text-blue-900">Proposer un conducteur</h4>
                <select value={proposition.conducteurId} onChange={e => setProposition(p=>({...p,conducteurId:e.target.value}))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500">
                  <option value="">Choisir un conducteur...</option>
                  {conducteurs.map(c => <option key={c._id} value={c._id}>{c.name} — {c.city}</option>)}
                </select>
                <input type="number" placeholder="Tarif journalier (FCFA)" value={proposition.budgetFinal}
                  onChange={e => setProposition(p=>({...p,budgetFinal:e.target.value}))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/>
                <textarea placeholder="Message pour le client..." value={proposition.message}
                  onChange={e => setProposition(p=>({...p,message:e.target.value}))}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500" rows={2}/>
                <div className="flex gap-2">
                  <button onClick={() => handleProposer(d._id)}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">
                    ✅ Envoyer la proposition
                  </button>
                  <button onClick={() => setShowProposer(null)}
                    className="px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-xl text-sm">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
