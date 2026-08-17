import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';
import { VILLES } from '../utils/helpers';

const TYPES_PERSONNEL = [
  'Coffreur','Ferrailleur','Macon','Dalleur',
  'Carreleur','Peintre','Electricien','Plombier',
  'Menuisier','Soudeur','Conducteur d engins','Autre'
];

const STATUT = {
  en_attente:     { label:'En attente admin', color:'bg-yellow-50 text-yellow-700', icon:'⏳' },
  en_negociation: { label:'En negociation', color:'bg-blue-50 text-blue-700', icon:'💬' },
  accord_trouve:  { label:'Accord trouve', color:'bg-green-50 text-green-700', icon:'✅' },
  contrat_genere: { label:'Contrat genere', color:'bg-purple-50 text-purple-700', icon:'📄' },
  en_cours:       { label:'Mission en cours', color:'bg-indigo-50 text-indigo-700', icon:'🔨' },
  termine:        { label:'Termine', color:'bg-gray-100 text-gray-600', icon:'✓' },
  annulee:        { label:'Annulee', color:'bg-red-50 text-red-700', icon:'❌' },
};

export default function DemandePersonnelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get(`/demandes-personnel/${id}`)
      .then(res => {
        setDemande(res.data);
        setForm({
          typePersonnel: res.data.typePersonnel || [],
          nombrePersonnes: res.data.nombrePersonnes || 1,
          ville: res.data.ville || '',
          adresseChantier: res.data.adresseChantier || '',
          dateDebut: res.data.dateDebut?.split('T')[0] || '',
          dateFin: res.data.dateFin?.split('T')[0] || '',
          description: res.data.description || '',
          budgetPropose: res.data.budgetPropose || ''
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleType = (type) => {
    setForm(f => ({
      ...f,
      typePersonnel: f.typePersonnel?.includes(type)
        ? f.typePersonnel.filter(t => t !== type)
        : [...(f.typePersonnel || []), type]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/demandes-personnel/${id}`, {
        ...form,
        budgetPropose: parseInt(form.budgetPropose),
        nombrePersonnes: parseInt(form.nombrePersonnes)
      });
      setDemande(res.data);
      setEditing(false);
      setMessage('Demande mise a jour !');
      setTimeout(() => setMessage(''), 3000);
    } catch(err) {
      setMessage(err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleAnnuler = async () => {
    if (!window.confirm('Annuler cette demande ?')) return;
    try {
      await api.put(`/demandes-personnel/${id}/annuler`);
      navigate('/demandes-personnel');
    } catch(err) { setMessage('Erreur'); }
  };

  if (loading) return <Loader/>;
  if (!demande) return <div className="text-center py-20 text-gray-500">Demande non trouvee.</div>;

  const isEntreprise = user?._id === demande.entreprise?._id || user?.id === demande.entreprise?._id;
  const isAdmin = user?.role === 'admin';
  const peutModifier = isEntreprise && demande.statut === 'en_attente';
  const statut = STATUT[demande.statut];
  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/demandes-personnel" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-4 font-medium">
            ← Retour aux demandes
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-display font-black text-white">
                {demande.nombrePersonnes} {demande.typePersonnel?.join(', ')} — {demande.ville}
              </h1>
              <p className="text-blue-300 mt-1">{formatDate(demande.dateDebut)} → {formatDate(demande.dateFin)}</p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${statut?.color}`}>
              {statut?.icon} {statut?.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {message && (
          <div className={`p-4 rounded-2xl font-semibold text-sm ${message.includes('Erreur') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Infos demande */}
        {!editing ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-gray-900 text-xl">Details de la demande</h2>
              {peutModifier && (
                <button onClick={() => setEditing(true)}
                  className="px-4 py-2 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50">
                  ✏️ Modifier
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Type de personnel</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {demande.typePersonnel?.map(t => (
                    <span key={t} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Nombre de personnes</p>
                <p className="font-bold text-gray-900">{demande.nombrePersonnes} personne(s)</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Ville</p>
                <p className="font-bold text-gray-900">📍 {demande.ville}</p>
              </div>
              {demande.adresseChantier && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Adresse chantier</p>
                  <p className="font-bold text-gray-900">{demande.adresseChantier}</p>
                </div>
              )}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Periode</p>
                <p className="font-bold text-gray-900">{formatDate(demande.dateDebut)} → {formatDate(demande.dateFin)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-400 mb-1">Budget propose</p>
                <p className="text-blue-700 font-bold text-xl">{formatBudget(demande.budgetPropose)}</p>
                {demande.budgetFinal && (
                  <p className="text-green-600 font-bold text-sm mt-1">Prix final: {formatBudget(demande.budgetFinal)}</p>
                )}
              </div>
            </div>
            {demande.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-gray-700 text-sm">{demande.description}</p>
              </div>
            )}
          </div>
        ) : (
          /* Formulaire modification */
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6">
            <h2 className="font-display font-bold text-gray-900 text-xl mb-5">Modifier la demande</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type de personnel</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES_PERSONNEL.map(t => (
                    <button key={t} type="button" onClick={() => toggleType(t)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${form.typePersonnel?.includes(t) ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de personnes</label>
                  <input type="number" min="1" value={form.nombrePersonnes}
                    onChange={e => setForm(f => ({...f, nombrePersonnes: e.target.value}))} className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ville</label>
                  <select value={form.ville} onChange={e => setForm(f => ({...f, ville: e.target.value}))} className={inputCls}>
                    <option value="">Selectionner</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date debut</label>
                  <input type="date" value={form.dateDebut}
                    onChange={e => setForm(f => ({...f, dateDebut: e.target.value}))} className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date fin</label>
                  <input type="date" value={form.dateFin}
                    onChange={e => setForm(f => ({...f, dateFin: e.target.value}))} className={inputCls}/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse chantier</label>
                <input type="text" value={form.adresseChantier}
                  onChange={e => setForm(f => ({...f, adresseChantier: e.target.value}))} className={inputCls}/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} rows={3}
                  onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  className={`${inputCls} resize-none`}/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget propose (FCFA)</label>
                <input type="number" value={form.budgetPropose}
                  onChange={e => setForm(f => ({...f, budgetPropose: e.target.value}))} className={inputCls}/>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Propositions de negociation */}
        {demande.propositions?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display font-bold text-gray-900 mb-4">Historique negociation</h2>
            <div className="space-y-3">
              {demande.propositions.map((p, i) => (
                <div key={i} className={`p-4 rounded-xl ${p.role === 'admin' ? 'bg-blue-50 border border-blue-100' : p.role === 'entreprise' ? 'bg-gray-50' : 'bg-green-50 border border-green-100'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase">{p.role}</span>
                    <span className="text-xs text-gray-400">{formatDate(p.date)}</span>
                  </div>
                  <p className="font-bold text-blue-600">{formatBudget(p.montant)}</p>
                  {p.message && <p className="text-gray-600 text-sm mt-1">{p.message}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {peutModifier && (
          <div className="text-center">
            <button onClick={handleAnnuler}
              className="px-5 py-2.5 text-red-500 border-2 border-red-200 rounded-xl text-sm font-semibold hover:bg-red-50">
              Annuler la demande
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
