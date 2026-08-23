import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const STATUTS = {
  en_attente:           { bg:'#FFF7ED', text:'#EA580C', label:'⏳ En attente', desc:'Votre demande est en cours de traitement par B.Y.H' },
  en_traitement:        { bg:'#EFF6FF', text:'#2563EB', label:'🔍 En traitement', desc:'B.Y.H recherche un conducteur pour vous' },
  conducteur_propose:   { bg:'#F0FDF4', text:'#16A34A', label:'👷 Conducteur proposé', desc:'B.Y.H vous a trouvé un conducteur' },
  contrat_client:       { bg:'#FDF4FF', text:'#9333EA', label:'📄 Contrat à signer', desc:'Votre contrat est prêt — veuillez le valider' },
  valide_client:        { bg:'#F0FDF4', text:'#16A34A', label:'✅ Contrat validé', desc:'Contrat validé — en attente du conducteur' },
  contrat_conducteur:   { bg:'#EFF6FF', text:'#2563EB', label:'📋 Contrat conducteur', desc:'Le conducteur signe son contrat' },
  en_cours:             { bg:'#F0FDF4', text:'#16A34A', label:'🏗️ En cours', desc:'Votre chantier est suivi par le conducteur' },
  terminee:             { bg:'#F8FAFC', text:'#64748B', label:'✅ Terminé', desc:'Mission terminée' },
  annulee:              { bg:'#FFF1F2', text:'#E11D48', label:'❌ Annulé', desc:'Mission annulée' },
};

export default function DemandeConducteur() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    titreChantier:'', description:'', localisation:'', ville:'',
    typeChantier:'construction', dateDebut:'', dateFin:'',
    superficie:'', budgetChantier:'', budgetPropose:''
  });

  const loadDemandes = () => {
    api.get('/conducteur-travaux/mes-demandes')
      .then(res => setDemandes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDemandes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDemandes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/conducteur-travaux/demandes', form);
      setSuccess('✅ Demande envoyée ! L\'équipe B.Y.H va vous contacter sous 24h.');
      setShowForm(false);
      setForm({ titreChantier:'', description:'', localisation:'', ville:'', typeChantier:'construction', dateDebut:'', dateFin:'', superficie:'', budgetChantier:'', budgetPropose:'' });
      loadDemandes();
    } catch(err) {
      alert(err.response?.data?.message || 'Erreur');
    } finally { setSubmitting(false); }
  };

  const handleValiderContrat = async (demandeId) => {
    if (!window.confirm('Confirmer la validation du contrat ?')) return;
    try {
      await api.put(`/conducteur-travaux/demandes/${demandeId}/valider-contrat`);
      loadDemandes();
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="py-16 relative overflow-hidden" style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                Suivi professionnel à distance
              </div>
              <h1 className="text-4xl font-display font-black mb-2">🏗️ Conducteur de Travaux</h1>
              <p className="text-blue-200 max-w-lg">Faites suivre vos chantiers par un professionnel qualifié. Recevez des rapports quotidiens avec photos depuis n'importe où.</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex-shrink-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg hover:scale-105">
              ➕ Demander un conducteur
            </button>
          </div>

          {/* Avantages */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon:'📸', label:'Photos quotidiennes' },
              { icon:'📊', label:'Rapports hebdo' },
              { icon:'🌍', label:'Suivi à distance' },
              { icon:'✅', label:'Conducteur vérifié' },
            ].map((a,i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-white text-sm font-semibold">{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-semibold">
            {success}
          </div>
        )}

        {loading ? <Loader/> : demandes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune demande</h3>
            <p className="text-gray-400 mb-6">Vous n'avez pas encore demandé de conducteur de travaux</p>
            <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
              Faire une demande →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Mes demandes ({demandes.length})</h2>
            {demandes.map(d => {
              const statut = STATUTS[d.statut] || STATUTS.en_attente;
              return (
                <div key={d._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{d.titreChantier}</h3>
                      <p className="text-gray-500 text-sm mt-1">📍 {d.localisation} — {d.ville}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{background: statut.bg, color: statut.text}}>
                        {statut.label}
                      </span>
                      <p className="text-gray-400 text-xs mt-1">{statut.desc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Type</p>
                      <p className="font-semibold capitalize">{d.typeChantier}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Date début</p>
                      <p className="font-semibold">{d.dateDebut ? new Date(d.dateDebut).toLocaleDateString('fr-FR') : '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Avancement</p>
                      <p className="font-semibold text-blue-600">{d.avancementGlobal || 0}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Rapports</p>
                      <p className="font-semibold">{d.nombreRapports || 0}</p>
                    </div>
                  </div>

                  {/* Conducteur proposé */}
                  {d.conducteurPropose && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                      <p className="font-bold text-green-800 mb-1">👷 Conducteur proposé par B.Y.H</p>
                      <p className="text-green-700">{d.conducteurPropose.name}</p>
                      {d.budgetFinal && <p className="text-green-600 text-sm">Tarif : {new Intl.NumberFormat('fr-FR').format(d.budgetFinal)} FCFA/jour</p>}
                      {d.messagePropositon && <p className="text-green-700 text-sm mt-1 italic">"{d.messagePropositon}"</p>}
                    </div>
                  )}

                  {/* Barre avancement */}
                  {d.statut === 'en_cours' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Avancement global</span>
                        <span className="font-bold text-blue-600">{d.avancementGlobal || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 rounded-full h-3 transition-all" style={{width:`${d.avancementGlobal || 0}%`}}/>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 border-t border-gray-100 flex-wrap">
                    {d.statut === 'en_cours' && (
                      <Link to={`/conducteur-travaux/chantier/${d._id}`}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm text-center hover:bg-blue-700">
                        📊 Voir les rapports →
                      </Link>
                    )}
                    {d.statut === 'contrat_client' && (
                      <button onClick={() => handleValiderContrat(d._id)}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
                        ✅ Valider le contrat
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">🏗️ Demander un conducteur</h2>
                <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white text-2xl">×</button>
              </div>
              <p className="text-blue-200 text-sm mt-1">B.Y.H vous trouvera un conducteur qualifié sous 24h</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Titre du chantier *</label>
                <input type="text" required value={form.titreChantier} onChange={e=>setForm(f=>({...f,titreChantier:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Construction villa R+1 Yaoundé"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
                <textarea required value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none" rows={3}
                  placeholder="Décrivez les travaux à surveiller, vos attentes..."/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ville *</label>
                  <input type="text" required value={form.ville} onChange={e=>setForm(f=>({...f,ville:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Ex: Yaoundé"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type de chantier</label>
                  <select value={form.typeChantier} onChange={e=>setForm(f=>({...f,typeChantier:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
                    <option value="construction">Construction</option>
                    <option value="renovation">Rénovation</option>
                    <option value="amenagement">Aménagement</option>
                    <option value="gros_oeuvre">Gros œuvre</option>
                    <option value="finition">Finition</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Adresse exacte *</label>
                <input type="text" required value={form.localisation} onChange={e=>setForm(f=>({...f,localisation:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Quartier Bastos, Rue des Fleurs"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date début *</label>
                  <input type="date" required value={form.dateDebut} onChange={e=>setForm(f=>({...f,dateDebut:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date fin prévue</label>
                  <input type="date" value={form.dateFin} onChange={e=>setForm(f=>({...f,dateFin:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Superficie (m²)</label>
                  <input type="text" value={form.superficie} onChange={e=>setForm(f=>({...f,superficie:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Ex: 200 m²"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Budget conducteur/jour (FCFA)</label>
                  <input type="number" value={form.budgetPropose} onChange={e=>setForm(f=>({...f,budgetPropose:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Ex: 15000"/>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-bold mb-1">📋 Comment ça marche ?</p>
                <ol className="space-y-1 text-xs">
                  <li>1. Vous soumettez cette demande</li>
                  <li>2. B.Y.H trouve un conducteur qualifié sous 24h</li>
                  <li>3. Vous recevez et signez le contrat</li>
                  <li>4. Le conducteur visite le chantier et envoie des rapports quotidiens</li>
                </ol>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg">
                {submitting ? '⏳ Envoi...' : '🚀 Soumettre la demande'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
