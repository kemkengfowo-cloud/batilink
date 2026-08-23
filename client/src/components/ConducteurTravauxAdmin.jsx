import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const STATUTS = {
  en_attente:         { bg:'#FFF7ED', text:'#EA580C', label:'⏳ En attente' },
  offres_envoyees:    { bg:'#EFF6FF', text:'#2563EB', label:'📤 Offres envoyées' },
  conducteur_accepte: { bg:'#F0FDF4', text:'#16A34A', label:'✅ Conducteur accepte' },
  contrat_conducteur: { bg:'#FDF4FF', text:'#9333EA', label:'📄 Contrat conducteur' },
  conducteur_valide:  { bg:'#F0FDF4', text:'#16A34A', label:'✍️ Conducteur signé' },
  propose_client:     { bg:'#EFF6FF', text:'#2563EB', label:'👤 Proposé client' },
  contrat_client:     { bg:'#FDF4FF', text:'#9333EA', label:'📄 Contrat client' },
  valide_client:      { bg:'#F0FDF4', text:'#16A34A', label:'✅ Client validé' },
  en_cours:           { bg:'#F0FDF4', text:'#16A34A', label:'🏗️ En cours' },
  terminee:           { bg:'#F8FAFC', text:'#64748B', label:'✅ Terminé' },
  annulee:            { bg:'#FFF1F2', text:'#E11D48', label:'❌ Annulé' },
};

export default function ConducteurTravauxAdmin() {
  const [demandes, setDemandes] = useState([]);
  const [conducteurs, setConducteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('');
  const [msg, setMsg] = useState('');
  const [showOffres, setShowOffres] = useState(null);
  const [offresForm, setOffresForm] = useState([{ conducteurId:'', tarifjour:'', message:'' }]);

  const loadDemandes = () => {
    const url = filtre ? `/conducteur-travaux/admin/demandes?statut=${filtre}` : '/conducteur-travaux/admin/demandes';
    api.get(url)
      .then(res => setDemandes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDemandes([]))
      .finally(() => setLoading(false));
  };

  const loadConducteurs = () => {
    api.get('/admin/users')
      .then(res => {
        const users = Array.isArray(res.data) ? res.data : (res.data?.users || []);
        setConducteurs(users.filter(u => u.role === 'conducteur'));
      })
      .catch(() => setConducteurs([]));
  };

  useEffect(() => { loadDemandes(); loadConducteurs(); }, [filtre]);

  const handleEnvoyerOffres = async (demandeId) => {
    const offresValides = offresForm.filter(o => o.conducteurId && o.tarifjour);
    if (!offresValides.length) { setMsg('❌ Ajoutez au moins un conducteur avec un tarif.'); return; }
    try {
      await api.post(`/conducteur-travaux/admin/demandes/${demandeId}/envoyer-offres`, { conducteurs: offresValides });
      setMsg(`✅ Offres envoyées à ${offresValides.length} conducteur(s) !`);
      setShowOffres(null);
      setOffresForm([{ conducteurId:'', tarifjour:'', message:'' }]);
      loadDemandes();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const handleEnvoyerContratConducteur = async (demandeId) => {
    try {
      await api.put(`/conducteur-travaux/admin/demandes/${demandeId}/envoyer-contrat-conducteur`, {});
      setMsg('✅ Contrat envoyé au conducteur !');
      loadDemandes();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const handleProposerClient = async (demandeId) => {
    try {
      await api.put(`/conducteur-travaux/admin/demandes/${demandeId}/proposer-client`, {});
      setMsg('✅ Conducteur proposé au client !');
      loadDemandes();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const handleEnvoyerContratClient = async (demandeId) => {
    try {
      await api.put(`/conducteur-travaux/admin/demandes/${demandeId}/envoyer-contrat-client`, {});
      setMsg('✅ Contrat envoyé au client !');
      loadDemandes();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const handleActiver = async (demandeId) => {
    if (!window.confirm('Activer la mission ?')) return;
    try {
      await api.put(`/conducteur-travaux/admin/demandes/${demandeId}/activer`, {});
      setMsg('✅ Mission activée !');
      loadDemandes();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const enAttente = demandes.filter(d => d.statut === 'en_attente').length;
  const enCours = demandes.filter(d => d.statut === 'en_cours').length;
  const aTraiter = demandes.filter(d => ['conducteur_accepte','conducteur_valide'].includes(d.statut)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-gray-900">🏗️ Conducteurs de Travaux</h2>
        <button onClick={loadDemandes} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Actualiser</button>
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
          <p className="text-amber-700 text-sm font-semibold mt-1">Nouvelles demandes</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-orange-600">{aTraiter}</p>
          <p className="text-orange-700 text-sm font-semibold mt-1">À traiter</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-green-600">{enCours}</p>
          <p className="text-green-700 text-sm font-semibold mt-1">En cours</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { v:'', l:'Toutes' },
          { v:'en_attente', l:'⏳ Nouvelles' },
          { v:'offres_envoyees', l:'📤 Offres envoyées' },
          { v:'conducteur_accepte', l:'✅ Acceptées' },
          { v:'conducteur_valide', l:'✍️ Contrat signé' },
          { v:'propose_client', l:'👤 Proposé client' },
          { v:'en_cours', l:'🏗️ En cours' },
        ].map(f => (
          <button key={f.v} onClick={() => setFiltre(f.v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filtre === f.v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Chargement...</div>
      ) : demandes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">🏗️</div>
          <p className="text-gray-500">Aucune demande</p>
        </div>
      ) : demandes.map(d => {
        const statut = STATUTS[d.statut] || STATUTS.en_attente;
        const conducteurRetenu = d.conducteurRetenu;
        const offresEnvoyees = d.offres || [];
        const offreAcceptee = offresEnvoyees.find(o => o.statut === 'acceptee');

        return (
          <div key={d._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{d.titreChantier}</h3>
                <p className="text-gray-500 text-sm">📍 {d.localisation} — {d.ville}</p>
                <p className="text-gray-500 text-sm">👤 {d.client?.name} — {d.client?.phone}</p>
                <p className="text-gray-400 text-xs mt-1">{new Date(d.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0" style={{background:statut.bg, color:statut.text}}>
                {statut.label}
              </span>
            </div>

            {/* Infos chantier */}
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
                <p className="text-gray-400 text-xs">Budget client/jour</p>
                <p className="font-semibold">{d.budgetPropose ? `${new Intl.NumberFormat('fr-FR').format(d.budgetPropose)} FCFA` : 'Non défini'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Rapports</p>
                <p className="font-semibold">{d.nombreRapports || 0}</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 italic">{d.description}</p>

            {/* Offres envoyées */}
            {offresEnvoyees.length > 0 && (
              <div className="mb-4">
                <p className="font-bold text-gray-700 text-sm mb-2">📤 Offres envoyées ({offresEnvoyees.length})</p>
                <div className="space-y-2">
                  {offresEnvoyees.map((o, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                      o.statut === 'acceptee' ? 'bg-green-50 border border-green-200' :
                      o.statut === 'refusee' ? 'bg-red-50 border border-red-200' :
                      o.statut === 'expiree' ? 'bg-gray-50 border border-gray-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}>
                      <div>
                        <p className="font-semibold">{o.conducteur?.name}</p>
                        <p className="text-gray-500 text-xs">{o.conducteur?.phone} — {o.conducteur?.city}</p>
                        {o.messageReponse && <p className="text-gray-600 text-xs italic mt-0.5">"{o.messageReponse}"</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{new Intl.NumberFormat('fr-FR').format(o.tarifjour)} FCFA/j</p>
                        <span className={`text-xs font-bold ${
                          o.statut === 'acceptee' ? 'text-green-700' :
                          o.statut === 'refusee' ? 'text-red-600' :
                          o.statut === 'expiree' ? 'text-gray-400' :
                          'text-blue-600'
                        }`}>
                          {o.statut === 'acceptee' ? '✅ Acceptée' :
                           o.statut === 'refusee' ? '❌ Refusée' :
                           o.statut === 'expiree' ? '⏸️ Expirée' :
                           '⏳ En attente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conducteur retenu */}
            {conducteurRetenu && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="font-bold text-green-800 mb-1">✅ Conducteur retenu</p>
                <p className="text-green-700">{conducteurRetenu.name} — {conducteurRetenu.phone}</p>
                {d.tarifjourFinal && <p className="text-green-600 text-sm font-semibold">{new Intl.NumberFormat('fr-FR').format(d.tarifjourFinal)} FCFA/jour</p>}
              </div>
            )}

            {/* Avancement si en cours */}
            {d.statut === 'en_cours' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Avancement</span>
                  <span className="font-bold text-green-600">{d.avancementGlobal || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 rounded-full h-2" style={{width:`${d.avancementGlobal||0}%`}}/>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-100 flex-wrap">
              {/* Envoyer offres aux conducteurs */}
              {d.statut === 'en_attente' && (
                <button onClick={() => { setShowOffres(d._id); setOffresForm([{ conducteurId:'', tarifjour:'', message:'' }]); }}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">
                  📤 Envoyer offres aux conducteurs
                </button>
              )}
              {/* Envoyer contrat au conducteur */}
              {d.statut === 'conducteur_accepte' && (
                <button onClick={() => handleEnvoyerContratConducteur(d._id)}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700">
                  📄 Envoyer contrat au conducteur
                </button>
              )}
              {/* Proposer au client */}
              {d.statut === 'conducteur_valide' && (
                <button onClick={() => handleProposerClient(d._id)}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">
                  👤 Proposer au client
                </button>
              )}
              {/* Envoyer contrat au client */}
              {d.statut === 'propose_client' && (
                <button onClick={() => handleEnvoyerContratClient(d._id)}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700">
                  📄 Envoyer contrat au client
                </button>
              )}
              {/* Activer la mission */}
              {d.statut === 'valide_client' && (
                <button onClick={() => handleActiver(d._id)}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
                  🚀 Activer la mission
                </button>
              )}
            </div>

            {/* Modal envoi offres */}
            {showOffres === d._id && (
              <div className="mt-4 p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-4">
                <h4 className="font-bold text-blue-900">📤 Envoyer des offres aux conducteurs</h4>
                <p className="text-blue-700 text-sm">Sélectionnez un ou plusieurs conducteurs et proposez-leur un tarif. Ils pourront accepter ou refuser.</p>

                {offresForm.map((o, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-700 text-sm">Conducteur {i+1}</p>
                      {offresForm.length > 1 && (
                        <button onClick={() => setOffresForm(f => f.filter((_,j) => j !== i))}
                          className="text-red-500 text-xs hover:text-red-700">Supprimer</button>
                      )}
                    </div>
                    <select value={o.conducteurId} onChange={e => setOffresForm(f => f.map((x,j) => j===i ? {...x,conducteurId:e.target.value} : x))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500">
                      <option value="">Choisir un conducteur...</option>
                      {conducteurs.map(c => <option key={c._id} value={c._id}>{c.name} — {c.city} — {c.phone}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" placeholder="Tarif/jour (FCFA)" value={o.tarifjour}
                        onChange={e => setOffresForm(f => f.map((x,j) => j===i ? {...x,tarifjour:e.target.value} : x))}
                        className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/>
                      <input type="text" placeholder="Message (optionnel)" value={o.message}
                        onChange={e => setOffresForm(f => f.map((x,j) => j===i ? {...x,message:e.target.value} : x))}
                        className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/>
                    </div>
                  </div>
                ))}

                <button onClick={() => setOffresForm(f => [...f, { conducteurId:'', tarifjour:'', message:'' }])}
                  className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100">
                  ➕ Ajouter un autre conducteur
                </button>

                <div className="flex gap-2">
                  <button onClick={() => handleEnvoyerOffres(d._id)}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">
                    ✅ Envoyer les offres
                  </button>
                  <button onClick={() => setShowOffres(null)}
                    className="px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm">
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
