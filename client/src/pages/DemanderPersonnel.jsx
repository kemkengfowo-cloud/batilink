import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { VILLES } from '../utils/helpers';

const TYPES_PERSONNEL = [
  'Coffreur', 'Ferrailleur', 'Macon', 'Dalleur',
  'Carreleur', 'Peintre', 'Electricien', 'Plombier',
  'Menuisier', 'Soudeur', 'Conducteur d engins', 'Autre'
];

export default function DemanderPersonnel() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    typePersonnel: [],
    nombrePersonnes: 1,
    ville: '',
    adresseChantier: '',
    dateDebut: '',
    dateFin: '',
    description: '',
    budgetPropose: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const toggleType = (type) => {
    setForm(f => ({
      ...f,
      typePersonnel: f.typePersonnel.includes(type)
        ? f.typePersonnel.filter(t => t !== type)
        : [...f.typePersonnel, type]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (!form.typePersonnel.length) {
        setError('Selectionnez au moins un type de personnel.');
        setLoading(false); return;
      }
      const res = await api.post('/demandes-personnel', {
        ...form,
        budgetPropose: parseInt(form.budgetPropose),
        nombrePersonnes: parseInt(form.nombrePersonnes)
      });
      toast.success('Demande soumise ! L admin vous contactera bientot.');
      navigate('/demandes-personnel');
    } catch(err) { toast.error(err.response?.data?.message || 'Erreur lors de la demande');
    setError(err.response?.data?.message || 'Erreur lors de la demande'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-10">
        <div className="max-w-3xl mx-auto px-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-6 font-medium">
            ← Retour
          </Link>
          <h1 className="text-3xl font-display font-black text-white mb-2">Demander du personnel</h1>
          <p className="text-blue-200">L'admin B.Y.H selectionne les meilleurs techniciens pour votre chantier</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Info processus */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">👷</div>
            <div>
              <h3 className="font-display font-bold text-gray-900 mb-2">Comment ca fonctionne ?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">1.</span> Vous decrivez votre besoin et proposez un budget</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">2.</span> L'admin B.Y.H selectionne les techniciens disponibles</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">3.</span> Negociation du prix si necessaire</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">4.</span> Accord trouve → contrat officiel genere et signe</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">5.</span> Les techniciens arrivent sur votre chantier</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Type de personnel */}
            <div>
              <label className={labelCls}>Type de personnel requis * (selection multiple)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TYPES_PERSONNEL.map(t => (
                  <button key={t} type="button" onClick={() => toggleType(t)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${form.typePersonnel.includes(t) ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
              {form.typePersonnel.length > 0 && (
                <p className="text-blue-600 text-sm mt-2 font-semibold">
                  Selectionne: {form.typePersonnel.join(', ')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre de personnes *</label>
                <input type="number" min="1" max="50" required value={form.nombrePersonnes}
                  onChange={e => set('nombrePersonnes', e.target.value)} className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>Ville du chantier *</label>
                <select required value={form.ville} onChange={e => set('ville', e.target.value)} className={inputCls}>
                  <option value="">Selectionner</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Adresse exacte du chantier</label>
              <input type="text" value={form.adresseChantier} onChange={e => set('adresseChantier', e.target.value)}
                className={inputCls} placeholder="Quartier, rue, repere..."/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date de debut *</label>
                <input type="date" required value={form.dateDebut}
                  onChange={e => set('dateDebut', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>Date de fin *</label>
                <input type="date" required value={form.dateFin}
                  onChange={e => set('dateFin', e.target.value)}
                  min={form.dateDebut || new Date().toISOString().split('T')[0]} className={inputCls}/>
              </div>
            </div>

            <div>
              <label className={labelCls}>Description des travaux</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Decrivez les travaux a realiser, les competences specifiques requises..."/>
            </div>

            {/* Budget */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Budget propose (FCFA) *
              </label>
              <input type="number" required min="0" value={form.budgetPropose}
                onChange={e => set('budgetPropose', e.target.value)}
                className={inputCls} placeholder="Ex: 50000"/>
              <p className="text-amber-700 text-xs mt-2">
                💡 Ce montant est une proposition. L'admin et les techniciens peuvent negocier.
                B.Y.H prend une commission de 10% sur le montant final.
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-blue-600/20">
              {loading ? 'Envoi...' : 'Soumettre la demande'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
